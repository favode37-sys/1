
import { HandScenario } from './supabase';

// --- TYPES ---
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
    rank: Rank;
    suit: Suit;
}

// --- CONSTANTS ---
const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// --- HELPERS ---

// Generate a full deck
const createDeck = (): Card[] => {
    const deck: Card[] = [];
    for (const suit of SUITS) {
        for (const rank of RANKS) {
            deck.push({ rank, suit });
        }
    }
    return deck;
};

// Shuffle deck (Fisher-Yates)
const shuffleDeck = (deck: Card[]): Card[] => {
    const newDeck = [...deck];
    for (let i = newDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    return newDeck;
};

// Helper to draw N cards from top of deck
const drawCards = (deck: Card[], count: number): Card[] => {
    return deck.splice(0, count);
};

// --- TEMPLATES ---

const generatePreflopTrash = (deck: Card[]): HandScenario => {
    // Force some bad cards roughly. 
    // Simplified: Just draw 2 random cards, but usually we'd filter for low ranks.
    // Let's filter deck for low ranks (2-7) and different suits to ensure "Trash" feel.

    // We'll just draw from the shuffled deck for simplicity in this MVP version, 
    // but check if they are "high" cards. If so, swap them? 
    // Better: Just pick low cards specifically.

    const lowRanks: Rank[] = ['2', '3', '4', '5', '6', '7'];
    const trashCard1 = { rank: lowRanks[Math.floor(Math.random() * lowRanks.length)], suit: SUITS[0] };
    const trashCard2 = { rank: lowRanks[Math.floor(Math.random() * lowRanks.length)], suit: SUITS[1] }; // Different suit => offsuit likely

    // Remove these specific cards from deck if we were simulating full game, 
    // but here we just construct the object.

    return {
        id: `gen_trash_${Date.now()}`,
        difficulty: 'easy',
        correct_action: 'fold',
        chip_explanation: `Рука ${trashCard1.rank}${trashCard2.rank} разномастная — это мусор. На дистанции это -EV. Фолди!`,
        context: {
            holeCards: [trashCard1, trashCard2],
            communityCards: [],
            potSize: 15,
            position: 'UTG'
        }
    };
};

const generatePreflopMonster = (deck: Card[]): HandScenario => {
    const highRanks: Rank[] = ['A', 'K', 'Q'];
    const r = highRanks[Math.floor(Math.random() * highRanks.length)];

    // Pocket Pair (e.g. AA, KK)
    const card1 = { rank: r, suit: 'spades' as Suit };
    const card2 = { rank: r, suit: 'hearts' as Suit };

    return {
        id: `gen_monster_${Date.now()}`,
        difficulty: 'easy',
        correct_action: 'raise',
        chip_explanation: `Карманные ${r}${r} — премиум рука! Нужно разгонять банк префлоп.`,
        context: {
            holeCards: [card1, card2],
            communityCards: [],
            potSize: 60,
            position: 'BTN'
        }
    };
};

const generatePostflopNuts = (deck: Card[]): HandScenario => {
    // Flush Scenario
    const suit: Suit = 'hearts';
    const holeCards: Card[] = [{ rank: 'A', suit }, { rank: 'K', suit }];
    const communityCards: Card[] = [
        { rank: '10', suit },
        { rank: '5', suit },
        { rank: '2', suit: 'clubs' } // One off-suit not to make it too obvious on board alone? Or full flush on board? 
        // Let's make it 3 flush cards on board matching hero.
    ];
    // Wait, 3 on board + 2 in hand = Flush.
    communityCards[2] = { rank: '2', suit };

    return {
        id: `gen_nuts_${Date.now()}`,
        difficulty: 'medium',
        correct_action: 'raise',
        chip_explanation: "У тебя натсовый флеш! Тебя бьет только стрит-флеш (маловероятно). Ставь на вэлью!",
        context: {
            holeCards,
            communityCards,
            potSize: 150,
            position: 'SB'
        }
    };
};

const generatePostflopAir = (deck: Card[]): HandScenario => {
    // Hero has low cards, Board has high cards that don't match
    const holeCards: Card[] = [{ rank: '4', suit: 'diamonds' }, { rank: '5', suit: 'clubs' }];
    const communityCards: Card[] = [{ rank: 'K', suit: 'spades' }, { rank: 'A', suit: 'hearts' }, { rank: 'J', suit: 'clubs' }];

    return {
        id: `gen_air_${Date.now()}`,
        difficulty: 'medium',
        correct_action: 'fold',
        chip_explanation: "Ты не попал в доску (Air). Соперники часто имеют Ax или Kx здесь. Не блефуй.",
        context: {
            holeCards,
            communityCards,
            potSize: 80,
            position: 'BB'
        }
    };
};

// --- MAIN GENERATOR ---

export const generateInfiniteScenario = (): HandScenario => {
    // In a real robust generator, we would use the Deck to pull cards so no duplicates ever happen linearly.
    // For these distinct templates, we heavily control the inputs so collisions between hole/board within a template are handled manually.

    const deck = shuffleDeck(createDeck());
    const rand = Math.random();

    if (rand < 0.25) return generatePreflopTrash(deck);
    if (rand < 0.50) return generatePreflopMonster(deck);
    if (rand < 0.75) return generatePostflopNuts(deck);
    return generatePostflopAir(deck);
};
