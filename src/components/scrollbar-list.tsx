import { useState } from 'react';
import { FlatList, View, type FlatListProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export function ScrollbarList<T>({ onScroll, onLayout, onContentSizeChange, ...props }: FlatListProps<T>) {
    const theme = useTheme();
    const [viewHeight, setViewHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);
    const [offset, setOffset] = useState(0);

    const scrollable = viewHeight > 0 && contentHeight > viewHeight + 1;
    const thumbHeight = scrollable ? Math.max(viewHeight * (viewHeight / contentHeight), 28) : 0;
    const maxOffset = Math.max(contentHeight - viewHeight, 1);
    const thumbTop = scrollable ? (Math.min(Math.max(offset, 0), maxOffset) / maxOffset) * (viewHeight - thumbHeight) : 0;

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                {...props}
                showsVerticalScrollIndicator={false}
                scrollEventThrottle={16}
                onLayout={(e) => {
                    setViewHeight(e.nativeEvent.layout.height);
                    onLayout?.(e);
                }}
                onContentSizeChange={(w, h) => {
                    setContentHeight(h);
                    onContentSizeChange?.(w, h);
                }}
                onScroll={(e) => {
                    setOffset(e.nativeEvent.contentOffset.y);
                    onScroll?.(e);
                }}
            />
            {scrollable && (
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        right: -12,
                        top: thumbTop,
                        width: 4,
                        height: thumbHeight,
                        borderRadius: 2,
                        backgroundColor: theme.textSecondary,
                        opacity: 0.7,
                    }}
                />
            )}
        </View>
    );
}
