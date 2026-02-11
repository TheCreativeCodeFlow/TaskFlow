// Task Context - Global state management for tasks

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskCategory, TaskContextType } from '../types/task';
import { saveTasks, loadTasks, generateId } from '../utils/storage';
import { 
    scheduleTaskNotifications, 
    cancelTaskNotifications,
    rescheduleTaskNotifications 
} from '../utils/notifications';

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load tasks from storage on mount
    useEffect(() => {
        const initializeTasks = async () => {
            try {
                const storedTasks = await loadTasks();
                setTasks(storedTasks);
            } catch (error) {
                console.error('Failed to load tasks:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeTasks();
    }, []);

    // Save tasks whenever they change
    useEffect(() => {
        if (!isLoading) {
            saveTasks(tasks);
        }
    }, [tasks, isLoading]);

    // Add a new task
    const addTask = useCallback(async (
        title: string, 
        description?: string, 
        category: TaskCategory = 'other',
        deadline?: number
    ) => {
        const newTask: Task = {
            id: generateId(),
            title: title.trim(),
            description: description?.trim(),
            category,
            status: 'pending',
            createdAt: Date.now(),
            deadline,
            notificationIds: [],
        };

        // Schedule notifications if deadline is set
        if (deadline) {
            const notificationIds = await scheduleTaskNotifications(
                newTask.id,
                newTask.title,
                deadline
            );
            newTask.notificationIds = notificationIds;
        }

        setTasks((prev) => [newTask, ...prev]);
    }, []);

    // Update a task
    const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
        const taskToUpdate = tasks.find(task => task.id === id);
        if (!taskToUpdate) return;

        const updatedTask = { ...taskToUpdate, ...updates };

        // If deadline changed, reschedule notifications
        if (updates.deadline !== undefined && updates.deadline !== taskToUpdate.deadline) {
            if (updates.deadline) {
                const notificationIds = await rescheduleTaskNotifications(
                    taskToUpdate.id,
                    taskToUpdate.title,
                    taskToUpdate.notificationIds,
                    updates.deadline
                );
                updatedTask.notificationIds = notificationIds;
            } else {
                // Deadline removed, cancel notifications
                await cancelTaskNotifications(taskToUpdate.notificationIds);
                updatedTask.notificationIds = [];
            }
        }

        setTasks((prev) => prev.map(task => task.id === id ? updatedTask : task));
    }, [tasks]);

    // Delete a task
    const deleteTask = useCallback(async (id: string) => {
        const taskToDelete = tasks.find((task) => task.id === id);
        if (taskToDelete?.notificationIds) {
            await cancelTaskNotifications(taskToDelete.notificationIds);
        }
        setTasks((prev) => prev.filter((task) => task.id !== id));
    }, [tasks]);

    // Toggle task status
    const toggleTask = useCallback(async (id: string) => {
        const taskToToggle = tasks.find(task => task.id === id);
        if (!taskToToggle) return;

        const newStatus: 'pending' | 'completed' = taskToToggle.status === 'pending' ? 'completed' : 'pending';
        const updatedTask: Task = {
            ...taskToToggle,
            status: newStatus,
            completedAt: newStatus === 'completed' ? Date.now() : undefined,
        };

        // Cancel notifications when task is completed
        if (newStatus === 'completed' && taskToToggle.notificationIds) {
            await cancelTaskNotifications(taskToToggle.notificationIds);
        }
        // Reschedule notifications when task is uncompleted
        else if (newStatus === 'pending' && taskToToggle.deadline) {
            const notificationIds = await scheduleTaskNotifications(
                taskToToggle.id,
                taskToToggle.title,
                taskToToggle.deadline
            );
            updatedTask.notificationIds = notificationIds;
        }

        setTasks((prev) => prev.map(task => task.id === id ? updatedTask : task));
    }, [tasks]);

    // Clear all completed tasks
    const clearCompleted = useCallback(async () => {
        const completedTasks = tasks.filter((task) => task.status === 'completed');
        
        // Cancel notifications for all completed tasks
        for (const task of completedTasks) {
            if (task.notificationIds) {
                await cancelTaskNotifications(task.notificationIds);
            }
        }

        setTasks((prev) => prev.filter((task) => task.status !== 'completed'));
    }, [tasks]);

    // Memoized filtered tasks
    const pendingTasks = useMemo(
        () => tasks.filter((task) => task.status === 'pending'),
        [tasks]
    );

    const completedTasks = useMemo(
        () => tasks.filter((task) => task.status === 'completed'),
        [tasks]
    );

    const value: TaskContextType = {
        tasks,
        pendingTasks,
        completedTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTask,
        clearCompleted,
        isLoading,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// Custom hook to use task context
export const useTasks = (): TaskContextType => {
    const context = useContext(TaskContext);
    if (context === undefined) {
        throw new Error('useTasks must be used within a TaskProvider');
    }
    return context;
};

export default TaskContext;
