
import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Modal, Platform } from 'react-native';
import Animated, { FadeIn, ZoomIn, SlideInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { ChipMascot } from './ChipMascot';
import { JuicyButton } from './JuicyButton';
import { COLORS, SPACING, RADIUS } from '../constants/theme';
import { useGameStore } from '../store/useGameStore';

interface BankruptModalProps {
    visible: boolean;
    onRefill: () => void;
}

export const BankruptModal: React.FC<BankruptModalProps> = ({ visible, onRefill }) => {
    if (!visible) return null;

    return (
        <Animated.View exiting={FadeIn.duration(200)} style={styles.overlay}>
            <BlurView intensity={20} style={styles.blur} />

            <Animated.View entering={ZoomIn.springify()} style={styles.card}>

                {/* MASCOT */}
                <View style={styles.mascotContainer}>
                    <ChipMascot mood="shocked" style={{ transform: [{ scale: 1.5 }] }} />
                </View>

                {/* TEXT CONTENT */}
                <Text style={styles.title}>BUSTED!</Text>
                <Text style={styles.subtitle}>You ran out of chips.</Text>
                <Text style={styles.description}>
                    Don't worry! Here is a fresh stack to get you back in the game. Watch your bankroll!
                </Text>

                <View style={{ height: SPACING.xl }} />

                {/* ACTION BUTTON */}
                <JuicyButton
                    title="FREE REFILL ↺"
                    onPress={onRefill}
                    variant="primary" // maybe accent color?
                    style={{ width: '100%' }}
                />

            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 200, // Higher than feedback overlay
        padding: SPACING.lg,
    },
    blur: {
        ...StyleSheet.absoluteFillObject,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.error || '#EF4444',
        ...Platform.select({
            web: {
                boxShadow: `0px 0px 20px ${COLORS.error || '#EF4444'}`,
            },
            default: {
                shadowColor: COLORS.error || '#EF4444',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 20,
            }
        })
    },
    mascotContainer: {
        marginBottom: SPACING.lg,
        marginTop: -SPACING.xxl, // Pop out of top
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: COLORS.error || '#EF4444',
        marginBottom: SPACING.xs,
        letterSpacing: 2,
        fontStyle: 'italic',
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.text,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
    },
    description: {
        fontSize: 14,
        color: COLORS.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    }
});
