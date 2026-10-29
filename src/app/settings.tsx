import { useEffect, useState } from 'react';
import { Alert, Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTitle } from '@/components/app-title';
import { Screen } from '@/components/screen';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { disableReminders, enableReminders, isRemindersEnabled } from '@/lib/reminders';
import { supabase } from '@/lib/supabase';
import { setThemePreference } from '@/lib/theme-preference';

export default function Settings() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const [reminders, setReminders] = useState(false);

  useEffect(() => {
    isRemindersEnabled().then(setReminders);
  }, []);

  async function toggleReminders(value: boolean) {
    if (!value) {
      await disableReminders();
      setReminders(false);
      return;
    }
    const ok = await enableReminders();
    if (!ok) Alert.alert('Brak zgody', 'Włącz powiadomienia dla aplikacji w ustawieniach telefonu.');
    setReminders(ok);
  }

  const rowStyle = {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    alignSelf: 'stretch',
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.backgroundElement,
  } as const;

  return (
    <Screen centered style={{ gap: 24 }}>
      <AppTitle style={{ position: 'absolute', top: insets.top + 16, left: 24 }} />
      <ThemedText type="subtitle">Ustawienia</ThemedText>
      <View style={rowStyle}>
        <ThemedText>Ciemny motyw</ThemedText>
        <Switch
          value={dark}
          onValueChange={(value) => setThemePreference(value ? 'dark' : 'light')}
          trackColor={{ true: theme.accent }}
        />
      </View>
      <View style={rowStyle}>
        <View style={{ flex: 1 }}>
          <ThemedText>Przypomnienia</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Codziennie o 8:00, 12:00, 16:00 i 20:00
          </ThemedText>
        </View>
        <Switch value={reminders} onValueChange={toggleReminders} trackColor={{ true: theme.accent }} />
      </View>
      <ThemedButton title="Wyloguj się" onPress={() => supabase.auth.signOut()} style={{ alignSelf: 'stretch' }} />
    </Screen>
  );
}
