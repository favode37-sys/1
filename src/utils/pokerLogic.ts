
import { Card, Rank } from '../services/HandGenerator';

export const RANKS: Rank[] = ['A', 'K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2'];

/**
 * Returns the index of a rank (0 for A, 12 for 2).
 * Lower index = Higher Value.
 */
export const getRankIndex = (rank: Rank): number => {
    return RANKS.indexOf(rank);
};

/**
 * Generates a 13x13 grid of hand notations.
 * Diagonal: Pairs (AA, KK)
 * Upper Triangle: Suited (AKs, QJs) - Row < Col
 * Lower Triangle: Offsuit (AKo, QJo) - Row > Col
 */
export const generateGrid = (): string[][] => {
    const grid: string[][] = [];

    for (let i = 0; i < RANKS.length; i++) {
        const row: string[] = [];
        for (let j = 0; j < RANKS.length; j++) {
            const rank1 = RANKS[i];
            const rank2 = RANKS[j];

            if (i === j) {
                // Pair
                row.push(`${rank1}${rank2}`); // "AA", "KK"
            } else if (i < j) {
                // Upper Triangle (Suited)
                // i is higher rank (lower index) than j
                // Convention: HighCard-LowCard-s
                row.push(`${rank1}${rank2}s`); // "AKs"
            } else {
                // Lower Triangle (Offsuit)
                // i is lower rank (higher index) than j
                // We must format as HighCard-LowCard-o
                // So we use rank2 (j) first
                row.push(`${rank2}${rank1}o`); // "AKo"
            }
        }
        grid.push(row);
    }
    return grid;
};

/**
 * Converts two cards into a generic hand notation (e.g. "AKs", "72o", "JJ").
 * Handles sorting so High Card is always first.
 */
export const getHandType = (card1: Card, card2: Card): string => {
    const idx1 = getRankIndex(card1.rank);
    const idx2 = getRankIndex(card2.rank);

    let first: Card, second: Card;
    // Lower index aka Higher Value goes first
    if (idx1 <= idx2) {
        first = card1;
        second = card2;
    } else {
        first = card2;
        second = card1;
    }

    if (first.rank === second.rank) {
        return `${first.rank}${second.rank}`;
    } else if (first.suit === second.suit) {
        return `${first.rank}${second.rank}s`;
    } else {
        return `${first.rank}${second.rank}o`;
    }
};
