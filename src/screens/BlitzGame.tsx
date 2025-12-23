
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, SafeAreaView, Dimensions, Platform } from 'react-native';
import { useGameStore } from '../store/useGameStore';
import { JuicyButton } from '../components/JuicyButton';
import { StackDisplay } from '../components/StackDisplay';
import { ChipMascot } from '../components/ChipMascot';
import { PokerTable } from '../components/PokerTable';
import { PokerCard } from '../components/PokerCard';
import { ActionButtons } from '../components/ActionButtons';
import { LevelHeader } from '../components/LevelHeader';
import { LevelUpModal } from '../components/LevelUpModal';
import { SpeechBubble } from '../components/SpeechBubble';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import Animated, { FadeIn, SlideInDown, ZoomIn } from 'react-native-reanimated';

export const BlitzGame = () => {
    const {
        stack,
        score,
        xp,
        level,
        xpToNextLevel,
        currentScenario,
        feedback,
        loading,
        showLevelUpModal,
        fetchScenario,
        submitAction,
        nextHand,
        closeLevelUpModal
    } = useGameStore();

    const [chipMessage, setChipMessage] = useState<string | null>(null);

    useEffect(() => {
        // Initial fetch
        fetchScenario();
    }, []);

    // React to feedback for Chip's voice
    useEffect(() => {
        if (feedback === 'correct') {
            const praises = ["Nice!", "GTO!", "Solid!", "Boom!", "Correct!"];
            const randomPraise = praises[Math.floor(Math.random() * praises.length)];
            setChipMessage(randomPraise);

            // Celebration Timer
            const timer = setTimeout(() => {
                setChipMessage(null); // Clear message
                nextHand();
            }, 1500);
            return () => clearTimeout(timer);
        } else if (feedback === 'wrong') {
            const warnings = ["Ouch!", "Bad Odds!", "Mistake!", "-EV"];
            const randomWarning = warnings[Math.floor(Math.random() * warnings.length)];
            setChipMessage(randomWarning);
            // Don't auto-clear immediately, let the overlay take over context logic
        } else {
            setChipMessage(null);
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
            {/* PROGRESSION HEADER */}
            <LevelHeader level={level} xp={xp} xpToNextLevel={xpToNextLevel} />

            {/* GAME STATUS (Stack) */}
            <View style={{ alignItems: 'center', marginTop: SPACING.sm, zIndex: 10 }}>
                <StackDisplay amount={stack} damage={feedback === 'wrong'} />
                <Text style={{ fontSize: 8, color: '#666', marginTop: 2 }}>
                    ID: {currentScenario.id}
                </Text>
            </View>

            {/* GAME AREA - ABSOLUTE LAYOUT */}
            <View style={styles.gameArea} key={currentScenario.id}>

                {/* 1. TABLE (Centered) */}
                <PokerTable
                    communityCards={context.communityCards as any}
                    potSize={context.potSize}
                />

                {/* 2. MASCOT & SPEECH BUBBLE (Floating) */}
                <View style={styles.mascotContainer}>
                    <ChipMascot mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'shocked' : 'neutral'} />
                    {chipMessage && <SpeechBubble message={chipMessage} />}
                </View>

                {/* 3. HERO HAND (Overlaid at Bottom Center) */}
                <View style={styles.heroHandOverlay}>
                    {context.holeCards.map((card: any, idx: number) => (
                        <View key={idx} style={[
                            styles.heroCardWrapper,
                            {
                                transform: [
                                    { rotate: idx === 0 ? '-5deg' : '5deg' },
                                    { translateY: idx === 0 ? 0 : 5 }
                                ]
                            }
                        ]}>
                            <PokerCard rank={card.rank} suit={card.suit} />
                        </View>
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

            {/* FEEDBACK OVERLAY */}
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

            {/* LEVEL UP MODAL */}
            <LevelUpModal
                visible={showLevelUpModal}
                level={level}
                onClose={closeLevelUpModal}
            />
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
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
    },
    mascotContainer: {
        position: 'absolute',
        top: 20,
        left: 20,
        zIndex: 5,
        // No scale here to keep Bubble crisp, scale Mascot inside logic if needed or just use default size
    },
    heroHandOverlay: {
        position: 'absolute',
        bottom: 80,
        flexDirection: 'row',
        gap: -10,
        zIndex: 20,
    },
    heroCardWrapper: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
        transform: [{ scale: 1.1 }]
    },

    controls: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xxl,
        zIndex: 30,
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
