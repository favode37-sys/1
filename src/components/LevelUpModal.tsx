
import React from 'react';
import { View, Text, StyleSheet, Modal } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { ChipMascot } from './ChipMascot';
import { JuicyButton } from './JuicyButton';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

interface LevelUpModalProps {
    visible: boolean;
    level: number;
    onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({ visible, level, onClose }) => {
    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <Animated.View entering={ZoomIn.duration(500).springify()} style={styles.card}>
                    {/* CONFETTI / GLOW EFFECT (Simplified as styling) */}

                    <View style={styles.header}>
                        <Text style={styles.title}>LEVEL UP!</Text>
                    </View>

                    <View style={styles.content}>
                        <ChipMascot mood="happy" />
                        <View style={{ height: 20 }} />
                        <Text style={styles.levelLabel}>YOU REACHED</Text>
                        <Text style={styles.levelValue}>LEVEL {level}</Text>
                    </View>

                    <View style={styles.footer}>
                        <JuicyButton
                            title="AWESOME!"
                            variant="primary"
                            onPress={onClose}
                            style={{ width: '100%' }}
                        />
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    card: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.xl,
        padding: SPACING.xl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.secondary, // Purple border for magic feel
        shadowColor: COLORS.secondary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },
    header: {
        marginBottom: SPACING.lg,
    },
    title: {
        fontSize: 32,
        fontWeight: '900',
        color: COLORS.secondary,
        letterSpacing: 2,
        textShadowColor: 'rgba(0,0,0,0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    content: {
        alignItems: 'center',
        marginBottom: SPACING.xl,
    },
    levelLabel: {
        color: COLORS.textSecondary,
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: 1,
        marginBottom: 4,
    },
    levelValue: {
        color: COLORS.text,
        fontSize: 48,
        fontWeight: '900',
    },
    footer: {
        width: '100%',
    }
});
