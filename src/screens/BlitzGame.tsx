import React, { useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, SafeAreaView, Dimensions, Platform } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { JuicyButton } from '../components/JuicyButton';
import { StackDisplay } from '../components/StackDisplay';
import { ChipMascot } from '../components/ChipMascot';
import { PokerTable } from '../components/PokerTable';
import { PokerCard } from '../components/PokerCard';
import { ActionButtons } from '../components/ActionButtons';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const BlitzGame = () => {
    const {
        stack,
        score,
        currentScenario,
        feedback,
        loading,
        fetchScenario,
        submitAction,
        nextHand
    } = useGameStore();

    useEffect(() => {
        // Initial fetch
        fetchScenario();
    }, []);

    useEffect(() => {
        if (feedback === 'correct') {
            const timer = setTimeout(() => {
                nextHand();
            }, 1500); // 1.5s celebration
            return () => clearTimeout(timer);
        }
    }, [feedback]);

    if (loading || !currentScenario) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Dealing...</Text>
            </View>
        );
    }

    const { context } = currentScenario;

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <StackDisplay amount={stack} damage={feedback === 'wrong'} />
                <View style={styles.scoreContainer}>
                    <Text style={styles.scoreLabel}>STREAK</Text>
                    <Text style={styles.scoreValue}>{useGameStore.getState().streak}</Text>
                    {/* DEBUG INFO */}
                    <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                        ID: {currentScenario.id}
                    </Text>
                </View>
            </View>

            {/* GAME AREA - KEY FORCES RE-RENDER */}
            <View style={styles.gameArea} key={currentScenario.id}>
                {/* Mascot floats near the pot/table */}
                <View style={styles.mascotContainer}>
                    <ChipMascot mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'shocked' : 'neutral'} />
                </View>

                <PokerTable
                    communityCards={context.communityCards as any}
                    potSize={context.potSize}
                />

                {/* Hero Cards */}
                <View style={styles.heroHand}>
                    {context.holeCards.map((card: any, idx: number) => (
                        <PokerCard key={idx} rank={card.rank} suit={card.suit} />
                    ))}
                </View>
            </View>

            {/* CONTROLS */}
            <View style={styles.controls}>
                <ActionButtons
                    onFold={() => submitAction('fold')}
                    onCall={() => submitAction('call')}
                    onRaise={() => submitAction('raise')}
                    disabled={feedback !== null}
                />
            </View>

            {/* FEEDBACK OVERLAY (Only on Wrong) */}
            {feedback === 'wrong' && (
                <Animated.View entering={ZoomIn} style={styles.feedbackOverlay}>
                    <View style={styles.feedbackCard}>
                        <Text style={styles.feedbackTitle}>Oops!</Text>
                        <Text style={styles.feedbackText}>{currentScenario.chip_explanation}</Text>
                        <View style={{ height: 20 }} />
                        <JuicyButton title="CONTINUE" onPress={nextHand} variant="primary" />
                    </View>
                </Animated.View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        ...Platform.select({
            web: {
                maxWidth: 480,
                width: '100%',
                alignSelf: 'center',
                height: '100%',
                // React Native Web supports standard CSS shadow
                boxShadow: '0px 0px 50px rgba(0,0,0,0.5)',
            }
        })
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        color: COLORS.textSecondary,
        marginTop: SPACING.md,
        fontFamily: 'System',
        fontWeight: 'bold',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: SPACING.md,
        zIndex: 10,
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    scoreLabel: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '700',
    },
    scoreValue: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: 'bold',
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    mascotContainer: {
        marginBottom: -30, // Overlap slightly with table
        zIndex: 5,
    },
    heroHand: {
        flexDirection: 'row',
        marginTop: SPACING.xl,
    },
    controls: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
    },
    feedbackOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
        padding: SPACING.lg,
    },
    feedbackCard: {
        backgroundColor: COLORS.surface,
        padding: SPACING.xl,
        borderRadius: RADIUS.lg,
        width: '100%',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.secondary,
    },
    feedbackTitle: {
        color: COLORS.secondary,
        fontSize: 32,
        fontWeight: '900',
        marginBottom: SPACING.md,
    },
    feedbackText: {
        color: COLORS.text,
        fontSize: 18,
        textAlign: 'center',
        lineHeight: 24,
    }
});
