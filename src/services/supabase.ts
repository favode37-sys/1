import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';

// These will be loaded from .env or ENV variables in Expo
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.warn('Supabase credentials missing! Check .env file.');
}

// Provide fallbacks to prevent crash if .env is missing
const url = SUPABASE_URL || 'https://placeholder.supabase.co';
const key = SUPABASE_ANON_KEY || 'placeholder';

export const supabase = createClient(url, key, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

export type HandScenario = {
    id: string;
    context: {
        holeCards: Array<{ rank: string; suit: string }>;
        communityCards: Array<{ rank: string; suit: string }>;
        potSize: number;
        position?: string;
    };
    correct_action: 'fold' | 'call' | 'raise';
    chip_explanation: string; // Renamed from explanation to match DB
    difficulty: 'easy' | 'medium' | 'hard';
};
