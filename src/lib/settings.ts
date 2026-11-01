import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

export type SettingKey = 'sound' | 'haptics';

const state: Record<SettingKey, boolean> = { sound: true, haptics: true };
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((l) => l());

export async function loadSettings() {
    for (const k of Object.keys(state) as SettingKey[]) {
        state [k] = (await AsyncStorage.getItem(k)) !== 'off';
    }
    notify();
}

export const isOn = (k: SettingKey) => state[k];

export async function setSetting(k: SettingKey, value: boolean) {
    state[k] = value;
    notify();
    await AsyncStorage.setItem(k, value ? 'on' : 'off');
}

export function useSetting(k: SettingKey) {
    const [, force] = useState(0);
    useEffect(() => {
        const l = () => force((n) => n + 1);
        listeners.add(l);
        return () => {
            listeners.delete(l);
        };
    }, []);
    return [state[k], (v: boolean) => setSetting(k, v)] as const;
}