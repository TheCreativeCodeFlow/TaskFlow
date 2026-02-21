// Home Screen - Modern Task Dashboard

import React, { useMemo, useState } from 'react';
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
import { isDeadlineOverdue, isDeadlineSoon } from '../utils/notifications';
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
    const [activeFilter, setActiveFilter] = useState<'all' | 'dueSoon' | 'overdue'>('all');

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

    const filteredPending = useMemo(() => {
        if (activeFilter === 'overdue') {
            return pendingTasks.filter(t => t.deadline && isDeadlineOverdue(t.deadline));
        }
        if (activeFilter === 'dueSoon') {
            return pendingTasks.filter(t => t.deadline && !isDeadlineOverdue(t.deadline) && isDeadlineSoon(t.deadline));
        }
        return pendingTasks;
    }, [pendingTasks, activeFilter]);

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
                    <View style={styles.headerSubRow}>
                        <Text style={styles.currentDate}>{formatDate()}</Text>
                        <View style={styles.summaryPill}>
                            <Text style={styles.summaryPillText}>
                                {completedTasks.length}/{tasks.length} done
                            </Text>
                        </View>
                    </View>
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
            <DashboardStats
                tasks={tasks}
                activeFilter={activeFilter}
                onFilterChange={(filter) => setActiveFilter(filter)}
            />

            {/* Task list */}
            {filteredPending.length === 0 ? (
                <EmptyState />
            ) : (
                <>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Active Tasks</Text>
                        <Text style={styles.sectionCount}>{filteredPending.length}</Text>
                    </View>
                    <FlatList
                        data={filteredPending}
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
        paddingTop: 12,
        paddingBottom: 18,
    },
    headerLeft: {
        flex: 1,
    },
    appTitle: {
        fontSize: typography.fontSize['3xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        letterSpacing: -0.6,
        marginBottom: 6,
    },
    currentDate: {
        fontSize: typography.fontSize.sm,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.medium,
    },
    headerSubRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    summaryPill: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: colors.border,
    },
    summaryPillText: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        letterSpacing: 0.2,
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
