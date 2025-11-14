import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure how notifications are handled when app is foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    // iOS specific presentation behavior
    shouldShowBanner: true,
    shouldShowList: true,
  }) as any,
} as any);

export async function initNotifications() {
  // Request permissions
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Default',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  return true;
}

export async function scheduleDailyReminder(hour = 9, minute = 0) {
  const trigger: any = { hour, minute, repeats: true };
  return Notifications.scheduleNotificationAsync({
    content: {
      title: '¡No te olvides! 💪',
      body: 'Haz tu rutina diaria hoy.',
      sound: true,
      data: { tag: 'daily-reminder' },
    },
    trigger,
  });
}

export async function cancelScheduledNotification(id: string) {
  try { await Notifications.cancelScheduledNotificationAsync(id); } catch {}
}

export async function scheduleTimerEndNotification(secondsFromNow: number, payload?: { routineId?: string }): Promise<string | null> {
  // No schedule if non-positive; avoids immediate notification on press
  if (!Number.isFinite(secondsFromNow) || secondsFromNow <= 0) return null;
  const trigger: any = { seconds: Math.ceil(secondsFromNow) };
  return Notifications.scheduleNotificationAsync({
    content: {
      title: 'Empezó el descanso ⏱️',
      body: 'Tiempo de descanso.',
      sound: true,
      data: { tag: 'rest-end', routineId: payload?.routineId },
    },
    trigger,
  });
}

export async function ensureDailyReminderIfNeeded(hour = 9, minute = 0) {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const exists = scheduled.some((n) => (n.content.data as any)?.tag === 'daily-reminder');
    if (!exists) {
      await scheduleDailyReminder(hour, minute);
    }
  } catch {}
}

export async function cancelDailyReminders() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    const ids = scheduled.filter((n) => (n.content.data as any)?.tag === 'daily-reminder').map((n) => n.identifier);
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  } catch {}
}
