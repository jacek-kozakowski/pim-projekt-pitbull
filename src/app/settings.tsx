import { useEffect, useState, type ComponentProps } from 'react';
import { SymbolView } from 'expo-symbols';
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
import { useSetting} from '@/lib/settings';

type IconName = ComponentProps<typeof SymbolView>['name'];

function RowIcon({ ios, android }: { ios: string; android: string }) {
  const theme = useTheme();
  return (
    <View
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.accent + '26',
      }}>
      <SymbolView
        name={{ ios, android, web: android } as IconName}
        tintColor={theme.accent}
        size={20}
      />
    </View>
  );
}

export default function Settings() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';
  const [reminders, setReminders] = useState(false);
  const [sound, setSound] = useSetting('sound');
  const [haptics, setHaptics] = useSetting('haptics');

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
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: theme.backgroundElement,
  } as const;

  return (
    <Screen centered style={{ gap: 24 }}>
      <AppTitle style={{ position: 'absolute', top: insets.top + 16, left: 24 }} />
      <ThemedText type="subtitle">Ustawienia</ThemedText>
      <View style={rowStyle}>
        <RowIcon ios="moon.fill" android="dark_mode" />
        <ThemedText style={{ flex: 1 }}>Ciemny motyw</ThemedText>
        <Switch
          value={dark}
          onValueChange={(value) => setThemePreference(value ? 'dark' : 'light')}
          trackColor={{ true: theme.accent }}
        />
      </View>
      <View style={rowStyle}>
        <RowIcon ios="speaker.wave.2.fill" android="volume_up" />
        <ThemedText style={{ flex: 1 }}>Dźwięki</ThemedText>
        <Switch value={sound} onValueChange={setSound} trackColor={{ true: theme.accent }} />
      </View>
      <View style={rowStyle}>
        <RowIcon ios="iphone.radiowaves.left.and.right" android="vibration" />
        <ThemedText style={{ flex: 1 }}>Wibracje</ThemedText>
        <Switch value={haptics} onValueChange={setHaptics} trackColor={{ true: theme.accent }} />
      </View>
      <View style={rowStyle}>
        <RowIcon ios="bell.fill" android="notifications" />
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
