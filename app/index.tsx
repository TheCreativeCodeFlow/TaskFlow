// Home Screen - Main Task Dashboard

import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTasks } from '../context/TaskContext';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { getGreeting, formatDate } from '../utils/helpers';
import TaskCard from '../components/TaskCard';
import FloatingActionButton from '../components/FloatingActionButton';
import AddTaskModal from '../components/AddTaskModal';
import EmptyState from '../components/EmptyState';

export default function HomeScreen() {
    const router = useRouter();
    const { pendingTasks, completedTasks, addTask, deleteTask, toggleTask } = useTasks();
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleAddTask = (title: string, description?: string, category?: any) => {
        addTask(title, description, category);
    };

    const renderTask = ({ item }: { item: any }) => (
        <TaskCard
            task={item}
            onToggle={() => toggleTask(item.id)}
            onDelete={() => deleteTask(item.id)}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>{getGreeting()} 👋</Text>
                    <Text style={styles.date}>{formatDate()}</Text>
                </View>

                {completedTasks.length > 0 && (
                    <Pressable
                        style={styles.completedButton}
                        onPress={() => router.push('/completed')}
                    >
                        <Text style={styles.completedButtonText}>
                            {completedTasks.length} done
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Task count */}
            {pendingTasks.length > 0 && (
                <View style={styles.taskCount}>
                    <Text style={styles.taskCountText}>
                        {pendingTasks.length} task{pendingTasks.length !== 1 ? 's' : ''} remaining
                    </Text>
                </View>
            )}

            {/* Task list */}
            {pendingTasks.length === 0 ? (
                <EmptyState />
            ) : (
                <FlatList
                    data={pendingTasks}
                    renderItem={renderTask}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                />
            )}

            {/* FAB */}
            <FloatingActionButton onPress={() => setIsModalVisible(true)} />

            {/* Add Task Modal */}
            <AddTaskModal
                visible={isModalVisible}
                onClose={() => setIsModalVisible(false)}
                onSave={handleAddTask}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 24,
    },
    greeting: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: 4,
    },
    date: {
        fontSize: typography.fontSize.base,
        color: colors.textMuted,
    },
    completedButton: {
        backgroundColor: colors.success + '20',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    completedButtonText: {
        color: colors.success,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
    },
    taskCount: {
        paddingHorizontal: 24,
        marginBottom: 16,
    },
    taskCountText: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
    },
});
