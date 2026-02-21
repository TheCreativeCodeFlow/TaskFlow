// Notification utilities for task deadlines

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permissions denied');
      return false;
    }

    // For Android, configure notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('task-reminders', {
        name: 'Task Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#00F5FF',
        sound: 'default',
      });
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

const ONE_MINUTE = 1000 * 60;
const ONE_DAY = 1000 * 60 * 60 * 24;

const atStartOfDay = (timestamp: number) => {
  const d = new Date(timestamp);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isFuture = (date: Date) => date.getTime() - Date.now() > ONE_MINUTE;

/**
 * Build a schedule of absolute dates for notifications.
 * - Regular reminders: every 2 days before the deadline (10:00 AM)
 * - Final day warning: exact deadline day (9:00 AM) with high priority
 * - Only schedule future times; never schedule immediate/past triggers.
 */
const buildNotificationSchedule = (deadlineTimestamp: number): Array<{ date: Date; isFinalDay: boolean; daysUntilDeadline: number }> => {
  const now = new Date();
  const deadlineDayStart = atStartOfDay(deadlineTimestamp);
  const daysUntilDeadline = Math.ceil((deadlineDayStart.getTime() - atStartOfDay(now.getTime()).getTime()) / ONE_DAY);

  if (daysUntilDeadline < 0) {
    return [];
  }

  const plan: Array<{ date: Date; isFinalDay: boolean; daysUntilDeadline: number }> = [];

  // Final-day warning at 9:00 AM
  const finalDay = new Date(deadlineDayStart);
  finalDay.setHours(9, 0, 0, 0);
  if (isFuture(finalDay)) {
    plan.push({ date: finalDay, isFinalDay: true, daysUntilDeadline: 0 });
  }

  // Regular reminders every 2 days before, at 10:00 AM
  for (let offset = 2; offset <= daysUntilDeadline; offset += 2) {
    const reminderDate = new Date(deadlineDayStart);
    reminderDate.setDate(reminderDate.getDate() - offset);
    reminderDate.setHours(10, 0, 0, 0);

    if (isFuture(reminderDate)) {
      plan.push({
        date: reminderDate,
        isFinalDay: false,
        daysUntilDeadline: offset,
      });
    }
  }

  // Ensure chronological order (soonest first)
  return plan.sort((a, b) => a.date.getTime() - b.date.getTime());
};

/**
 * Schedule notifications for a task with a deadline
 */
export const scheduleTaskNotifications = async (
  taskId: string,
  taskTitle: string,
  deadlineTimestamp: number
): Promise<string[]> => {
  try {
    const schedule = buildNotificationSchedule(deadlineTimestamp);
    const notificationIds: string[] = [];

    for (const item of schedule) {
      const daysLabel = item.daysUntilDeadline > 1
        ? `${item.daysUntilDeadline} days`
        : item.daysUntilDeadline === 1
          ? '1 day'
          : 'today';

      const body = item.isFinalDay
        ? `⚠️ Last day! "${taskTitle}" is due today.`
        : `⏰ Due in ${daysLabel}: "${taskTitle}"`;

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: item.isFinalDay ? '🔴 Task Deadline Today' : '📋 Task Reminder',
          body,
          data: { taskId },
          priority: item.isFinalDay
            ? Notifications.AndroidNotificationPriority.HIGH
            : Notifications.AndroidNotificationPriority.DEFAULT,
          sound: 'default',
        },
        trigger: {
          date: item.date,
          channelId: 'task-reminders',
        },
      });

      notificationIds.push(notificationId);
    }

    return notificationIds;
  } catch (error) {
    console.error('Error scheduling notifications:', error);
    return [];
  }
};

/**
 * Cancel all notifications for a task
 */
export const cancelTaskNotifications = async (notificationIds?: string[]): Promise<void> => {
  if (!notificationIds || notificationIds.length === 0) {
    return;
  }

  try {
    await Promise.all(
      notificationIds.map((id) => Notifications.cancelScheduledNotificationAsync(id))
    );
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

/**
 * Reschedule notifications for a task (cancel old + schedule new)
 */
export const rescheduleTaskNotifications = async (
  taskId: string,
  taskTitle: string,
  oldNotificationIds: string[] | undefined,
  newDeadlineTimestamp: number
): Promise<string[]> => {
  await cancelTaskNotifications(oldNotificationIds);
  return await scheduleTaskNotifications(taskId, taskTitle, newDeadlineTimestamp);
};

/**
 * Format deadline for display
 */
export const formatDeadline = (timestamp: number): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / ONE_DAY);

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 0) return `Overdue ${Math.abs(diffDays)}d`;

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
};

export const formatDeadlineRelative = (timestamp: number): string => {
  const nowStart = atStartOfDay(Date.now());
  const deadlineStart = atStartOfDay(timestamp);
  const diffDays = Math.floor((deadlineStart.getTime() - nowStart.getTime()) / ONE_DAY);

  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays > 1) return `Due in ${diffDays} days`;

  const overdueDays = Math.abs(diffDays);
  return overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`;
};

/**
 * Check if deadline is soon (within 3 days)
 */
export const isDeadlineSoon = (timestamp: number): boolean => {
  const now = new Date().getTime();
  const diffTime = timestamp - now;
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays >= 0 && diffDays <= 3;
};

/**
 * Check if deadline is overdue
 */
export const isDeadlineOverdue = (timestamp: number): boolean => {
  return timestamp < new Date().getTime();
};
