
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, HandScenario } from '../services/supabase';
import { generateInfiniteScenario } from '../services/HandGenerator';

interface GameState {
    // Persisted State
    stack: number;
    score: number;
    streak: number;
    xp: number;
    level: number;
    xpToNextLevel: number;

    // Ephemeral State
    currentScenario: HandScenario | null;
    loading: boolean;
    feedback: 'correct' | 'wrong' | null;

    // Actions
    fetchScenario: () => Promise<void>;
    submitAction: (action: 'fold' | 'call' | 'raise') => void;
    resetGame: () => void;
    nextHand: () => void;
}

export const useGameStore = create<GameState>()(
    persist(
        (set, get) => ({
            stack: 1000,
            score: 0,
            streak: 0,
            xp: 0,
            level: 1,
            xpToNextLevel: 500,

            currentScenario: null,
            loading: false,
            feedback: null,

            fetchScenario: async () => {
                set({ loading: true, feedback: null });
                console.log('🔄 Fetching scenario...');

                try {
                    // 1. Tier 1: Supabase
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

                    throw new Error("DB Empty");
                } catch (e) {
                    console.log('⚠️ Using Generator (Offline Mode)');
                    // 2. Tier 2: Generator
                    await new Promise(r => setTimeout(r, 400));
                    const nextScenario = generateInfiniteScenario();

                    set({
                        currentScenario: nextScenario,
                        loading: false
                    });
                }
            },

            submitAction: (action) => {
                const { currentScenario, stack, score, streak, xp, level, xpToNextLevel } = get();
                if (!currentScenario) return;

                console.log(`👉 Action: ${action} | Correct: ${currentScenario.correct_action}`);
                const isCorrect = action === currentScenario.correct_action;

                if (isCorrect) {
                    // XP Calculation
                    const xpGain = 50 + (streak * 10);
                    let newXp = xp + xpGain;
                    let newLevel = level;
                    let newXpToNextLevel = xpToNextLevel;

                    // Level Up Logic
                    if (newXp >= xpToNextLevel) {
                        newLevel += 1;
                        newXpToNextLevel = newLevel * 500; // Formula: Next Level * 500
                        console.log(`🎉 LEVEL UP! Now Level ${newLevel}`);
                    }

                    set({
                        stack: stack + 50 + (streak * 10),
                        score: score + 100,
                        streak: streak + 1,
                        xp: newXp,
                        level: newLevel,
                        xpToNextLevel: newXpToNextLevel,
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
                set({
                    stack: 1000,
                    score: 0,
                    streak: 0,
                    xp: 0,
                    level: 1,
                    xpToNextLevel: 500,
                    feedback: null
                });
                get().fetchScenario();
            }
        }),
        {
            name: 'poker-lingo-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                stack: state.stack,
                score: state.score,
                streak: state.streak,
                xp: state.xp,
                level: state.level,
                xpToNextLevel: state.xpToNextLevel
            }),
        }
    )
);
