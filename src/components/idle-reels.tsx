import { useEffect, useState } from 'react';
import { View } from 'react-native';

import Reel, { ITEM_H, SYMBOLS } from '@/components/reel';
import { useTheme } from '@/hooks/use-theme';

const SPIN_EVERY_MS = 4000;
const SCALE = 0.8;
const FULL_HEIGHT = 264;

export default function IdleReels() {
    const theme = useTheme();
    const [spinId, setSpinId] = useState(0);
    const [targets, setTargets] = useState([0, 0, 0]);

    useEffect(() => {
        const id = setInterval(() => {
            setTargets([0, 1, 2].map(() => Math.floor(Math.random() * SYMBOLS.length)));
            setSpinId((prev) => prev + 1);
        }, SPIN_EVERY_MS);
        return () => clearInterval(id);
    }, []);

    return (
        <View style={{ height: FULL_HEIGHT * SCALE, justifyContent: 'center', marginBottom: 24 }}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignSelf: 'center',
                    gap: 8,
                    padding: 12,
                    borderRadius: 20,
                    backgroundColor: theme.backgroundSelected,
                    transform: [{ scale: SCALE }],
                }}>
                {targets.map((target, i) => (
                    <Reel
                        key={i}
                        spinId={spinId}
                        target={target}
                        delay={i * 300}
                        onStop={() => { }}
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
                        backgroundColor: theme.accent,
                    }}
                />
            </View>
        </View>
    );
}
