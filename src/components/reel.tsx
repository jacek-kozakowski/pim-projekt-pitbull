import {useEffect, useRef} from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { SymbolView } from 'expo-symbols';

// Order matters: the server returns the index into this list.
export const SYMBOLS = [
    { ios: '7.square.fill', android: 'filter_7' },
    { ios: 'star.fill', android: 'star' },
    { ios: 'cup.and.saucer.fill', android: 'coffee' },
    { ios: 'pencil', android: 'edit' },
    { ios: 'square.inset.filled', android: 'stop' },
] as const;
const N = SYMBOLS.length;
const ICON_SIZE = 44;
const REPEATS = 10;
export const ITEM_H = 80;


const restPos = (t: number ) => N + t - 1; // t in the middle of reel
const endPos = (t: number) => (REPEATS - 1) * N + t - 1;

type Props = {
    spinId: number;
    target: number; // symbol index to stop from server
    delay: number;
    onStop: () => void;
    color: string;
}

export default function Reel({ spinId, target, delay, onStop, color }: Props) {
    const y = useSharedValue(-restPos(0) * ITEM_H);
    const current = useRef(0);

    useEffect(() => {
        if (spinId === 0) return;
        const from = current.current;
        const to = target;
        current.current = to;

        const startY = -restPos(from) * ITEM_H;
        const endY = -endPos(to) * ITEM_H;
        const restY = -restPos(to) * ITEM_H;

        y.value = startY;
        y.value = withDelay(
            delay,
            withTiming(
                endY,
                { duration: 1800, easing: Easing.out(Easing.cubic) },
                (finished) => {
                    if (finished) {
                        y.value = restY;
                        runOnJS(onStop)();
                    }
                }
            )
        )
    }, [spinId]);

    const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }]}));
    const strip = Array.from({ length: (REPEATS + 1) * N}, (_, i) => SYMBOLS[i % N]); // strip of symbols to be rendered

    return (
        <View style={styles.window}>
            <Animated.View style={style}>
                {strip.map((s, i)=> (
                    <View key={i} style={styles.item}>
                        <SymbolView
                            name={{ ios: s.ios, android: s.android, web: s.android }}
                            tintColor={color}
                            size={ICON_SIZE}
                        />
                    </View>
                ))}
            </Animated.View>

        </View>
    )

}

const styles = StyleSheet.create({
    window: { width: 90, height: ITEM_H * 3, overflow: 'hidden'}, item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center'}
});
