
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { StackDisplay } from '../components/StackDisplay';
import { ChipMascot } from '../components/ChipMascot';
import { PokerCard } from '../components/PokerCard';
import { ActionButtons } from '../components/ActionButtons';
import { JuicyButton } from '../components/JuicyButton';
import { Link, useRouter } from 'expo-router';
import { COLORS, SPACING } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
    const router = useRouter();

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <StatusBar style="light" />

            {/* 1. Header with Stack and Mascot */}
            <View style={styles.header}>
                <StackDisplay amount={1000} />
                <View style={{ width: 20 }} />
                <ChipMascot mood="neutral" />
            </View>

            <View style={{ height: 40 }} />

            {/* 2. Poker Cards Showcase */}
            <Text style={styles.label}>TACTILE CARDS</Text>
            <View style={styles.row}>
                <PokerCard rank="A" suit="spades" />
                <PokerCard rank="K" suit="hearts" />
                <PokerCard rank="10" suit="clubs" isFaceUp={false} />
            </View>

            <View style={{ height: 60 }} />

            {/* 3. Action Buttons Showcase */}
            <Text style={styles.label}>INTERACTIVE CONTROLS</Text>
            <View style={{ width: '100%' }}>
                <ActionButtons
                    onFold={() => console.log('Fold')}
                    onCall={() => console.log('Call')}
                    onRaise={() => console.log('Raise')}
                />
            </View>

            <View style={{ height: 40 }} />

            {/* Navigation Button */}
            <JuicyButton
                title="PLAY BLITZ MODE"
                variant="primary"
                onPress={() => router.push('/game')}
            />

            <View style={{ height: 20 }} />
            <Text style={{ color: COLORS.textSecondary }}>Tap buttons to feel haptics!</Text>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: SPACING.md,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        gap: 10,
    },
    label: {
        color: COLORS.textSecondary,
        fontWeight: 'bold',
        marginBottom: SPACING.md,
        letterSpacing: 1,
    }
});
