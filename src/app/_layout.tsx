import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useState, useEffect } from 'react';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Colors } from '@/constants/theme';
import LoginScreen from '@/components/login-screen';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import NickScreen from '@/components/nick-screen';

SplashScreen.preventAutoHideAsync();

function Gate() {
    const { session, profile, loading, refreshProfile } = useAuth();


    if (loading) return null;
    if (!session) return <LoginScreen />;
    if (!profile) return null;
    if (!profile.nick_confirmed) return <NickScreen onDone={() => refreshProfile()} />;
    return <AppTabs />;
}

export default function TabLayout() {
    const dark = useColorScheme() === 'dark';
    const base = dark ? DarkTheme : DefaultTheme;
    const colors = Colors[dark ? 'dark' : 'light'];

    const navTheme = {
        ...base,
        colors: {
            ...base.colors,
            primary: colors.accent,
            background: colors.background,
            card: colors.background,
            text: colors.text,
            border: colors.backgroundSelected,
        },
  };

  return (
    <ThemeProvider value={navTheme}>
      <AuthProvider>
        <AnimatedSplashOverlay />
        <Gate />
      </AuthProvider>
    </ThemeProvider>
  );
}