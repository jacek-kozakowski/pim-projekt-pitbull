import * as Haptics from 'expo-haptics';
import {useRef, useState} from 'react';
import {Alert, View} from 'react-native';

import Reel, {ITEM_H} from '@/components/reel';
import {ThemedButton} from '@/components/themed-button';
import {useAuth} from '@/lib/auth';
import {supabase} from '@/lib/supabase';
import {useTheme} from '@/hooks/use-theme';
import {ThemedView} from '@/components/themed-view';
import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';


const BETS = [1, 5, 10];
const ACCENT = '#D97706';

export default function GameScreen() {
  const theme = useTheme();
  const { profile, refreshProfile } = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [bet, setBet] = useState(5);
  const [spinId, setSpinId] = useState(0);
  const [reels, setReels] = useState([0, 0, 0]);
  const [lastWin, setLastWin] = useState<number | null>(null);

  const stopped = useRef(0);
  const winRef = useRef(0);

  const balance = profile?.balance ?? 0;
  
  async function spin() {
    if (spinning) return;
    if (balance < bet) {
      Alert.alert('Brak środków', 'Nie masz wystarczającej ilości środków na koncie, aby wykonać zakład.');
      return;
    }
    setSpinning(true);
    setLastWin(null);
    

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const {data, error} = await supabase.rpc('spin', {p_bet: bet});

    if (error) {
      setSpinning(false);
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
    if (stopped.current < 3 ) return;

    await refreshProfile();
    setLastWin(winRef.current);
    setSpinning(false);
    if (winRef.current > 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  }

  async function restore() {
    return; //TODO implement restore points with questions 
  }

  return (
    <ThemedView style={{ flex: 1, padding: 24, justifyContent: 'center' }}>
      <ThemedText style={{ fontSize: 14, lineHeight: 20 }}>Cześć, {profile?.nick}</ThemedText>
      <ThemedText style={{ fontSize: 40, lineHeight: 48, fontWeight: '700', marginBottom: 24 }}>
        {balance} ECTS
      </ThemedText>

      {/* kontener bębnów */}
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
        {/* linia wygranej */}
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
          <ThemedButton key={b} title={`${b} ECTS`} onPress={() => !spinning && setBet(b)} style={{ flex: 1, opacity: b === bet ? 1 : 0.45 }}/>
        ))}
      </View>

      {balance < 1 && !spinning ? (
        <ThemedButton title="Przywróć punkty" onPress={restore} />
      ) : (
        <ThemedButton title="SPIN" onPress={spin} loading={spinning} />
      )}
    </ThemedView>
  );
}
