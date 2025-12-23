
import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    withSpring,
    withSequence,
    Easing,
    cancelAnimation
} from 'react-native-reanimated';
import { COLORS } from '../constants/theme';

interface ChipProps {
    mood: 'neutral' | 'happy' | 'shocked';
    style?: ViewStyle;
}

export const ChipMascot: React.FC<ChipProps> = ({ mood, style }) => {
    // Shared Values for Animation
    const translateY = useSharedValue(0);
    const rotate = useSharedValue(0);
    const scale = useSharedValue(1);

    // React to Mood Changes
    useEffect(() => {
        // Reset animations to base state when mood changes to ensure clear transition
        cancelAnimation(translateY);
        cancelAnimation(rotate);
        scale.value = withSpring(1);

        if (mood === 'neutral') {
            // IDLE: Gentle breathing/floating
            translateY.value = withRepeat(
                withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
                -1, // Infinite
                true // Reverse
            );
            rotate.value = withTiming(0);
        } else if (mood === 'happy') {
            // HAPPY: Jump and Spin!
            translateY.value = withSequence(
                withTiming(-30, { duration: 300, easing: Easing.out(Easing.back(1.5)) }), // Jump up
                withSpring(0, { damping: 10, stiffness: 100 }) // Land
            );

            // 360 Spin
            rotate.value = withSequence(
                withTiming(360, { duration: 600, easing: Easing.inOut(Easing.cubic) }),
                withTiming(0, { duration: 0 }) // Reset silently
            );

        } else if (mood === 'shocked') {
            // SHOCKED: Shake!
            translateY.value = withSpring(0);
            rotate.value = withSequence(
                withTiming(-15, { duration: 50 }),
                withRepeat(
                    withTiming(15, { duration: 100 }),
                    5, // Shake 5 times
                    true
                ),
                withTiming(0, { duration: 50 })
            );
        }

    }, [mood]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: translateY.value },
                { rotate: `${rotate.value}deg` },
                { scale: scale.value }
            ]
        };
    });

    // --- MOUTH RENDERER ---
    const renderMouth = () => {
        if (mood === 'happy') return <View style={styles.mouthHappy} />;
        if (mood === 'shocked') return <View style={styles.mouthShocked} />;
        return <View style={styles.mouthNeutral} />; // Neutral
    };

    return (
        <Animated.View style={[styles.container, style, animatedStyle]}>
            {/* CHIP BODY */}
            <View style={styles.chipBody}>
                {/* Dashed Border Effect */}
                <View style={styles.dashedBorder} />

                {/* FACE */}
                <View style={styles.face}>
                    {/* EYES */}
                    <View style={styles.eyesRow}>
                        <View style={styles.eye}>
                            <View style={styles.pupil} />
                        </View>
                        <View style={styles.eye}>
                            <View style={styles.pupil} />
                        </View>
                    </View>

                    {/* MOUTH */}
                    {renderMouth()}
                </View>
            </View>
        </Animated.View>
    );
};

const CHIP_SIZE = 60;
const PRIMARY_COLOR = COLORS.primary; // e.g., #4ADE80 or Teal

const styles = StyleSheet.create({
    container: {
        width: CHIP_SIZE,
        height: CHIP_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipBody: {
        width: '100%',
        height: '100%',
        backgroundColor: '#2DD4BF', // A nice Teal/Turquoise for the mascot
        borderRadius: CHIP_SIZE / 2,
        borderWidth: 4,
        borderColor: '#14B8A6', // Darker Teal border
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 5,
    },
    dashedBorder: {
        position: 'absolute',
        width: '85%',
        height: '85%',
        borderRadius: CHIP_SIZE / 2,
        borderWidth: 2,
        borderColor: '#FFF',
        borderStyle: 'dashed',
        opacity: 0.5,
    },
    face: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 2, // Center visually
    },
    eyesRow: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 4,
    },
    eye: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    pupil: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#000',
        marginTop: 2, // Look "kawaii" slightly down?
    },
    // --- MOUTHS ---
    mouthNeutral: {
        width: 16,
        height: 8,
        borderBottomWidth: 2,
        borderBottomColor: '#000',
        borderRadius: 4, // Simple smile curve
        marginTop: 2,
    },
    mouthHappy: {
        width: 16,
        height: 12,
        backgroundColor: '#000',
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        marginTop: 2,
        overflow: 'hidden',
    },
    mouthShocked: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#000',
        marginTop: 2,
    }
});
