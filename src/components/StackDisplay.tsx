import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withTiming } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { Coins } from 'lucide-react-native';

interface StackDisplayProps {
    amount: number;
    damage?: boolean; // Trigger damage animation
}

export const StackDisplay: React.FC<StackDisplayProps> = ({ amount, damage }) => {
    const shake = useSharedValue(0);
    const scale = useSharedValue(1);

    useEffect(() => {
        if (damage) {
            shake.value = withSequence(
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(-10, { duration: 50 }),
                withTiming(10, { duration: 50 }),
                withTiming(0, { duration: 50 })
            );
            scale.value = withSequence(
                withTiming(1.2, { duration: 100 }),
                withTiming(1, { duration: 200 })
            );
        }
    }, [amount, damage]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { translateX: shake.value },
                { scale: scale.value }
            ],
        };
    });

    return (
        <Animated.View style={[styles.container, animatedStyle]}>
            <View style={styles.iconContainer}>
                <Coins size={24} color={COLORS.gold} />
            </View>
            <Text style={[styles.text, { color: damage ? COLORS.secondary : COLORS.text }]}>
                {amount.toLocaleString()}
            </Text>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.round,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        marginRight: SPACING.sm,
    },
    text: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'System',
    }
});
