import { useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform} from 'react-native';

import {ThemedButton} from '@/components/themed-button';
import {ThemedInput} from '@/components/themed-input';
import {ThemedText} from '@/components/themed-text';
import {useTheme} from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

export default function NickScreen({onDone}: {onDone: () => void}) {
    const theme = useTheme();
    const [nick, setNick] = useState('');
    const [busy, setBusy] = useState(false);

    async function save_nick() {
        Keyboard.dismiss();
        if (nick.trim().length < 3) {
            Alert.alert('Error', 'Nick musi mieć co najmniej 3 znaki');
            return;
        }
        setBusy(true);
        const { error } = await supabase.rpc('set_nick', { p_nick: nick });
        setBusy(false);
        if (error) {
            Alert.alert(
                'Error',
                error.message.includes('nick_taken') ? 'Ten nick jest już zajęty' : error.message.includes('invalid_nick') ? 'Nick musi mieć od 3 do 20 znaków' : error.message
            );
            return;
        }
        onDone();

    }

    return (
    <KeyboardAvoidingView
        style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.background }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ThemedText style={{ fontSize: 28, lineHeight: 36, fontWeight: '700', marginBottom: 8 }}>
            Wybierz nick
        </ThemedText>
        <ThemedText style={{ marginBottom: 24 }}>
            Będzie widoczny w rankingu innych graczy.
        </ThemedText>
        <ThemedInput
            placeholder="Nick"
            value={nick}
            onChangeText={setNick}
            autoCapitalize="none"
            maxLength={20}
        />
        <ThemedButton title="Zapisz" onPress={save_nick} loading={busy} />
    </KeyboardAvoidingView>
    );
}