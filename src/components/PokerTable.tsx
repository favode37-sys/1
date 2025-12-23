
import React from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { PokerCard, Rank, Suit } from './PokerCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface PokerTableProps {
    communityCards: Array<{ rank: Rank; suit: Suit }>;
    potSize: number;
}

export const PokerTable: React.FC<PokerTableProps> = ({ communityCards, potSize }) => {
    return (
        <View style={styles.container}>
            {/* TABLE SURFACE */}
            <View style={styles.table}>

                {/* 1. SEAT PLACEHOLDERS (Absolute Positions) */}
                {/* Seat 3: Villain (Top Center) */}
                <View style={[styles.seat, styles.seatTop]} >
                    <View style={styles.avatarPlaceholder} />
                    <Text style={styles.dealerBtn}>D</Text>
                </View>

                {/* Seat 2: Top Left */}
                <View style={[styles.seat, styles.seatTopLeft, styles.ghost]} />

                {/* Seat 4: Top Right */}
                <View style={[styles.seat, styles.seatTopRight, styles.ghost]} />

                {/* Seat 1: Bottom Left */}
                <View style={[styles.seat, styles.seatBottomLeft, styles.ghost]} />

                {/* Seat 5: Bottom Right */}
                <View style={[styles.seat, styles.seatBottomRight, styles.ghost]} />

                {/* Seat 0: Hero (Bottom Center) - Hidden/Underlay since hero cards are real */}
                <View style={[styles.seat, styles.seatBottom]} />


                {/* 2. CENTER CONTENT */}
                <View style={styles.centerContent}>
                    {/* POT INFO */}
                    <View style={styles.potBadges}>
                        <View style={styles.potPill}>
                            <Text style={styles.potLabel}>TOTAL POT</Text>
                            <Text style={styles.potValue}>{potSize}</Text>
                        </View>
                    </View>

                    {/* COMMUNITY CARDS */}
                    <View style={styles.board}>
                        {communityCards.map((card, idx) => (
                            <View key={idx} style={styles.cardWrapper}>
                                <PokerCard rank={card.rank} suit={card.suit} />
                            </View>
                        ))}
                        {/* Empty Board Placeholders (up to 5) */}
                        {Array.from({ length: 5 - communityCards.length }).map((_, idx) => (
                            <View key={`empty-${idx}`} style={styles.cardPlaceholder} />
                        ))}
                    </View>
                </View>

            </View>
        </View>
    );
};

// --- STYLES ---

// Aspect Ratio 0.65 means Width / Height = 0.65.
// If Width is 90%, Height is Width / 0.65 (taller).

const TABLE_WIDTH = Math.min(SCREEN_WIDTH * 0.95, 450); // Mobile width constraint
const TABLE_ASPECT = 0.65;
const TABLE_HEIGHT = TABLE_WIDTH / TABLE_ASPECT; // Should be around 500-600px

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: SPACING.lg,
    },
    table: {
        width: TABLE_WIDTH,
        height: TABLE_HEIGHT,
        backgroundColor: '#1F2937', // Dark Navy/Black Surface
        borderRadius: TABLE_WIDTH / 2, // Pill shape
        borderWidth: 16,
        borderColor: '#111827', // Dark Rails
        position: 'relative',
        // Inner shadow simulation via elevation/shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
    },

    // --- SEATS ---
    seat: {
        position: 'absolute',
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(0,0,0,0.4)',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ghost: {
        opacity: 0.3, // Semi-transparent for offline/filler
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#374151',
    },
    dealerBtn: {
        position: 'absolute',
        bottom: -5,
        right: -5,
        backgroundColor: '#FFF',
        width: 16,
        height: 16,
        borderRadius: 8,
        textAlign: 'center',
        fontSize: 10,
        fontWeight: 'bold',
        color: '#000',
        overflow: 'hidden',
    },

    // POSITIONS
    seatTop: { top: -25, left: '50%', transform: [{ translateX: -30 }] }, // Villain
    seatBottom: { bottom: -25, left: '50%', transform: [{ translateX: -30 }] }, // Hero

    seatTopLeft: { top: '15%', left: -20 },
    seatTopRight: { top: '15%', right: -20 },

    seatBottomLeft: { bottom: '15%', left: -20 },
    seatBottomRight: { bottom: '15%', right: -20 },

    // --- CENTER ---
    centerContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    potBadges: {
        marginBottom: SPACING.md,
    },
    potPill: {
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    potLabel: {
        color: COLORS.textSecondary,
        fontSize: 9,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    potValue: {
        color: '#4ADE80', // Money Green
        fontSize: 14,
        fontWeight: '900',
    },
    board: {
        flexDirection: 'row',
        gap: 4,
        height: 90, // Constraints for cards
        alignItems: 'center',
    },
    cardWrapper: {
        transform: [{ scale: 0.85 }], // Scale down cards slightly to fit 5 inside width
    },
    cardPlaceholder: {
        width: 50, // 60 * 0.85 approx
        height: 70, // 84 * 0.85 approx
        borderRadius: RADIUS.sm,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        borderStyle: 'dashed',
    }
});
