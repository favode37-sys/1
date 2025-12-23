
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface SpeechBubbleProps {
    message: string;
}

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({ message }) => {
    return (
        <Animated.View
            entering={FadeInDown.springify().damping(12)}
            exiting={FadeOut}
            style={styles.container}
        >
            <View style={styles.bubble}>
                <Text style={styles.text}>{message}</Text>
            </View>
            {/* TAIL */}
            <View style={styles.tail} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        // Positioning will be handled by parent relative to Mascot
        left: 50, // Right of the mascot (assuming mascot width ~50-60)
        top: -10,
        zIndex: 20,
    },
    bubble: {
        backgroundColor: '#FFF',
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.xs,
        borderRadius: 16,
        borderBottomLeftRadius: 0, // Tail origin
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 4,
        minWidth: 80,
        alignItems: 'center',
    },
    tail: {
        position: 'absolute',
        bottom: -6,
        left: 0,
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 8,
        borderRightWidth: 0,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#FFF',
        transform: [{ rotate: '180deg' }], // Point down-left? Actually simple triangle logic
        // Let's make a simple tail pointing left-down
    },
    text: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 12,
    }
});
