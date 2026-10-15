import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, Text, TextInput, View } from "react-native";
import { supabase } from "@/lib/supabase";

export default function LoginScreen() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nick, setNick] = useState('');
    const [busy, setBusy] = useState(false);

    async function submit(){
        if (!email || !password || (mode === 'register' && !nick)) {
            Alert.alert('Error', 'Uzupełnij wszystkie pola');
            return;
        }
        setBusy(true);
        const { error } = mode === 'login'
            ? await supabase.auth.signInWithPassword({ email, password })
            : await supabase.auth.signUp({ email, password, options: { data: { nick } } });
        setBusy(false);
        if (error) Alert.alert('Error', error.message);
    }

    const input = {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 14,
        borderRadius: 12,
        marginBottom: 12,
    } as const;

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
        <Text style={{ fontSize: 28, fontWeight: '700', marginBottom: 24 }}>
            {mode === 'login' ? 'Zaloguj się' : 'Utwórz konto'}
        </Text>

        {mode === 'register' && (
            <TextInput style={input} placeholder="Nick" value={nick} onChangeText={setNick} autoCapitalize="none" />
        )}
        <TextInput
            style={input}
            placeholder="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
        />
        <TextInput style={input} placeholder="Hasło (min. 6 znaków)" value={password} onChangeText={setPassword} secureTextEntry />

        <Pressable
            onPress={submit}
            disabled={busy}
            style={{ backgroundColor: '#D97706', padding: 16, borderRadius: 999, alignItems: 'center' }}>
            {busy ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: '700' }}>{mode === 'login' ? 'Zaloguj' : 'Zarejestruj'}</Text>}
        </Pressable>

        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')} style={{ marginTop: 16, alignItems: 'center' }}>
            <Text>{mode === 'login' ? 'Nie masz konta? Utwórz konto' : 'Masz już konto? Zaloguj się'}</Text>
        </Pressable>
        </View>
    );
}