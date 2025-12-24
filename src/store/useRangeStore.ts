
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RangeState {
    // State
    charts: Record<string, string[]>; // { 'chartId': ['AA', 'AKs'] }
    chartNames: Record<string, string>; // { 'chartId': 'Universal Open' }
    activeChartId: string | null;

    // Actions
    createChart: (name: string) => string;
    deleteChart: (chartId: string) => void;
    toggleHand: (chartId: string, handCombo: string) => void;
    setActiveChart: (chartId: string) => void;
    getCorrectAction: (chartId: string, handType: string) => 'raise' | 'fold';
    resetCharts: () => void; // debug
}

export const useRangeStore = create<RangeState>()(
    persist(
        (set, get) => ({
            charts: {
                'default_universal': ['AA', 'KK', 'QQ', 'AKs']
            },
            chartNames: {
                'default_universal': 'Universal Open'
            },
            activeChartId: 'default_universal',

            createChart: (name) => {
                const id = `chart_${Date.now()}`;
                set((state) => ({
                    charts: { ...state.charts, [id]: [] },
                    chartNames: { ...state.chartNames, [id]: name },
                    activeChartId: id
                }));
                return id;
            },

            deleteChart: (chartId) => {
                set((state) => {
                    const newCharts = { ...state.charts };
                    const newNames = { ...state.chartNames };
                    delete newCharts[chartId];
                    delete newNames[chartId];

                    // Fallback if active deleted
                    let newActive = state.activeChartId;
                    if (state.activeChartId === chartId) {
                        newActive = Object.keys(newNames)[0] || null;
                    }

                    return { charts: newCharts, chartNames: newNames, activeChartId: newActive };
                });
            },

            toggleHand: (chartId, handCombo) => {
                set((state) => {
                    const currentRange = state.charts[chartId] || [];
                    const exists = currentRange.includes(handCombo);

                    let newRange;
                    if (exists) {
                        newRange = currentRange.filter(h => h !== handCombo);
                    } else {
                        newRange = [...currentRange, handCombo];
                    }

                    return {
                        charts: { ...state.charts, [chartId]: newRange }
                    };
                });
            },

            setActiveChart: (chartId) => {
                set({ activeChartId: chartId });
            },

            getCorrectAction: (chartId, handType) => {
                const { charts } = get();
                const range = charts[chartId];
                if (!range) return 'fold'; // Safety

                return range.includes(handType) ? 'raise' : 'fold';
            },

            resetCharts: () => {
                set({
                    charts: {
                        'default_universal': ['AA', 'KK', 'QQ', 'AKs']
                    },
                    chartNames: {
                        'default_universal': 'Universal Open'
                    },
                    activeChartId: 'default_universal',
                });
            }
        }),
        {
            name: 'poker-lingo-ranges',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
