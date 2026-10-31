import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import { useEffect } from 'react';


async function soundOn() {
    const v = await AsyncStorage.getItem('sound');
    console.log('[sound] klucz sound =', v);
    return v !== 'off';
}

export function useGameSounds() {
    const spin = useAudioPlayer(require('@/assets/sounds/spin.mp3'));
    const win = useAudioPlayer(require('@/assets/sounds/win.mp3'));

    useEffect(() => {
        spin.loop = true;
        setAudioModeAsync({playsInSilentMode: true});
    }, [spin]);

    async function playSpin() {
        if (!(await soundOn())) return;
        await spin.seekTo(0);
        spin.play();
    }

    function stopSpin() {
        spin.pause();
    }
    async function playWin() {
        if (!(await soundOn())) return;
        await win.seekTo(0);
        win.play();
    }

    return { playSpin, stopSpin, playWin };
}