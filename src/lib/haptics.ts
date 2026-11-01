import * as Haptics from 'expo-haptics';
import { isOn } from '@/lib/settings';

export const haptic = {
    impact: () => {
        if (isOn('haptics')) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
    select: () => {
        if (isOn('haptics')) Haptics.selectionAsync();
    },
    success: () => {
        if (isOn('haptics')) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
};