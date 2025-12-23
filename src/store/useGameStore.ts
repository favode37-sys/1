
import { create } from 'zustand';
import { supabase, HandScenario } from '../services/supabase';
import { generateInfiniteScenario } from '../services/HandGenerator';

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
        console.log('🔄 Fetching scenario...');

        try {
            // 1. Try to fetch from Supabase (Tier 1)
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

            throw new Error("DB Empty or Error");
        } catch (e) {
            console.log('⚠️ Offline/DB Error. Using Infinite Generator.');

            // 2. Fallback to Infinite Generator (Tier 2)
            await new Promise(r => setTimeout(r, 400)); // Sim delay
            const nextScenario = generateInfiniteScenario();

            set({
                currentScenario: nextScenario,
                loading: false
            });
        }
    },

    submitAction: (action) => {
        const { currentScenario, stack, score, streak } = get();
        if (!currentScenario) return;

        console.log(`👉 Action: ${action} | Correct: ${currentScenario.correct_action}`);
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
        console.log('⏭️ Next Hand');
        get().fetchScenario();
    },

    resetGame: () => {
        set({ stack: 1000, score: 0, streak: 0, feedback: null });
        get().fetchScenario();
    }
}));
