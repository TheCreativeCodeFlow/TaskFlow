// Dashboard Stats Component - Task overview metrics

import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Task } from '../types/task';
import { isDeadlineSoon, isDeadlineOverdue } from '../utils/notifications';

interface DashboardStatsProps {
    tasks: Task[];
}

interface StatItemProps {
    label: string;
    value: number;
    color: string;
}

const StatItem: React.FC<StatItemProps> = ({ label, value, color }) => (
    <View style={styles.statItem}>
        <Text style={[styles.statValue, { color }]}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);

export const DashboardStats: React.FC<DashboardStatsProps> = ({ tasks }) => {
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

    return (
        <View style={styles.container}>
            <StatItem 
                label="Total" 
                value={stats.total} 
                color={colors.textSecondary} 
            />
            <View style={styles.divider} />
            <StatItem 
                label="Done" 
                value={stats.completed} 
                color={colors.success} 
            />
            <View style={styles.divider} />
            <StatItem 
                label="Due Soon" 
                value={stats.dueSoon} 
                color={colors.warning} 
            />
            <View style={styles.divider} />
            <StatItem 
                label="Overdue" 
                value={stats.overdue} 
                color={colors.error} 
            />
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
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
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
    divider: {
        width: 1,
        height: 32,
        backgroundColor: colors.border,
    },
});

export default DashboardStats;
