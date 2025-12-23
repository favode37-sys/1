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
            const { count } = await supabase
                .from('hand_scenarios')
                .select('*', { count: 'exact', head: true });

            if (count) {
                const randomOffset = Math.floor(Math.random() * count);
                const { data, error } = await supabase
                    .from('hand_scenarios')
                    .select('*')
                    .range(randomOffset, randomOffset)
                    .maybeSingle();

                if (error) {
                    console.error('Error fetching scenario:', error);
                    set({ loading: false });
                    return;
                }

                if (data) {
                    set({ currentScenario: data as HandScenario, loading: false, feedback: null });
                }
            } else {
                console.warn("No scenarios found in DB");
                set({ loading: false });
            }

        } catch (e) {
            console.error(e);
            set({ loading: false });
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
