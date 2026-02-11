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

/**
 * Calculate notification dates
 * Returns dates for every 2 days before deadline + final day
 */
const calculateNotificationDates = (deadlineTimestamp: number): Date[] => {
  const deadlineDate = new Date(deadlineTimestamp);
  const now = new Date();
  const notificationDates: Date[] = [];

  // Start with the deadline day (final reminder)
  const deadlineDay = new Date(deadlineDate);
  deadlineDay.setHours(9, 0, 0, 0); // 9 AM on deadline day
  
  if (deadlineDay > now) {
    notificationDates.push(deadlineDay);
  }

  // Calculate dates going backward (every 2 days)
  let daysBack = 2;
  while (true) {
    const reminderDate = new Date(deadlineDate);
    reminderDate.setDate(reminderDate.getDate() - daysBack);
    reminderDate.setHours(10, 0, 0, 0); // 10 AM for regular reminders

    if (reminderDate <= now) {
      break; // Stop if we've reached the past
    }

    notificationDates.unshift(reminderDate); // Add to beginning of array
    daysBack += 2;
  }

  return notificationDates;
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
    const notificationDates = calculateNotificationDates(deadlineTimestamp);
    const notificationIds: string[] = [];

    for (const date of notificationDates) {
      const isDeadlineDay = date.getHours() === 9; // Deadline day notifications are at 9 AM
      const daysUntilDeadline = Math.ceil((deadlineTimestamp - date.getTime()) / (1000 * 60 * 60 * 24));

      let body: string;
      let priority: Notifications.AndroidNotificationPriority;

      if (isDeadlineDay) {
        // Final day warning
        body = `⚠️ Last day! "${taskTitle}" is due today.`;
        priority = Notifications.AndroidNotificationPriority.HIGH;
      } else {
        // Regular reminder
        body = `⏰ Due in ${daysUntilDeadline} days: "${taskTitle}"`;
        priority = Notifications.AndroidNotificationPriority.DEFAULT;
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: isDeadlineDay ? '🔴 Task Deadline Today' : '📋 Task Reminder',
          body,
          data: { taskId },
          priority: priority,
          sound: 'default',
        },
        trigger: {
          date,
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
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // If today
  if (diffDays === 0) {
    return 'Today';
  }

  // If tomorrow
  if (diffDays === 1) {
    return 'Tomorrow';
  }

  // If overdue
  if (diffDays < 0) {
    return `Overdue ${Math.abs(diffDays)}d`;
  }

  // Otherwise show date
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
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
