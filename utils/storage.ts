// AsyncStorage utilities for TaskFlow

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';

const TASKS_STORAGE_KEY = '@taskflow_tasks';

/**
 * Save tasks to local storage
 */
export const saveTasks = async (tasks: Task[]): Promise<void> => {
    try {
        const jsonValue = JSON.stringify(tasks);
        await AsyncStorage.setItem(TASKS_STORAGE_KEY, jsonValue);
    } catch (error) {
        console.error('Error saving tasks:', error);
        throw error;
    }
};

/**
 * Load tasks from local storage
 */
export const loadTasks = async (): Promise<Task[]> => {
    try {
        const jsonValue = await AsyncStorage.getItem(TASKS_STORAGE_KEY);
        if (jsonValue === null) {
            return [];
        }
        return JSON.parse(jsonValue) as Task[];
    } catch (error) {
        console.error('Error loading tasks:', error);
        return [];
    }
};

/**
 * Clear all tasks from storage
 */
export const clearAllTasks = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(TASKS_STORAGE_KEY);
    } catch (error) {
        console.error('Error clearing tasks:', error);
        throw error;
    }
};

/**
 * Generate a unique ID for tasks
 */
export const generateId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
