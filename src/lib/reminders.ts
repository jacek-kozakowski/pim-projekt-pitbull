import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const KEY = 'reminders';
const CHANNEL = 'reminders';

export const REMINDERS = [
    { hour: 8, body: 'Twoje ECTS same się nie zdobędą!' },
    { hour: 12, body: 'Przerwa między zajęciami? Zakręć bębnami.' },
    { hour: 16, body: 'Sesja nadchodzi. Może czas zakręcić?' },
    { hour: 20, body: 'Dawno Cię nie było. Automat czeka!' },
];

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export async function isRemindersEnabled() {
    return (await AsyncStorage.getItem(KEY)) === 'on';
}

export async function enableReminders() {
    if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL, {
            name: 'Przypomnienia',
            importance: Notifications.AndroidImportance.DEFAULT,
        });
    }

    let { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
        status = (await Notifications.requestPermissionsAsync()).status;
    }
    if (status !== 'granted') return false;

    await Notifications.cancelAllScheduledNotificationsAsync();
    for (const { hour, body } of REMINDERS) {
        await Notifications.scheduleNotificationAsync({
            content: { title: 'Jednoręki Bandyta ECTS', body },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute: 0,
                channelId: CHANNEL,
            },
        });
    }
    await AsyncStorage.setItem(KEY, 'on');
    return true;
}

export async function disableReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(KEY, 'off');
}
