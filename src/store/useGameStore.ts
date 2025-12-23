import { create } from 'zustand';
import { supabase, HandScenario } from '../services/supabase';

// Helper to generate mock cards
const CARDS = [
    { rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'hearts' }, { rank: 'Q', suit: 'diamonds' },
    { rank: 'J', suit: 'clubs' }, { rank: '10', suit: 'spades' }, { rank: '9', suit: 'hearts' },
    { rank: '2', suit: 'diamonds' }, { rank: '7', suit: 'clubs' }
] as const;

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

// FALLBACK DATA (Offline Mode)
const FALLBACK_SCENARIOS: HandScenario[] = [
    {
        id: 'fb_1',
        context: {
            holeCards: [{ rank: 'A', suit: 'spades' }, { rank: 'K', suit: 'hearts' }],
            communityCards: [{ rank: 'Q', suit: 'spades' }, { rank: 'J', suit: 'spades' }, { rank: '10', suit: 'spades' }],
            potSize: 200
        },
        correct_action: 'raise',
        chip_explanation: 'Royal Flush! Do not slow play this on a wet board.',
        difficulty: 'easy'
    },
    {
        id: 'fb_2',
        context: {
            holeCards: [{ rank: '7', suit: 'clubs' }, { rank: '2', suit: 'diamonds' }],
            communityCards: [{ rank: 'A', suit: 'hearts' }, { rank: 'A', suit: 'diamonds' }, { rank: 'K', suit: 'clubs' }],
            potSize: 50
        },
        correct_action: 'fold',
        chip_explanation: '7-2 offsuit on a board that smashes opponent ranges. Fold.',
        difficulty: 'easy'
    },
    {
        id: 'fb_3',
        context: {
            holeCards: [{ rank: '10', suit: 'hearts' }, { rank: '9', suit: 'hearts' }],
            communityCards: [{ rank: '8', suit: 'hearts' }, { rank: '7', suit: 'hearts' }, { rank: '2', suit: 'spades' }],
            potSize: 150
        },
        correct_action: 'call',
        chip_explanation: 'Straight Flush Draw. Implied odds justify a call.',
        difficulty: 'medium'
    }
];

export const useGameStore = create<GameState>((set, get) => ({
    stack: 1000,
    score: 0,
    streak: 0,
    currentScenario: null,
    loading: false,
    feedback: null,

    fetchScenario: async () => {
        set({ loading: true });

        try {
            // First, get count for random selection
            const { count, error: countError } = await supabase
                .from('hand_scenarios')
                .select('*', { count: 'exact', head: true });

            // Check for connection error or empty DB
            if (countError || count === null || count === 0) {
                throw new Error('Offline or Empty DB');
            }

            if (count) {
                const randomOffset = Math.floor(Math.random() * count);
                const { data, error } = await supabase
                    .from('hand_scenarios')
                    .select('*')
                    .range(randomOffset, randomOffset)
                    .maybeSingle();

                if (error || !data) {
                    throw error || new Error('No data returned');
                }

                set({ currentScenario: data as HandScenario, loading: false, feedback: null });
            }

        } catch (e) {
            console.log('⚠️ Using Fallback Data (Offline Mode)'); // Requested log
            // Simulate delay for feel
            await new Promise(r => setTimeout(r, 500));

            const randomFallback = FALLBACK_SCENARIOS[Math.floor(Math.random() * FALLBACK_SCENARIOS.length)];
            set({ currentScenario: randomFallback, loading: false, feedback: null });
        }
    },

    submitAction: (action) => {
        const { currentScenario, stack, score, streak } = get();
        if (!currentScenario) return;

        const isCorrect = action === currentScenario.correct_action;

        if (isCorrect) {
            set({
                stack: stack + 50 + (streak * 10), // Bonus for streak
                score: score + 100,
                streak: streak + 1,
                feedback: 'correct'
            });
        } else {
            set({
                stack: Math.max(0, stack - 200), // Punishment
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
