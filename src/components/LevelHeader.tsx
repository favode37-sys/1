
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface LevelHeaderProps {
    level: number;
    xp: number;
    xpToNextLevel: number;
}

export const LevelHeader: React.FC<LevelHeaderProps> = ({ level, xp, xpToNextLevel }) => {
    // Calculate progress (0 to 1)
    // We need to calculate progress *within* the current level.
    // However, the current store logic tracks "total XP".
    // Formula for progress: 
    // Usually: (CurrentXP - XP_Needed_For_Previous_Level) / (XP_Needed_For_Next_Level - XP_Needed_For_Previous_Level).
    // But our store impl is simple: `xpToNextLevel` grows.
    // Let's assume for this MVP that the progress bar is simply current XP / current Target.
    // Ideally user starts level with 0 progress visual?
    // Let's stick to the prompt: (xp / xpToNextLevel) * 100%.

    // NOTE: If XP is total, and xpToNextLevel is total threshold, this works fine for "Total Progress".
    // But for "This Level Progress":
    // Prev threshold = (level - 1) * 500 (approx based on store logic).
    // Let's stick to simple ratio for now to match the user's specific formula request.

    const progress = Math.min(1, Math.max(0, xp / xpToNextLevel));

    const width = useSharedValue(0);

    useEffect(() => {
        width.value = withSpring(progress, { damping: 20, stiffness: 90 });
    }, [progress]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            width: `${width.value * 100}%`,
        };
    });

    return (
        <View style={styles.container}>
            {/* LEVEL BADGE */}
            <View style={styles.badge}>
                <Text style={styles.badgeLabel}>LVL</Text>
                <Text style={styles.badgeValue}>{level}</Text>
            </View>

            {/* PROGRESS BAR */}
            <View style={styles.trackContainer}>
                <View style={styles.track}>
                    <Animated.View style={[styles.fill, animatedStyle]} />
                </View>
                <Text style={styles.xpText}>
                    {Math.floor(xp)} / {xpToNextLevel} XP
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        backgroundColor: 'rgba(0,0,0,0.2)', // Subtle background
        borderRadius: RADIUS.lg,
        alignSelf: 'stretch',
        marginTop: SPACING.sm
    },
    badge: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
        marginRight: SPACING.md,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    badgeLabel: {
        color: 'rgba(255,255,255,0.7)',
        fontSize: 8,
        fontWeight: 'bold',
    },
    badgeValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: '900',
    },
    trackContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    track: {
        height: 12,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: RADIUS.pill,
        overflow: 'hidden',
        marginBottom: 4,
    },
    fill: {
        height: '100%',
        backgroundColor: '#4ADE80', // Juicy Green
    },
    xpText: {
        color: COLORS.textSecondary,
        fontSize: 10,
        fontWeight: '600',
        alignSelf: 'flex-end',
    }
});
