import { Switch, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTitle } from '@/components/app-title';
import { Screen } from '@/components/screen';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';
import { setThemePreference } from '@/lib/theme-preference';

export default function Settings() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dark = useColorScheme() === 'dark';

  return (
    <Screen centered style={{ gap: 24 }}>
      <AppTitle style={{ position: 'absolute', top: insets.top + 16, left: 24 }} />
      <ThemedText type="subtitle">Ustawienia</ThemedText>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          alignSelf: 'stretch',
          padding: 14,
          borderRadius: 12,
          backgroundColor: theme.backgroundElement,
        }}>
        <ThemedText>Ciemny motyw</ThemedText>
        <Switch
          value={dark}
          onValueChange={(value) => setThemePreference(value ? 'dark' : 'light')}
          trackColor={{ true: theme.accent }}
        />
      </View>
      <ThemedButton title="Wyloguj się" onPress={() => supabase.auth.signOut()} style={{ alignSelf: 'stretch' }} />
    </Screen>
  );
}
