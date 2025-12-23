import { View } from 'react-native';
import { BlitzGame } from '@/screens/BlitzGame';
import { Stack } from 'expo-router';

export default function GameScreen() {
    return (
        <View style={{ flex: 1 }}>
            <Stack.Screen options={{ headerShown: false }} />
            <BlitzGame />
        </View>
    );
}
