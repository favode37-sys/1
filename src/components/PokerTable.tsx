import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';
import { PokerCard, Rank, Suit } from './PokerCard';

interface PokerTableProps {
    communityCards: Array<{ rank: Rank; suit: Suit }>;
    potSize: number;
}

export const PokerTable: React.FC<PokerTableProps> = ({ communityCards, potSize }) => {
    return (
        <View style={styles.table}>
            <View style={styles.felt}>
                <View style={styles.potContainer}>
                    <Text style={styles.potLabel}>POT</Text>
                    <Text style={styles.potValue}>{potSize}</Text>
                </View>

                <View style={styles.cardsRow}>
                    {communityCards.map((card, idx) => (
                        <PokerCard key={idx} rank={card.rank} suit={card.suit} />
                    ))}
                    {/* Placeholders for missing cards if any? */}
                    {Array.from({ length: 5 - communityCards.length }).map((_, idx) => (
                        <View key={`placeholder-${idx}`} style={styles.cardPlaceholder} />
                    ))}
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    table: {
        width: '100%',
        padding: SPACING.lg,
        alignItems: 'center',
    },
    felt: {
        width: '100%',
        height: 200,
        // User requested "Clean, not the cliche casino green felt. Modern matte colors."
        // Let's use darker surface.
        backgroundColor: COLORS.surface,
        borderRadius: 100, // Oval shape
        borderWidth: 8,
        borderColor: '#1A262C',
        alignItems: 'center',
        justifyContent: 'center',
    },
    potContainer: {
        position: 'absolute',
        top: 30,
        alignItems: 'center',
    },
    potLabel: {
        color: 'rgba(255,255,255,0.5)',
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 1,
    },
    potValue: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardsRow: {
        flexDirection: 'row',
        marginTop: 20,
        alignItems: 'center',
    },
    cardPlaceholder: {
        width: 60,
        height: 84,
        borderRadius: RADIUS.sm,
        backgroundColor: 'rgba(0,0,0,0.2)',
        margin: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    }
});
