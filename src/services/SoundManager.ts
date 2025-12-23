
import { Audio } from 'expo-av';

type SoundEffect = 'correct' | 'wrong' | 'fold' | 'check' | 'bet' | 'deal' | 'levelup';

// Map effect names to require() paths (Placeholders for now)
const SOUND_MAP: Record<SoundEffect, any> = {
    correct: null, // require('../../assets/sounds/correct.mp3'),
    wrong: null,   // require('../../assets/sounds/wrong.mp3'),
    fold: null,    // require('../../assets/sounds/fold.mp3'),
    check: null,   // require('../../assets/sounds/check.mp3'),
    bet: null,     // require('../../assets/sounds/bet.mp3'),
    deal: null,    // require('../../assets/sounds/deal.mp3'), 
    levelup: null  // require('../../assets/sounds/levelup.mp3')
};

class SoundManager {
    private sounds: Record<string, Audio.Sound> = {};
    private isReady: boolean = false;

    async loadSounds() {
        // In a real implementation:
        // try {
        //     for (const [key, source] of Object.entries(SOUND_MAP)) {
        //         const { sound } = await Audio.Sound.createAsync(source);
        //         this.sounds[key] = sound;
        //     }
        //     this.isReady = true;
        // } catch (error) {
        //     console.warn('Failed to load sounds', error);
        // }
        console.log('🔇 SoundManager initialized (Mock Mode)');
        this.isReady = true;
    }

    async play(effect: SoundEffect) {
        // 1. Log the effect (Visual feedback for dev)
        console.log(`🎵 Sound: [${effect}]`);

        // 2. Play actual sound (if available)
        // if (this.isReady && this.sounds[effect]) {
        //     try {
        //         await this.sounds[effect].replayAsync();
        //     } catch (e) {
        //         // Ignore playback errors
        //     }
        // }
    }
}

export const soundManager = new SoundManager();
