
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    runOnJS,
    withTiming,
    interpolate,
    Extrapolate
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useRangeStore } from '../store/useRangeStore';
import { getHandType, RANKS } from '../utils/pokerLogic';
import { Card, Suit, Rank } from '../services/HandGenerator';
import { PokerCard } from '../components/PokerCard';
import { JuicyButton } from '../components/JuicyButton';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { soundManager } from '../services/SoundManager';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
// RANKS imported from pokerLogic are string[], but HandGenerator types expect specific union.
// We cast for simplicity or ensure types match. 
// pokerLogic RANKS: ['A', 'K'...] matches Rank type strings.

export default function PreflopGame() {
    const router = useRouter();
    const { activeChartId, chartNames, getCorrectAction } = useRangeStore();

    const [currentHand, setCurrentHand] = useState<[Card, Card] | null>(null);
    const [streak, setStreak] = useState(0);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

    // Animation Values
    const translateX = useSharedValue(0);
    const cardScale = useSharedValue(1);
    const overlayOpacity = useSharedValue(0);

    const generateHand = useCallback(() => {
        const r1 = RANKS[Math.floor(Math.random() * RANKS.length)] as Rank;
        const r2 = RANKS[Math.floor(Math.random() * RANKS.length)] as Rank;
        const s1 = SUITS[Math.floor(Math.random() * SUITS.length)];
        // Ensure not same card
        let s2 = SUITS[Math.floor(Math.random() * SUITS.length)];
        if (r1 === r2 && s1 === s2) {
            s2 = s1 === 'hearts' ? 'spades' : 'hearts';
        }

        setCurrentHand([{ rank: r1, suit: s1 }, { rank: r2, suit: s2 }]);
    }, []);

    useEffect(() => {
        generateHand();
    }, []);

    const handleSwipe = (direction: 'left' | 'right') => {
        if (!currentHand || !activeChartId) return;

        const handType = getHandType(currentHand[0], currentHand[1]);
        const correctAction = getCorrectAction(activeChartId, handType); // 'raise' | 'fold'

        // Map direction to action
        // Left = Fold
        // Right = Raise
        const userAction = direction === 'left' ? 'fold' : 'raise';
        const isCorrect = userAction === correctAction;

        if (isCorrect) {
            soundManager.play('correct');
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            setStreak(s => s + 1);
            setFeedback('correct');
        } else {
            soundManager.play('wrong');
            if (Platform.OS !== 'web') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            setStreak(0);
            setFeedback('wrong');
        }

        // Reset and Next Hand
        setTimeout(() => {
            setFeedback(null);
            translateX.value = 0;
            generateHand();
            cardScale.value = withSequence(withTiming(0.9, { duration: 50 }), withTiming(1));
        }, 300);
    };

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            if (Math.abs(event.translationX) > SWIPE_THRESHOLD) {
                const direction = event.translationX > 0 ? 'right' : 'left';
                translateX.value = withSpring(direction === 'right' ? SCREEN_WIDTH : -SCREEN_WIDTH);
                runOnJS(handleSwipe)(direction);
            } else {
                translateX.value = withSpring(0);
            }
        });

    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { rotate: `${interpolate(translateX.value, [-SCREEN_WIDTH, 0, SCREEN_WIDTH], [-15, 0, 15])}deg` },
            { scale: cardScale.value }
        ]
    }));

    const feedbackStyle = useAnimatedStyle(() => ({
        backgroundColor: feedback === 'correct' ? '#10B981' : feedback === 'wrong' ? '#EF4444' : 'transparent',
        opacity: withTiming(feedback ? 0.3 : 0)
    }));

    // Overlay Texts
    const rightOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [0, SWIPE_THRESHOLD], [0, 1], Extrapolate.CLAMP)
    }));

    const leftOpacity = useAnimatedStyle(() => ({
        opacity: interpolate(translateX.value, [-SWIPE_THRESHOLD, 0], [1, 0], Extrapolate.CLAMP)
    }));

    if (!currentHand) return null;

    return (
        <GestureHandlerRootView style={styles.container}>
            {/* BACKGROUND FEEDBACK */}
            <Animated.View style={[StyleSheet.absoluteFill, feedbackStyle]} />

            {/* HEADER */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.subTitle}>CHART</Text>
                    <Text style={styles.chartName}>{activeChartId ? chartNames[activeChartId] : 'None'}</Text>
                </View>
                <View style={styles.streakBadge}>
                    <Text style={styles.streakText}>🔥 {streak}</Text>
                </View>
            </View>

            {/* GAME AREA */}
            <View style={styles.gameArea}>

                {/* INSTRUCTIONS */}
                <View style={[styles.instruction, { left: 20 }]}>
                    <Animated.Text style={[styles.instructionText, { color: '#EF4444' }, leftOpacity]}>FOLD</Animated.Text>
                </View>
                <View style={[styles.instruction, { right: 20 }]}>
                    <Animated.Text style={[styles.instructionText, { color: '#10B981' }, rightOpacity]}>RAISE</Animated.Text>
                </View>

                {/* CARD STACK */}
                <GestureDetector gesture={pan}>
                    <Animated.View style={[styles.cardStack, cardStyle]}>
                        <View style={styles.cardWrapper}>
                            <PokerCard rank={currentHand[0].rank} suit={currentHand[0].suit} />
                        </View>
                        <View style={styles.cardWrapper}>
                            <PokerCard rank={currentHand[1].rank} suit={currentHand[1].suit} />
                        </View>
                        {/* Hand Label */}
                        <View style={styles.labelContainer}>
                            <Text style={styles.labelText}>
                                {getHandType(currentHand[0], currentHand[1])}
                            </Text>
                        </View>
                    </Animated.View>
                </GestureDetector>

                <Text style={styles.hint}>Swipe LEFT to Fold • Swipe RIGHT to Raise</Text>

            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
                <JuicyButton
                    title="EXIT"
                    variant="neutral"
                    onPress={() => router.back()}
                />
            </View>

        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingTop: Platform.OS === 'android' ? 40 : 0
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: SPACING.lg,
        alignItems: 'center'
    },
    subTitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: 'bold'
    },
    chartName: {
        color: COLORS.text,
        fontSize: 16,
        fontWeight: 'bold'
    },
    streakBadge: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20
    },
    streakText: {
        color: COLORS.primary,
        fontWeight: 'bold'
    },
    gameArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    cardStack: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        padding: SPACING.xl,
        borderRadius: RADIUS.xl,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
        elevation: 10,
        alignItems: 'center',
        justifyContent: 'center',
        width: 300,
        height: 200, // Fixed height for swipe target
    },
    cardWrapper: {
        marginHorizontal: -10, // Overlap slightly
        transform: [{ rotate: '-2deg' }]
    },
    labelContainer: {
        position: 'absolute',
        bottom: 10,
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8
    },
    labelText: {
        color: '#FFF',
        fontWeight: 'bold',
        fontSize: 12
    },
    footer: {
        padding: SPACING.lg,
        paddingBottom: SPACING.xl * 2
    },
    instruction: {
        position: 'absolute',
        top: '40%',
    },
    instructionText: {
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: 2
    },
    hint: {
        color: COLORS.textSecondary,
        marginTop: SPACING.xl,
        fontSize: 12,
        opacity: 0.5
    }
});
