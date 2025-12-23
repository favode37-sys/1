import { create } from 'zustand';
import { supabase, HandScenario } from '../services/supabase';

// --- FALLBACK DATA (OFFLINE MODE) ---
const FALLBACK_SCENARIOS: HandScenario[] = [
    {
        id: 'fallback-1',
        difficulty: 'easy',
        correct_action: 'fold',
        chip_explanation: "7-2 разномастные — это мусор. В ранней позиции мы всегда это сбрасываем. Не трать фишки!",
        context: {
            holeCards: [{ rank: '7', suit: 'hearts' }, { rank: '2', suit: 'clubs' }],
            communityCards: [],
            potSize: 10,
            position: 'UTG'
        }
    },
    {
        id: 'fallback-2',
        difficulty: 'medium',
        correct_action: 'raise',
        chip_explanation: "У тебя карманные Короли (KK)! Это монстр-рука. Нужно повышать ставки, чтобы раздуть банк.",
        context: {
            holeCards: [{ rank: 'K', suit: 'diamonds' }, { rank: 'K', suit: 'spades' }],
            communityCards: [{ rank: '9', suit: 'hearts' }, { rank: '5', suit: 'clubs' }, { rank: '2', suit: 'diamonds' }],
            potSize: 50,
            position: 'BTN'
        }
    },
    {
        id: 'fallback-3',
        difficulty: 'hard',
        correct_action: 'call',
        chip_explanation: "У тебя натсовое флеш-дро. Шансы банка позволяют нам уравнять ставку и посмотреть терн.",
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
        set({ loading: true, feedback: null });
        try {
            // 1. Try to fetch from Supabase
            const { count } = await supabase
                .from('hand_scenarios')
                .select('*', { count: 'exact', head: true });

            if (count && count > 0) {
                const randomOffset = Math.floor(Math.random() * count);
                const { data, error } = await supabase
                    .from('hand_scenarios')
                    .select('*')
                    .range(randomOffset, randomOffset)
                    .maybeSingle();

                if (data && !error) {
                    // Helper to ensure JSON is parsed correctly if it comes as string (rare but possible)
                    const parsedContext = typeof data.context === 'string'
                        ? JSON.parse(data.context)
                        : data.context;

                    set({
                        currentScenario: { ...data, context: parsedContext } as HandScenario,
                        loading: false
                    });
                    return;
                }
            }

            throw new Error("No data in DB"); // Trigger fallback
        } catch (e) {
            console.log('⚠️ Network/DB Error or Empty DB. Using Fallback Data.');
            // 2. FALLBACK LOGIC
            const randomFallback = FALLBACK_SCENARIOS[Math.floor(Math.random() * FALLBACK_SCENARIOS.length)];
            set({
                currentScenario: randomFallback,
                loading: false
            });
        }
    },

    submitAction: (action) => {
        const { currentScenario, stack, score, streak } = get();
        if (!currentScenario) return;

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
        get().fetchScenario();
    },

    resetGame: () => {
        set({ stack: 1000, score: 0, streak: 0, feedback: null });
        get().fetchScenario();
    }
}));
