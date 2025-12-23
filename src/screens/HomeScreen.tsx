
import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useGameStore } from '../store/useGameStore';
import { ChipMascot } from '../components/ChipMascot';
import { JuicyButton } from '../components/JuicyButton';
import { LevelHeader } from '../components/LevelHeader';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withSequence,
    withTiming,
    Easing
} from 'react-native-reanimated';

export const HomeScreen = () => {
    const router = useRouter();
    const { streak, stack, level, xp, xpToNextLevel } = useGameStore();

    // Pulse Animation for Play Button
    const pulse = useSharedValue(1);

    useEffect(() => {
        pulse.value = withRepeat(
            withSequence(
                withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
                withTiming(1.0, { duration: 1000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );
    }, []);

    const animatedBtnStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulse.value }]
    }));

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.logo}>POKERLINGO</Text>

                {/* Stats Row */}
                <View style={styles.topStats}>
                    <View style={styles.statBadge}>
                        <Text style={styles.statIcon}>🔥</Text>
                        <Text style={styles.statValue}>{streak}</Text>
                    </View>
                    <View style={[styles.statBadge, { marginLeft: 8 }]}>
                        <Text style={styles.statIcon}>🪙</Text>
                        <Text style={styles.statValue}>{stack}</Text>
                    </View>
                </View>
            </View>

            {/* CENTER STAGE */}
            <View style={styles.centerStage}>
                {/* Mascot (Large) */}
                <View style={styles.mascotWrapper}>
                    <ChipMascot mood="happy" style={{ transform: [{ scale: 1.5 }] }} />
                </View>

                <View style={{ height: SPACING.xxl }} />

                {/* Level Card */}
                <View style={styles.levelCard}>
                    <Text style={styles.levelTitle}>YOUR PROGRESS</Text>
                    <LevelHeader level={level} xp={xp} xpToNextLevel={xpToNextLevel} />
                </View>
            </View>

            {/* FOOTER */}
            <View style={styles.footer}>
                <Animated.View style={[{ width: '100%' }, animatedBtnStyle]}>
                    <JuicyButton
                        title="START BLITZ"
                        variant="primary"
                        onPress={() => router.push('/game')}
                        style={styles.playButton}
                    />
                </Animated.View>
                <Text style={styles.versionText}>v0.1.0 • Pre-Alpha</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: SPACING.lg,
        paddingTop: Platform.select({ ios: 60, android: 60, web: 40 }),
        ...Platform.select({
            web: {
                maxWidth: 480,
                width: '100%',
                alignSelf: 'center',
                boxShadow: '0px 0px 50px rgba(0,0,0,0.5)',
                height: '100%',
            }
        })
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    logo: {
        fontSize: 24,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 1,
    },
    topStats: {
        flexDirection: 'row',
    },
    statBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    statIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    statValue: {
        color: COLORS.text,
        fontWeight: 'bold',
        fontSize: 14,
    },
    centerStage: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: -60, // visual correction
    },
    mascotWrapper: {
        marginBottom: SPACING.lg,
    },
    levelCard: {
        width: '100%',
        backgroundColor: COLORS.surface,
        padding: SPACING.lg,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    levelTitle: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1.5,
        marginBottom: SPACING.sm,
        textAlign: 'center',
    },
    footer: {
        width: '100%',
        paddingBottom: SPACING.xl,
        alignItems: 'center',
    },
    playButton: {
        height: 60,
        // JuicyButton default height is flexible, but let's encourage it strictly if needed
        justifyContent: 'center',
    },
    versionText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        marginTop: SPACING.md,
        opacity: 0.5,
    }
});
