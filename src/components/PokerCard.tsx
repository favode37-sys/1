import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING } from '../constants/theme';

export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | 'K' | 'Q' | 'J' | '10' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2';

const SUIT_ICONS = {
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
    spades: '♠',
};

const SUIT_COLORS = {
    hearts: '#FF4B4B',
    diamonds: '#FF4B4B',
    clubs: '#202F36', // Dark
    spades: '#202F36',
};

export interface PokerCardProps {
    rank: Rank;
    suit: Suit;
    isFaceUp?: boolean;
}

export const PokerCard: React.FC<PokerCardProps> = ({ rank, suit, isFaceUp = true }) => {
    if (!isFaceUp) {
        return (
            <View style={[styles.container, styles.back]}>
                <View style={styles.pattern} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.rank, { color: SUIT_COLORS[suit] }]}>{rank}</Text>
            <Text style={[styles.suit, { color: SUIT_COLORS[suit] }]}>{SUIT_ICONS[suit]}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 60,
        height: 84,
        backgroundColor: '#FFF',
        borderRadius: RADIUS.sm,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 4,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    back: {
        backgroundColor: '#3B5560',
        borderColor: '#2A3E46',
    },
    pattern: {
        width: '80%',
        height: '80%',
        backgroundColor: '#2A3E46',
        borderRadius: 4,
        opacity: 0.5,
    },
    rank: {
        fontSize: 20,
        fontWeight: 'bold',
        fontFamily: 'System', // Monospace helps alignment?
    },
    suit: {
        fontSize: 24,
    }
});
