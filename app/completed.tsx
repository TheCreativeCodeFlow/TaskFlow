// Completed Tasks Screen

import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    FlatList,
    Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTasks } from '../context/TaskContext';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import TaskCard from '../components/TaskCard';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function CompletedScreen() {
    const { completedTasks, deleteTask, toggleTask, clearCompleted } = useTasks();
    const clearButtonScale = useSharedValue(1);

    const clearButtonStyle = useAnimatedStyle(() => ({
        transform: [{ scale: clearButtonScale.value }],
    }));

    const handleClearAll = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        clearCompleted();
    };

    const renderTask = ({ item }: { item: any }) => (
        <TaskCard
            task={item}
            onToggle={() => toggleTask(item.id)}
            onDelete={() => deleteTask(item.id)}
            onEdit={() => {}} // Completed tasks can't be edited
        />
    );

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            {completedTasks.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyIcon}>✨</Text>
                    <Text style={styles.emptyTitle}>No completed tasks</Text>
                    <Text style={styles.emptySubtitle}>
                        Complete some tasks to see them here
                    </Text>
                </View>
            ) : (
                <>
                    {/* Stats */}
                    <View style={styles.statsContainer}>
                        <Text style={styles.statsText}>
                            🎉 You've completed {completedTasks.length} task
                            {completedTasks.length !== 1 ? 's' : ''}!
                        </Text>
                    </View>

                    {/* Task list */}
                    <FlatList
                        data={completedTasks}
                        renderItem={renderTask}
                        keyExtractor={(item) => item.id}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />

                    {/* Clear all button */}
                    <View style={styles.footer}>
                        <AnimatedPressable
                            style={[styles.clearButton, clearButtonStyle]}
                            onPress={handleClearAll}
                            onPressIn={() => {
                                clearButtonScale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
                            }}
                            onPressOut={() => {
                                clearButtonScale.value = withSpring(1, { damping: 15, stiffness: 400 });
                            }}
                        >
                            <Text style={styles.clearButtonText}>Clear All Completed</Text>
                        </AnimatedPressable>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    statsContainer: {
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: colors.success + '15',
        marginHorizontal: 20,
        marginTop: 16,
        marginBottom: 24,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.success + '30',
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    statsText: {
        fontSize: typography.fontSize.base,
        color: colors.success,
        textAlign: 'center',
        fontWeight: typography.fontWeight.semibold,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 48,
    },
    emptyIcon: {
        fontSize: 64,
        marginBottom: 24,
    },
    emptyTitle: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: typography.fontSize.base,
        color: colors.textMuted,
        textAlign: 'center',
    },
    footer: {
        paddingHorizontal: 24,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: colors.border,
    },
    clearButton: {
        backgroundColor: colors.error + '15',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.error + '30',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    clearButtonText: {
        color: colors.error,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
    },
});
