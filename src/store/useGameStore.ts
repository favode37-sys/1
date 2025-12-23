import { create } from 'zustand';
import { supabase, HandScenario } from '../services/supabase';

// --- FALLBACK DATA (ROBUST OFFLINE MODE) ---
const FALLBACK_SCENARIOS: HandScenario[] = [
    {
        id: 'fb_1',
        difficulty: 'easy',
        correct_action: 'fold',
        chip_explanation: "7-2 разномастные (72o) — это худшая рука в покере. Фолдим без сожалений!",
        context: {
            holeCards: [{ rank: '7', suit: 'hearts' }, { rank: '2', suit: 'clubs' }],
            communityCards: [],
            potSize: 10,
            position: 'UTG'
        }
    },
    {
        id: 'fb_2',
        difficulty: 'medium',
        correct_action: 'raise',
        chip_explanation: "Карманные Короли (KK)! Это премиум-рука. Обязательно повышаем.",
        context: {
            holeCards: [{ rank: 'K', suit: 'diamonds' }, { rank: 'K', suit: 'spades' }],
            communityCards: [{ rank: '9', suit: 'hearts' }, { rank: '5', suit: 'clubs' }, { rank: '2', suit: 'diamonds' }],
            potSize: 50,
            position: 'BTN'
        }
    },
    {
        id: 'fb_3',
        difficulty: 'hard',
        correct_action: 'call',
        chip_explanation: "У нас Флеш-дро (не хватает 1 карты до флеша). Шансы банка хорошие, коллируем.",
        context: {
            holeCards: [{ rank: 'A', suit: 'hearts' }, { rank: '5', suit: 'hearts' }],
            communityCards: [{ rank: 'K', suit: 'hearts' }, { rank: 'J', suit: 'spades' }, { rank: '2', suit: 'hearts' }],
            potSize: 120,
            position: 'BB'
        }
    }
];

interface GameState {
    stack: number;
    score: number;
    streak: number;
    currentScenario: HandScenario | null;
    loading: boolean;
    feedback: 'correct' | 'wrong' | null;

    fetchScenario: () => Promise<void>;
    submitAction: (action: 'fold' | 'call' | 'raise') => void;
    resetGame: () => void;
    nextHand: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    stack: 1000,
    score: 0,
    streak: 0,
    currentScenario: null,
    loading: false,
    feedback: null,

    fetchScenario: async () => {
        const { currentScenario } = get();
        set({ loading: true, feedback: null });
        console.log('🔄 Fetching new scenario...');

        // --- DETERMINISTIC ROTATION (DEBUGGING) ---
        await new Promise(r => setTimeout(r, 300));

        let currentIndex = -1;
        if (currentScenario) {
            // Find current index (fix: ID format is 'fb_1_timestamp', so we use startsWith)
            currentIndex = FALLBACK_SCENARIOS.findIndex(s => currentScenario.id.startsWith(s.id));
        }

        const nextIndex = (currentIndex + 1) % FALLBACK_SCENARIOS.length;
        const baseScenario = FALLBACK_SCENARIOS[nextIndex];

        // Unique ID ensures React treats it as a new object
        const nextScenario = { ...baseScenario, id: `${baseScenario.id}_${Date.now()}` };

        console.log(`✅ Loaded Scenario: ${nextScenario.id} (Index: ${nextIndex})`);

        set({
            currentScenario: nextScenario,
            loading: false
        });
    },

    submitAction: (action) => {
        const { currentScenario, stack, score, streak } = get();
        if (!currentScenario) return;
        console.log(`👉 User Action: ${action} | Correct: ${currentScenario.correct_action}`);
        const isCorrect = action === currentScenario.correct_action;
        if (isCorrect) {
            set({
                stack: stack + 50 + (streak * 10),
                score: score + 100,
                streak: streak + 1,
                feedback: 'correct'
            });
        } else {
            set({
                stack: Math.max(0, stack - 200),
                streak: 0,
                feedback: 'wrong'
            });
        }
    },

    nextHand: () => {
        console.log('⏭️ Moving to next hand');
        get().fetchScenario();
    },

    resetGame: () => {
        set({ stack: 1000, score: 0, streak: 0, feedback: null });
        get().fetchScenario();
    }
}));
