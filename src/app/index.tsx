import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { Alert, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTitle } from '@/components/app-title';
import QuizModal from '@/components/quiz-modal';
import Reel, { ITEM_H } from '@/components/reel';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';


const BETS = [1, 5, 10];
const ACCENT = '#D97706';
const BET_VISIBLE_MS = 1200;
const RESULT_VISIBLE_MS = 2000;

export default function GameScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { profile, refreshProfile } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(5);
  const [spinId, setSpinId] = useState(0);
  const [reels, setReels] = useState([0, 0, 0]);
  const [lastWin, setLastWin] = useState<number | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [shownBalance, setShownBalance] = useState<number | null>(null);
  const [change, setChange] = useState<number | null>(null);

  const stopped = useRef(0);
  const winRef = useRef(0);

  const balance = profile?.balance ?? 0;
  const displayBalance = shownBalance ?? balance;

  const changeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const resultTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function showChange(value: number, ms: number) {
    clearTimeout(changeTimer.current);
    setChange(value);
    changeTimer.current = setTimeout(() => setChange(null), ms);
  }

  function hideChange() {
    clearTimeout(changeTimer.current);
    setChange(null);
  }

  function showResult(win: number) {
    clearTimeout(resultTimer.current);
    setLastWin(win);
    resultTimer.current = setTimeout(() => setLastWin(null), RESULT_VISIBLE_MS);
  }

  useEffect(
    () => () => {
      clearTimeout(changeTimer.current);
      clearTimeout(resultTimer.current);
    },
    []
  );

  async function spin() {
    if (spinning) return;
    if (balance < bet) {
      Alert.alert('Brak środków', 'Nie masz wystarczającej ilości środków na koncie, aby wykonać zakład.');
      return;
    }
    setSpinning(true);
    clearTimeout(resultTimer.current);
    setLastWin(null);
    setShownBalance(balance - bet);
    showChange(-bet, BET_VISIBLE_MS);


    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const { data, error } = await supabase.rpc('spin', { p_bet: bet });

    if (error) {
      setSpinning(false);
      setShownBalance(null);
      hideChange();
      const msg = error.message;
      Alert.alert(
        'Błąd',
        msg.includes('insufficient funds') ? 'Nie masz wystarczającej ilości środków na koncie, aby wykonać zakład.'
          : msg.includes('Network') ? 'Błąd sieci, spróbuj ponownie później.' : msg
      );
      refreshProfile();
      return;
    }
    stopped.current = 0;
    winRef.current = data.win;
    setReels(data.reels);
    setSpinId((prev) => prev + 1);
  }

  async function onReelStop() {
    stopped.current += 1;
    Haptics.selectionAsync();
    if (stopped.current < 3) return;

    await refreshProfile();
    setShownBalance(null);
    if (winRef.current > 0) showChange(winRef.current, RESULT_VISIBLE_MS);
    else hideChange();
    showResult(winRef.current);
    setSpinning(false);
    if (winRef.current > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  function closeQuiz() {
    setQuizOpen(false);
    refreshProfile();
  }

  return (
    <ThemedView style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <AppTitle style={{ position: 'absolute', top: insets.top + 16, left: 24 }} />
      <ThemedText style={{ fontSize: 24, lineHeight: 32, fontWeight: '600' }}>Cześć, {profile?.nick}</ThemedText>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 12, marginBottom: 24 }}>
        <ThemedText style={{ fontSize: 40, lineHeight: 48, fontWeight: '700' }}>
          {displayBalance} ECTS
        </ThemedText>
        {change !== null && (
          <ThemedText style={{ fontSize: 24, lineHeight: 32, fontWeight: '700', color: change < 0 ? '#DC2626' : '#16A34A' }}>
            {change > 0 ? `+${change}` : change}
          </ThemedText>
        )}
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 8,
          padding: 12,
          borderRadius: 20,
          backgroundColor: theme.backgroundSelected,
        }}>
        {[0, 1, 2].map((i) => (
          <Reel
            key={i}
            spinId={spinId}
            target={reels[i]}
            delay={i * 300}
            onStop={onReelStop}
            color={theme.text}
          />
        ))}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 12,
            right: 12,
            top: 12 + ITEM_H + ITEM_H / 2 - 1,
            height: 2,
            backgroundColor: ACCENT,
          }}
        />
      </View>

      <View style={{ height: 40, justifyContent: 'center', alignItems: 'center' }}>
        {lastWin !== null && (
          <ThemedText style={{ fontWeight: '700', lineHeight: 24 }}>
            {lastWin > 0 ? `Wygrana: +${lastWin} ECTS` : 'Pusta runda'}
          </ThemedText>
        )}
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {BETS.map((b) => (
          <ThemedButton key={b} title={`${b} ECTS`} onPress={() => !spinning && setBet(b)} style={{ flex: 1, opacity: b === bet ? 1 : 0.45 }} />
        ))}
      </View>

      {balance < 1 && !spinning ? (
        <ThemedButton title="Przywróć punkty" onPress={() => setQuizOpen(true)} />
      ) : (
        <ThemedButton title="SPIN" onPress={spin} loading={spinning} />
      )}

      {quizOpen && <QuizModal onClose={closeQuiz} />}
    </ThemedView>
  );
}
