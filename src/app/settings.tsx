import { Screen } from '@/components/screen';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  return (
    <Screen centered style={{ gap: 24 }}>
      <ThemedText type="subtitle">Ustawienia</ThemedText>
      <ThemedButton title="Wyloguj się" onPress={() => supabase.auth.signOut()} style={{ alignSelf: 'stretch' }} />
    </Screen>
  );
}
