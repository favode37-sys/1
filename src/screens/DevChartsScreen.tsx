
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { useRangeStore } from '../store/useRangeStore';
import { generateGrid } from '../utils/pokerLogic';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { JuicyButton } from '../components/JuicyButton';

export const DevChartsScreen = () => {
    const router = useRouter();
    const { charts, activeChartId, toggleHand, chartNames } = useRangeStore();

    // Grid Data
    const grid = useMemo(() => generateGrid(), []);

    // Active Range
    const currentRange = activeChartId ? charts[activeChartId] : [];
    const chartName = activeChartId ? chartNames[activeChartId] : 'No Chart Selected';

    const handleToggle = (hand: string) => {
        if (activeChartId) {
            toggleHand(activeChartId, hand);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <Text style={styles.backText}>←</Text>
                </Pressable>
                <View>
                    <Text style={styles.title}>Range Editor</Text>
                    <Text style={styles.subtitle}>{chartName}</Text>
                </View>
                <View style={{ width: 40 }} />
            </View>

            {/* GRID CONTENT */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.gridContainer}>
                    {grid.map((row, rowIndex) => (
                        <View key={`row-${rowIndex}`} style={styles.row}>
                            {row.map((hand) => {
                                const isSelected = currentRange.includes(hand);
                                return (
                                    <Pressable
                                        key={hand}
                                        style={[
                                            styles.cell,
                                            isSelected ? styles.cellSelected : styles.cellUnselected
                                        ]}
                                        onPress={() => handleToggle(hand)}
                                    >
                                        <Text style={[
                                            styles.cellText,
                                            isSelected ? styles.textSelected : styles.textUnselected
                                        ]}>
                                            {hand}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    ))}
                </View>
            </ScrollView>

            {/* FOOTER */}
            <View style={styles.footer}>
                <Text style={{ color: '#666', marginBottom: 10 }}>
                    Tap to toggle hands. Green = Raise.
                </Text>
                <JuicyButton
                    title="Done"
                    onPress={() => router.back()}
                    variant="neutral"
                    style={{ width: '100%' }}
                />
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? 30 : 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
        backgroundColor: COLORS.surface,
    },
    backButton: {
        padding: 10,
    },
    backText: {
        color: COLORS.primary,
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: 12,
        textAlign: 'center',
    },
    scrollContent: {
        padding: SPACING.md,
        alignItems: 'center',
    },
    gridContainer: {
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
    },
    cell: {
        width: 26,
        height: 26,
        margin: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 2,
    },
    cellSelected: {
        backgroundColor: '#10B981', // Green
    },
    cellUnselected: {
        backgroundColor: '#374151', // Gray-700
    },
    cellText: {
        fontSize: 8,
        fontWeight: 'bold',
    },
    textSelected: {
        color: '#FFF',
    },
    textUnselected: {
        color: '#9CA3AF',
    },
    footer: {
        padding: SPACING.lg,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center'
    }
});
