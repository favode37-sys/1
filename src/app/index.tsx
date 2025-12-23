
import { View, StyleSheet, Text } from 'react-native';
import { ChipMascot } from '../components/ChipMascot';
import { JuicyButton } from '../components/JuicyButton';
import { useRouter } from 'expo-router';
import { COLORS, SPACING } from '../constants/theme';
import { StatusBar } from 'expo-status-bar';

export default function Index() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <View style={styles.content}>
                <ChipMascot mood="happy" />
                <View style={{ height: 40 }} />

                <Text style={styles.title}>PokerLingo</Text>
                <Text style={styles.subtitle}>Master the GTO strategy</Text>

                <View style={{ height: 60 }} />

                <JuicyButton
                    title="PLAY BLITZ MODE"
                    variant="primary"
                    onPress={() => router.push('/game')}
                    style={{ width: '100%', maxWidth: 300 }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.lg,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    title: {
        fontSize: 40,
        fontWeight: '900',
        color: COLORS.text,
        letterSpacing: 1,
        marginBottom: SPACING.xs,
    },
    subtitle: {
        fontSize: 16,
        color: COLORS.textSecondary,
        fontWeight: '500',
        letterSpacing: 0.5,
    }
});
