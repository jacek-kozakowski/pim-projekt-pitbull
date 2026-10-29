import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { supabase } from '@/lib/supabase';


export type SpinRow = {
    id: number;
    bet: number;
    reels: number[];
    win: number;
    created_at: string;
}

export function useSpinHistory(page: number, pageSize: number) {
    const [spins, setSpins] = useState<SpinRow[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        const from = page * pageSize;
        const { data, count, error } = await supabase
            .from('spins')
            .select('id, bet, reels, win, created_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .order('id', { ascending: false })
            .range(from, from + pageSize - 1);

        if (error) setError('Nie udało się pobrać historii spinów');
        else {
            setError(null);
            setSpins(data ?? []);
            setTotal(count ?? 0);
        }
        setLoading(false);
    }, [page, pageSize]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    return { spins, total, loading, error, reload: load };
}
