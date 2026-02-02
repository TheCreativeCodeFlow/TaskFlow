// Task Context - Global state management for tasks

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Task, TaskCategory, TaskContextType } from '../types/task';
import { saveTasks, loadTasks, generateId } from '../utils/storage';

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
    const addTask = useCallback((title: string, description?: string, category: TaskCategory = 'other') => {
        const newTask: Task = {
            id: generateId(),
            title: title.trim(),
            description: description?.trim(),
            category,
            status: 'pending',
            createdAt: Date.now(),
        };

        setTasks((prev) => [newTask, ...prev]);
    }, []);

    // Delete a task
    const deleteTask = useCallback((id: string) => {
        setTasks((prev) => prev.filter((task) => task.id !== id));
    }, []);

    // Toggle task status
    const toggleTask = useCallback((id: string) => {
        setTasks((prev) =>
            prev.map((task) => {
                if (task.id === id) {
                    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
                    return {
                        ...task,
                        status: newStatus,
                        completedAt: newStatus === 'completed' ? Date.now() : undefined,
                    };
                }
                return task;
            })
        );
    }, []);

    // Clear all completed tasks
    const clearCompleted = useCallback(() => {
        setTasks((prev) => prev.filter((task) => task.status !== 'completed'));
    }, []);

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
