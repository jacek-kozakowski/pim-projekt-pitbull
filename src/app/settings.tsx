import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTitle } from '@/components/app-title';
import { Screen } from '@/components/screen';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  const insets = useSafeAreaInsets();

  return (
    <Screen centered style={{ gap: 24 }}>
      <AppTitle style={{ position: 'absolute', top: insets.top + 16, left: 24 }} />
      <ThemedText type="subtitle">Ustawienia</ThemedText>
      <ThemedButton title="Wyloguj się" onPress={() => supabase.auth.signOut()} style={{ alignSelf: 'stretch' }} />
    </Screen>
  );
}
