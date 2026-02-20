// Home Screen - Modern Task Dashboard

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
import { formatDate } from '../utils/helpers';
import TaskCard from '../components/TaskCard';
import FloatingActionButton from '../components/FloatingActionButton';
import AddTaskModal from '../components/AddTaskModal';
import EmptyState from '../components/EmptyState';
import DashboardStats from '../components/DashboardStats';

export default function HomeScreen() {
    const router = useRouter();
    const { tasks, pendingTasks, completedTasks, addTask, deleteTask, toggleTask } = useTasks();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<any>(null);

    const handleAddTask = (title: string, description?: string, category?: any, deadline?: number) => {
        addTask(title, description, category, deadline);
    };

    const handleEditTask = (task: any) => {
        setEditingTask(task);
        setIsModalVisible(true);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setEditingTask(null);
    };

    const renderTask = ({ item }: { item: any }) => (
        <TaskCard
            task={item}
            onToggle={() => toggleTask(item.id)}
            onDelete={() => deleteTask(item.id)}
            onEdit={() => handleEditTask(item)}
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            {/* Modern Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.appTitle}>TaskFlow</Text>
                    <Text style={styles.currentDate}>{formatDate()}</Text>
                </View>

                {completedTasks.length > 0 && (
                    <Pressable
                        style={styles.completedButton}
                        onPress={() => router.push('/completed')}
                    >
                        <Text style={styles.completedButtonText}>
                            ✓ {completedTasks.length}
                        </Text>
                    </Pressable>
                )}
            </View>

            {/* Dashboard Stats */}
            <DashboardStats tasks={tasks} />

            {/* Task list */}
            {pendingTasks.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Tasks</Text>
                        <Text style={styles.sectionCount}>{pendingTasks.length}</Text>
                    </View>
                    <FlatList
                        data={pendingTasks}
                        renderItem={renderTask}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                </>
            )}

            {/* FAB */}
            <FloatingActionButton onPress={() => setIsModalVisible(true)} />

            {/* Add/Edit Task Modal */}
            <AddTaskModal
                visible={isModalVisible}
                onClose={handleCloseModal}
                onSave={handleAddTask}
                editingTask={editingTask}
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
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 20,
    },
    headerLeft: {
        flex: 1,
    },
    appTitle: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        letterSpacing: -0.5,
        marginBottom: 4,
    },
    currentDate: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.medium,
    },
    completedButton: {
        backgroundColor: colors.success + '15',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: colors.success + '30',
    },
    completedButtonText: {
        color: colors.success,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
    },
    sectionCount: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textMuted,
        backgroundColor: colors.surface,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100,
    },
});
