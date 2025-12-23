import { View, Pressable, StyleSheet, Text, Platform } from 'react-native';
import { BlitzGame } from '@/screens/BlitzGame';
import { Stack, router } from 'expo-router';

export default function GameScreen() {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <BlitzGame />

            {/* EXIT BUTTON */}
            <Pressable
                onPress={() => router.replace('/')}
                style={styles.exitButton}
                hitSlop={20}
            >
                <Text style={styles.exitText}>✕</Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    exitButton: {
        position: 'absolute',
        top: Platform.OS === 'web' ? 20 : 50, // Safe Area approx
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100, // Top of everything
    },
    exitText: {
        color: '#FFF',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: -2,
    }
});
