import { Screen } from '@/components/screen';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/hooks/use-theme';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSpinHistory } from '@/hooks/use-spin-history';
import { BottomTabInset, Spacing } from '@/constants/theme';

export default function Profile() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const {profile } = useAuth();
    const { spins, loading, error} = useSpinHistory(20);

    return (
        <Screen
            style={{
                paddingTop: insets.top + Spacing.four,
                paddingBottom: 0,
                paddingLeft: insets.left + Spacing.four,
                paddingRight: insets.right + Spacing.four,
            }}>
            <ThemedText type="subtitle" style={{ marginBottom: 4 }}>
                Cześć, {profile?.nick}!
            </ThemedText>
            <ThemedText style={{ marginBottom: 24 }}>
                Twój aktualny stan konta: {profile?.balance} ECTS
            </ThemedText>

            <ThemedText style={{ fontSize: 20, lineHeight: 28, fontWeight: '700', marginBottom: 12 }}>
                Historia gier
            </ThemedText>

            {error && <ThemedText>{error}</ThemedText>}
            {!loading && !error && spins.length === 0 && (
                <ThemedText>Brak obrotów. Zagraj pierwszy!</ThemedText>
            )}

            <FlatList
                data={spins}
                style={{ flex: 1 }}
                contentContainerStyle={{
                    paddingBottom: insets.bottom + BottomTabInset + Spacing.three,
                }}
                keyExtractor={(s) => String(s.id)}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => {
                    const net = item.win - item.bet;
                    return (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                padding: 14,
                                borderRadius: 12,
                                backgroundColor: theme.backgroundElement,
                            }}>
                            <View>
                                <ThemedText style={{ fontWeight: '600' }}>
                                    Stawka {item.bet} ECTS
                                </ThemedText>
                                <ThemedText style={{ fontSize: 12, lineHeight: 16, opacity: 0.6 }}>
                                    {new Date(item.created_at).toLocaleString('pl-PL', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </ThemedText>
                            </View>
                            <ThemedText
                                style={{ fontWeight: '700', color: net >= 0 ? '#16A34A' : '#DC2626' }}>
                                {net > 0 ? `+${net}` : net} ECTS
                            </ThemedText>
                        </View>
                    );
                }}
            />
        </Screen>
    );
}
