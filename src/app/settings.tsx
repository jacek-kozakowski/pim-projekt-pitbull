import { Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function Settings() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Settings</Text>
      <Pressable onPress={() => supabase.auth.signOut()}>
        <Text>Wyloguj się</Text>
      </Pressable>
    </View>
  );
}