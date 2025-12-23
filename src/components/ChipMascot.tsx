import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { COLORS } from '../constants/theme';
import { Smile, Frown } from 'lucide-react-native';

interface ChipMascotProps {
    mood: 'neutral' | 'happy' | 'shocked';
}

export const ChipMascot: React.FC<ChipMascotProps> = ({ mood = 'neutral' }) => {
    const bounce = useSharedValue(0);
    const rotation = useSharedValue(0);

    useEffect(() => {
        // Idle animation
        bounce.value = withRepeat(
            withSequence(
                withTiming(-5, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
                withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.quad) })
            ),
            -1,
            true
        );
    }, []);

    useEffect(() => {
        if (mood === 'happy') {
            rotation.value = withSequence(
                withTiming(-10, { duration: 100 }),
                withTiming(10, { duration: 100 }),
                withTiming(0, { duration: 100 })
            );
        } else if (mood === 'shocked') {
            rotation.value = withSequence(
                withTiming(-5, { duration: 50 }),
                withTiming(5, { duration: 50 }),
                withTiming(-5, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
        }
    }, [mood]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateY: bounce.value },
                { rotate: `${rotation.value}deg` }
            ],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.chipBody}>
                {/* Outer Ring */}
                <View style={styles.stripes} />
                {/* Inner Face */}
                <View style={styles.face}>
                    {mood === 'happy' && <Smile color={COLORS.background} size={40} />}
                    {mood === 'shocked' && <Frown color={COLORS.background} size={40} />}
                    {mood === 'neutral' && (
                        <View style={{ flexDirection: 'row', gap: 10 }}>
                            <View style={styles.eye} />
                            <View style={styles.eye} />
                        </View>
                    )}
                </View>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 100,
        height: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chipBody: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.gold,
        borderWidth: 4,
        borderColor: '#E6C200',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        elevation: 8,
    },
    stripes: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderRadius: 40,
        borderWidth: 8,
        borderColor: '#FFF',
        borderStyle: 'dashed',
        opacity: 0.5,
    },
    face: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
    },
    eye: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.background
    }
});
