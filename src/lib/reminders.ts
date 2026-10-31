import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

const KEY = 'reminders';
const CHANNEL = 'reminders';

export const HOURS = [8, 12, 16, 20];

export const MESSAGES = [
    'Twoje ECTS same się nie zdobędą! Zagraj!',
    'Przerwa między zajęciami? Zakręć bębnami!',
    'Studia to głupota. Może czas zakręcić?',
    'Kto nie kręci, ten nie trafia! Czas zakręcić!',
    'Łatwiej zdobyć te ECTS niż zaliczyć zajęcia. Zagraj!',
    'Grasz czy nie grasz, ECTSów i tak nie zdobędziesz. Czas zakręcić!',
    'Czasem warto zrobić sobie przerwę od nauki. Na przykład przerwę na automaty!',
    'Wszyscy w końcu Cię opuszczą, oprócz automatów. Graj teraz!',
    'Krótka piłka: grasz czy nie grasz?',
    'I tak nauka Ci nic nie da. Dawaj na automaty!'
]

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

function pickMessages(n: number) { 
    const pool = [...MESSAGES];
    for (let i = pool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, n);
}

async function schedule() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const texts = pickMessages(HOURS.length);
    for (let i = 0; i < HOURS.length; i++) {
        await Notifications.scheduleNotificationAsync({
            content: { title: 'Jednoręki Bandyta ECTS', body: texts[i] },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: HOURS[i],
                minute: 0,
                channelId: CHANNEL
            }
        })
    }
}

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

    await schedule();
    await AsyncStorage.setItem(KEY, 'on');
    return true;
}

export async function refreshReminders() {
    if (!(await isRemindersEnabled())) return;
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return;
    await schedule();
}

export async function disableReminders() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await AsyncStorage.setItem(KEY, 'off');
}
