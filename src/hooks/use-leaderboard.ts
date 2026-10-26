import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {supabase} from '@/lib/supabase';

export type Period = 'day' | 'week' | 'all'; 
export type LeaderRow = {
    user_id: string;
    nick: string;
    spins: number;
    net: number;
    win_pct: number;
};

export function useLeaderboard(period: Period) {
    const [rows, setRows] = useState<LeaderRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const { data, error } = await supabase.rpc('leaderboard', { p_period: period });
        if (error) setError('Nie udało się pobrać rankingu. Sprawdź połączenie z internetem i spróbuj ponownie. ' + error.message);
        else { 
            setError(null);
            setRows(data ?? []);
        }
        setLoading(false);
    }, [period]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    return { rows, loading, error, reload: load };
}