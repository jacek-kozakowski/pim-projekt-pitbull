import AsyncStorage from '@react-native-async-storage/async-storage';
import { Appearance } from 'react-native';

const KEY = 'theme';

export async function loadThemePreference() {
    const saved = await AsyncStorage.getItem(KEY);
    if (saved === 'light' || saved === 'dark') Appearance.setColorScheme(saved);
}

export function setThemePreference(theme: 'light' | 'dark') {
    Appearance.setColorScheme(theme);
    AsyncStorage.setItem(KEY, theme);
}
