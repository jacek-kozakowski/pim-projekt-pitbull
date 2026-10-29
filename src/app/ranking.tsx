import { useIsFocused } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTitle } from '@/components/app-title';
import { Screen } from '@/components/screen';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { Period, useLeaderboard } from '@/hooks/use-leaderboard';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';

const PODIUM = [
  { ios: 'crown.fill', android: 'crown', color: '#F5B301' },
  { ios: 'medal.fill', android: 'military_tech', color: '#9CA3AF' },
  { ios: 'medal.fill', android: 'military_tech', color: '#CD7F32' },
] as const;

const TABS: { key: Period; label: string }[] = [
  { key: 'day', label: 'Dziś' },
  { key: 'week', label: 'Tydzień' },
  { key: 'all', label: 'Ogółem' },
];

export default function Ranking() {
  return useIsFocused() ? <RankingContent /> : null;
}

function RankingContent() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const [period, setPeriod] = useState<Period>('day');
  const { rows, loading, error } = useLeaderboard(period);

  return (
    <Screen
      style={{
        paddingTop: insets.top + Spacing.four,
        paddingBottom: 0,
        paddingLeft: insets.left + Spacing.four,
        paddingRight: insets.right + Spacing.four,
      }}>
      <AppTitle style={{ marginBottom: 16 }} />
      <ThemedText type="subtitle" style={{ marginBottom: 16 }}>
        Ranking
      </ThemedText>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
        {TABS.map((t) => (
          <ThemedButton
            key={t.key}
            title={t.label}
            onPress={() => setPeriod(t.key)}
            style={{ flex: 1, opacity: t.key === period ? 1 : 0.45 }}
          />
        ))}
      </View>

      {error && <ThemedText>{error}</ThemedText>}
      {!loading && !error && rows.length === 0 && (
        <ThemedText>Nikt jeszcze nie grał w tym okresie.</ThemedText>
      )}

      <FlatList
        data={rows}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
        }}
        keyExtractor={(r) => r.user_id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item, index }) => {
          const me = item.user_id === session?.user.id;
          return (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 14,
                borderRadius: 12,
                backgroundColor: theme.backgroundElement,
                borderWidth: me ? 2 : 0,
                borderColor: '#D97706',
              }}>
              {index < PODIUM.length ? (
                <View style={{ width: 36 }}>
                  <SymbolView
                    name={{ ios: PODIUM[index].ios, android: PODIUM[index].android, web: PODIUM[index].android }}
                    tintColor={PODIUM[index].color}
                    size={26}
                  />
                </View>
              ) : (
                <ThemedText style={{ width: 36, fontWeight: '700' }}>#{index + 1}</ThemedText>
              )}
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '600' }}>{item.nick}</ThemedText>
                <ThemedText style={{ fontSize: 12, lineHeight: 16, opacity: 0.6 }}>
                  {item.spins} obrotów · {item.win_pct}% wygranych
                </ThemedText>
              </View>
              <ThemedText
                style={{ fontWeight: '700', color: item.net >= 0 ? '#16A34A' : '#DC2626' }}>
                {item.net > 0 ? `+${item.net}` : item.net}
              </ThemedText>
            </View>
          );
        }}
      />
    </Screen>
  );
}
