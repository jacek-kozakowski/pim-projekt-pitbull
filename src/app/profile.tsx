import { AppTitle } from '@/components/app-title';
import { Screen } from '@/components/screen';
import { ThemedButton } from '@/components/themed-button';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useSpinHistory } from '@/hooks/use-spin-history';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/lib/auth';
import { useIsFocused } from 'expo-router';
import { useState } from 'react';
import { FlatList, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const PAGE_SIZE = 8;

export default function Profile() {
    return useIsFocused() ? <ProfileContent /> : null;
}

function ProfileContent() {
    const theme = useTheme();
    const insets = useSafeAreaInsets();
    const { profile } = useAuth();
    const [page, setPage] = useState(0);
    const [pageInput, setPageInput] = useState<string | null>(null);
    const { spins, total, loading, error } = useSpinHistory(page, PAGE_SIZE);

    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    function goToTypedPage() {
        const n = parseInt(pageInput ?? '', 10);
        if (!Number.isNaN(n)) setPage(Math.min(Math.max(n, 1), pages) - 1);
        setPageInput(null);
    }

    const bottomPad = insets.bottom + BottomTabInset + Spacing.three;
    const pagerButton = { paddingVertical: 6, paddingHorizontal: 18 };

    return (
        <Screen
            style={{
                paddingTop: insets.top + Spacing.four,
                paddingBottom: 0,
                paddingLeft: insets.left + Spacing.four,
                paddingRight: insets.right + Spacing.four,
            }}>
            <AppTitle style={{ marginBottom: 16 }} />
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
                contentContainerStyle={{ paddingBottom: pages > 1 ? 8 : bottomPad }}
                keyExtractor={(s) => String(s.id)}
                ItemSeparatorComponent={() => <View style={{ height: 6 }} />}
                renderItem={({ item }) => {
                    const net = item.win - item.bet;
                    return (
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                padding: 10,
                                borderRadius: 12,
                                backgroundColor: theme.backgroundElement,
                            }}>
                            <View>
                                <ThemedText style={{ fontWeight: '600' }}>
                                    Stawka {item.bet} · Wypłata {item.win}
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
                                style={{ fontWeight: '700', color: net > 0 ? '#16A34A' : net < 0 ? '#DC2626' : theme.accent }}>
                                {net > 0 ? `+${net}` : net} ECTS
                            </ThemedText>
                        </View>
                    );
                }}
            />

            {pages > 1 && (
                <View
                    style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        paddingTop: 8,
                        paddingBottom: bottomPad,
                    }}>
                    <ThemedButton
                        title="Wstecz"
                        disabled={page === 0}
                        onPress={() => setPage(page - 1)}
                        style={[pagerButton, page === 0 && { opacity: 0.45 }]}
                    />
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <ThemedText>Strona</ThemedText>
                        <TextInput
                            value={pageInput ?? String(page + 1)}
                            onFocus={() => setPageInput(String(page + 1))}
                            onChangeText={setPageInput}
                            onSubmitEditing={goToTypedPage}
                            onEndEditing={goToTypedPage}
                            keyboardType="number-pad"
                            returnKeyType="done"
                            selectTextOnFocus
                            maxLength={4}
                            style={{
                                minWidth: 44,
                                paddingVertical: 4,
                                paddingHorizontal: 8,
                                borderRadius: 8,
                                textAlign: 'center',
                                color: theme.text,
                                backgroundColor: theme.backgroundSelected,
                            }}
                        />
                        <ThemedText>z {pages}</ThemedText>
                    </View>
                    <ThemedButton
                        title="Dalej"
                        disabled={page >= pages - 1}
                        onPress={() => setPage(page + 1)}
                        style={[pagerButton, page >= pages - 1 && { opacity: 0.45 }]}
                    />
                </View>
            )}
        </Screen>
    );
}
