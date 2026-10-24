import {useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import {supabase} from '@/lib/supabase';


export type SpinRow = {
    id: number;
    bet: number;
    reels: number[];
    win: number;
    created_at: string;
}

export function useSpinHistory(limit = 20) {
    const [spins, setSpins] = useState<SpinRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback( async () => {
        const { data, error } = await supabase.from('spins').select('id, bet, reels, win, created_at')
        .order('created_at', { ascending: false }).limit(limit);

        if (error) setError('Nie udało się pobrać historii spinów');
        else {
            setError(null);
            setSpins(data ?? []);
        }
        setLoading(false);
    }, [limit]);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    return { spins, loading, error, reload: load };
}