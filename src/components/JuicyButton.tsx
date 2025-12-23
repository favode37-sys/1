import React from 'react';
import { Text, StyleSheet, Pressable, View, ViewStyle, Platform } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface JuicyButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'neutral' | 'accent';
    disabled?: boolean;
    style?: ViewStyle;
}

export const JuicyButton: React.FC<JuicyButtonProps> = ({
    title,
    onPress,
    variant = 'primary',
    disabled,
    style
}) => {
    const translateY = useSharedValue(0);

    const colors: Record<string, { face: string; shadow: string }> = {
        primary: { face: COLORS.primary, shadow: COLORS.primaryDark },
        secondary: { face: COLORS.secondary, shadow: COLORS.secondaryDark },
        neutral: { face: COLORS.surface, shadow: '#111' },
        accent: { face: '#3B82F6', shadow: '#1D4ED8' }, // Blue implementation
    };

    const currentColors = disabled
        ? { face: '#888', shadow: '#555' }
        : colors[variant];

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const handlePressIn = () => {
        if (disabled) return;
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        translateY.value = withSpring(6, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        if (disabled) return;
        translateY.value = withSpring(0, { damping: 15, stiffness: 200 });
        onPress();
    };

    return (
        <Pressable
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled}
            style={[{ marginBottom: 8 }, style]} // Margin for the depth
        >
            {/* SHADOW LAYER */}
            <View style={[
                styles.shadow,
                {
                    backgroundColor: currentColors.shadow,
                }
            ]} />

            {/* FACE LAYER */}
            <Animated.View style={[
                styles.face,
                { backgroundColor: currentColors.face },
                animatedStyle
            ]}>
                <Text style={styles.text}>{title.toUpperCase()}</Text>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    shadow: {
        position: 'absolute',
        top: 6, // Offset to create depth
        left: 0,
        right: 0,
        bottom: -6, // Extend down
        borderRadius: RADIUS.xl,
        height: '100%',
    },
    face: {
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.xl,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)', // Subtle highlight
    },
    text: {
        color: '#FFF',
        fontWeight: '800',
        fontSize: 18,
        letterSpacing: 1,
        fontFamily: 'System', // Replace with custom font later
    }
});
