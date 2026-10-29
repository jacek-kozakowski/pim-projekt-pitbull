import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, View } from 'react-native';

import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

type Question = { attempt_id: number; question: string; options: string[] };

const COOLDOWN_S = 30;

function errorText(message: string) {
    if (message.includes('quiz_cooldown')) return 'Odczekaj chwilę przed kolejnym pytaniem.';
    if (message.includes('balance_not_zero')) return 'Masz jeszcze punkty ECTS. Quiz jest dostępny, gdy ich zabraknie.';
    return 'Nie udało się połączyć z serwerem. Spróbuj ponownie później.';
}

export default function QuizModal({ onClose }: { onClose: () => void }) {
    const theme = useTheme();
    const [question, setQuestion] = useState<Question | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [busy, setBusy] = useState(false);
    const [wait, setWait] = useState(0);
    const [round, setRound] = useState(0);

    useEffect(() => {
        let active = true;
        (async () => {
            const { data, error } = await supabase.rpc('get_quiz_question');
            if (!active) return;
            if (error) {
                setMessage(errorText(error.message));
                const left = error.message.match(/quiz_cooldown:(\d+)/);
                if (left) setWait(Number(left[1]));
            } else setQuestion(data);
        })();
        return () => {
            active = false;
        };
    }, [round]);

    useEffect(() => {
        if (wait <= 0) return;
        const id = setTimeout(() => setWait(wait - 1), 1000);
        return () => clearTimeout(id);
    }, [wait]);

    async function answer(index: number) {
        if (!question || busy) return;
        setBusy(true);
        const { data, error } = await supabase.rpc('answer_quiz', {
            p_attempt_id: question.attempt_id,
            p_answer: index,
        });
        setBusy(false);
        setQuestion(null);
        if (error) {
            setMessage(errorText(error.message));
        } else if (data.correct) {
            setSuccess(true);
            setMessage(`Dobra odpowiedź! Dostajesz +${data.reward} ECTS.`);
        } else {
            setMessage('Zła odpowiedź. Spróbuj ponownie za chwilę.');
            setWait(COOLDOWN_S);
        }
    }

    function retry() {
        setMessage(null);
        setRound(round + 1);
    }

    return (
        <Modal transparent animationType="fade" onRequestClose={onClose}>
            <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <View
                    style={{
                        padding: 20,
                        borderRadius: 20,
                        gap: 12,
                        borderWidth: 2,
                        borderColor: theme.accent,
                        backgroundColor: theme.backgroundElement,
                    }}>
                    {!question && !message && <ActivityIndicator color={theme.accent} />}

                    {question && (
                        <>
                            <ThemedText style={{ fontSize: 18, lineHeight: 26, fontWeight: '700' }}>
                                {question.question}
                            </ThemedText>
                            {question.options.map((option, i) => (
                                <ThemedButton key={i} title={option} disabled={busy} onPress={() => answer(i)} />
                            ))}
                        </>
                    )}

                    {message && (
                        <>
                            <ThemedText style={{ fontSize: 18, lineHeight: 26, fontWeight: '700' }}>{message}</ThemedText>
                            {!success && (
                                <ThemedButton
                                    title={wait > 0 ? `Spróbuj ponownie (${wait} s)` : 'Spróbuj ponownie'}
                                    disabled={wait > 0}
                                    onPress={retry}
                                    style={wait > 0 ? { opacity: 0.45 } : undefined}
                                />
                            )}
                            <ThemedButton title="Zamknij" onPress={onClose} />
                        </>
                    )}
                </View>
            </View>
        </Modal>
    );
}
