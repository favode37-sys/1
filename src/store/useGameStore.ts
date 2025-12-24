
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, HandScenario } from '../services/supabase';
import { generateInfiniteScenario } from '../services/HandGenerator';
import { soundManager } from '../services/SoundManager';

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
    showLevelUpModal: boolean;

    // Actions
    fetchScenario: () => Promise<void>;
    submitAction: (action: 'fold' | 'call' | 'raise') => void;
    closeLevelUpModal: () => void;
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
            showLevelUpModal: false,

            fetchScenario: async () => {
                set({ loading: true, feedback: null });
                console.log('🔄 Fetching scenario...');

                // Play Deal Sound
                soundManager.play('bet');

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
                    // PLAY CORRECT SOUND
                    soundManager.play('correct');

                    // XP Calculation
                    const xpGain = 50 + (streak * 10);
                    let newXp = xp + xpGain;
                    let newLevel = level;
                    let newXpToNextLevel = xpToNextLevel;
                    let leveledUp = false;

                    // Level Up Logic
                    if (newXp >= xpToNextLevel) {
                        newLevel += 1;
                        newXpToNextLevel = newLevel * 500; // Formula: Next Level * 500
                        leveledUp = true;
                        console.log(`🎉 LEVEL UP! Now Level ${newLevel}`);
                        soundManager.play('levelup');
                    }

                    set({
                        stack: stack + 50 + (streak * 10),
                        score: score + 100,
                        streak: streak + 1,
                        xp: newXp,
                        level: newLevel,
                        xpToNextLevel: newXpToNextLevel,
                        feedback: 'correct',
                        showLevelUpModal: leveledUp
                    });
                } else {
                    // PLAY WRONG SOUND
                    soundManager.play('wrong');

                    const penalty = 200;
                    const newStack = stack - penalty;
                    const isBusted = newStack <= 0;

                    set({
                        stack: Math.max(0, newStack),
                        streak: 0,
                        feedback: 'wrong',
                        isBankrupt: isBusted
                    });
                }
            },

            closeLevelUpModal: () => set({ showLevelUpModal: false }),

            refillStack: () => {
                console.log('💰 Refill Success');
                set({
                    stack: 1000,
                    streak: 0,
                    isBankrupt: false,
                    feedback: null // Clear accidental wrong feedback to proceed
                });
                get().nextHand();
            },

            nextHand: () => {
                const { isBankrupt } = get();
                if (isBankrupt) return; // Block next hand if bankrupt
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
                    feedback: null,
                    showLevelUpModal: false,
                    isBankrupt: false
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
