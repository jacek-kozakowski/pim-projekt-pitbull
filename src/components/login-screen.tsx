import { useState } from "react";
import { Alert, Pressable, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { supabase } from "@/lib/supabase";
import { ThemedButton } from '@/components/themed-button';
import { ThemedInput } from '@/components/themed-input';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { signInWithGoogle } from '@/lib/google-auth';

export default function LoginScreen() {
    const theme = useTheme();
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nick, setNick] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(){
        Keyboard.dismiss();
        if (!email || !password || (mode === 'register' && !nick)) {
            Alert.alert('Error', 'Uzupełnij wszystkie pola');
            return;
        }
        setBusy(true);
        if (mode === 'login') {
            const { error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) Alert.alert('Error', error.message);
        } else {
            const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nick } }, });
            if (error){
                Alert.alert('Error', error.message);
            }else if (!data.session){
                Alert.alert('Success', 'Sprawdź swoją skrzynkę pocztową i kliknij w link aktywacyjny');
                setMode('login');
            }
        }
        setBusy(false);
    }
    async function google() {
        Keyboard.dismiss();
        setBusy(true);
        try{
            await signInWithGoogle();
        } catch (error : any) {
            Alert.alert('Error', error.message || 'Nie udało się zalogować przez Google!');
        } finally {
            setBusy(false);
        }
    }

    return (
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag">

          <Pressable onPress={Keyboard.dismiss} accessible={false}>
            <ThemedText style={{ fontSize: 28, lineHeight: 36, fontWeight: '700', marginBottom: 24 }}>
                {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
            </ThemedText>

            {mode === 'register' && (
            <ThemedInput
                placeholder="Nick"
                value={nick}
                onChangeText={setNick}
                autoCapitalize="none"
            />
            )}
            <ThemedInput
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />
            <ThemedInput
                placeholder="Hasło (min. 6 znaków)"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            <ThemedButton
                title={mode === 'login' ? 'Zaloguj' : 'Zarejestruj'}
                onPress={submit}
                loading={busy}
            />
            <ThemedButton 
                title = "Zaloguj przez Google"
                onPress={google}
                loading={busy}
                style={{ marginTop: 16 }}
            />

            <ThemedButton
                variant="link"
                title={mode === 'login' ? 'Nie masz konta? Utwórz konto' : 'Masz już konto? Zaloguj się'}
                onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
                style={{ marginTop: 16 }}
            />
            

          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    );
}
