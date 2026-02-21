// Dashboard Stats Component - Task overview metrics

import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Task } from '../types/task';
import { isDeadlineSoon, isDeadlineOverdue } from '../utils/notifications';

interface DashboardStatsProps {
    tasks: Task[];
    activeFilter?: 'all' | 'dueSoon' | 'overdue';
    onFilterChange?: (filter: 'all' | 'dueSoon' | 'overdue') => void;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({ tasks, activeFilter = 'all', onFilterChange }) => {
    const stats = useMemo(() => {
        const pending = tasks.filter(t => t.status === 'pending');
        const completed = tasks.filter(t => t.status === 'completed');
        
        const dueSoon = pending.filter(t => 
            t.deadline && isDeadlineSoon(t.deadline) && !isDeadlineOverdue(t.deadline)
        );
        
        const overdue = pending.filter(t => 
            t.deadline && isDeadlineOverdue(t.deadline)
        );

        return {
            total: tasks.length,
            completed: completed.length,
            dueSoon: dueSoon.length,
            overdue: overdue.length,
        };
    }, [tasks]);

    const handlePress = (filter: 'all' | 'dueSoon' | 'overdue') => {
        if (!onFilterChange) return;
        onFilterChange(activeFilter === filter ? 'all' : filter);
    };

    const renderStat = (
        label: string,
        value: number,
        color: string,
        filter: 'all' | 'dueSoon' | 'overdue',
        tappable: boolean,
    ) => {
        const isActive = activeFilter === filter && tappable;
        return (
            <Pressable
                style={[styles.statItem, isActive && styles.statItemActive]}
                disabled={!tappable}
                onPress={() => handlePress(filter)}
            >
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                <Text style={[styles.statLabel, isActive && styles.statLabelActive]}>{label}</Text>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            {renderStat('Total', stats.total, colors.textSecondary, 'all', true)}
            <View style={styles.divider} />
            {renderStat('Done', stats.completed, colors.success, 'all', false)}
            <View style={styles.divider} />
            {renderStat('Due Soon', stats.dueSoon, colors.warning, 'dueSoon', true)}
            <View style={styles.divider} />
            {renderStat('Overdue', stats.overdue, colors.error, 'overdue', true)}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.surface,
        borderRadius: 16,
        padding: 16,
        marginHorizontal: 20,
        marginBottom: 24,
        justifyContent: 'space-between',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.14,
        shadowRadius: 14,
        elevation: 8,
        borderWidth: 1,
        borderColor: colors.border,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
        paddingVertical: 6,
    },
    statItemActive: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 10,
    },
    statValue: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        color: colors.textMuted,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statLabelActive: {
        color: colors.text,
    },
    divider: {
        width: 1,
        height: 32,
        backgroundColor: colors.border,
    },
});

export default DashboardStats;
