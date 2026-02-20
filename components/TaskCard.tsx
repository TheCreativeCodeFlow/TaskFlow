// Modern Task Card Component with Premium Interactions

import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, Easing, Pressable } from 'react-native';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, categoryColors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Task } from '../types/task';
import { getCategoryLabel } from '../utils/helpers';
import { formatDeadline, isDeadlineSoon, isDeadlineOverdue } from '../utils/notifications';
import Checkbox from './Checkbox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface TaskCardProps {
    task: Task;
    onToggle: () => void;
    onDelete: () => void;
    onEdit: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete, onEdit }) => {
    // Animation values
    const translateX = useRef(new Animated.Value(0)).current;
    const cardHeight = useRef(new Animated.Value(80)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;
    const cardScale = useRef(new Animated.Value(1)).current;

    // Completion animations
    const textOpacity = useRef(new Animated.Value(task.status === 'completed' ? 0.5 : 1)).current;
    const successGlow = useRef(new Animated.Value(0)).current;
    const strikeWidth = useRef(new Animated.Value(task.status === 'completed' ? 1 : 0)).current;

    const isCompleted = task.status === 'completed';
    const categoryColor = categoryColors[task.category] || colors.textMuted;

    // Get status accent color
    const getStatusColor = () => {
        if (task.deadline) {
            if (isDeadlineOverdue(task.deadline)) return colors.error;
            if (isDeadlineSoon(task.deadline)) return colors.warning;
        }
        return colors.primary;
    };

    // Track previous completion state
    const prevCompletedRef = useRef(isCompleted);

    useEffect(() => {
        if (prevCompletedRef.current !== isCompleted) {
            prevCompletedRef.current = isCompleted;

            if (isCompleted) {
                // Completion animation sequence
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

                // Scale animation
                Animated.sequence([
                    Animated.timing(cardScale, {
                        toValue: 0.98,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                    Animated.timing(cardScale, {
                        toValue: 1,
                        duration: 150,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]).start();

                // Success glow
                Animated.sequence([
                    Animated.timing(successGlow, {
                        toValue: 1,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                    Animated.timing(successGlow, {
                        toValue: 0,
                        duration: 300,
                        useNativeDriver: true,
                    }),
                ]).start();

                // Text fade
                Animated.timing(textOpacity, {
                    toValue: 0.5,
                    duration: 200,
                    useNativeDriver: true,
                }).start();

                // Strike-through
                Animated.timing(strikeWidth, {
                    toValue: 1,
                    duration: 250,
                    delay: 100,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }).start();
            } else {
                // Reset animations
                Animated.parallel([
                    Animated.timing(textOpacity, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.timing(strikeWidth, {
                        toValue: 0,
                        duration: 100,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        }
    }, [isCompleted]);

    const handleDelete = () => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Animated.parallel([
            Animated.timing(cardHeight, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }),
            Animated.timing(cardOpacity, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDelete();
        });
    };

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.setValue(event.translationX);
        })
        .onEnd((event) => {
            if (event.translationX < -SWIPE_THRESHOLD) {
                // Swipe left to delete
                Animated.timing(translateX, {
                    toValue: -SCREEN_WIDTH,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    handleDelete();
                });
            } else {
                // Return to center
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 200,
                }).start();
            }
        });

    // Delete background opacity
    const deleteOpacity = translateX.interpolate({
        inputRange: [-SCREEN_WIDTH * 0.5, -50, 0],
        outputRange: [1, 0.8, 0],
        extrapolate: 'clamp',
    });

    // Success glow style
    const glowStyle = {
        opacity: successGlow,
        backgroundColor: colors.success + '20',
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    height: cardHeight,
                    opacity: cardOpacity,
                    transform: [{ scale: cardScale }],
                }
            ]}
        >
            {/* Delete background */}
            <Animated.View
                style={[
                    styles.deleteBackground,
                    { opacity: deleteOpacity }
                ]}
            >
                <Text style={styles.deleteText}>Delete</Text>
            </Animated.View>

            {/* Main card */}
            <GestureDetector gesture={panGesture}>
                <Pressable onPress={onEdit} onLongPress={onEdit}>
                    <Animated.View
                        style={[
                            styles.card,
                            { transform: [{ translateX }] }
                        ]}
                    >
                        {/* Status accent bar */}
                        <View style={[styles.accentBar, { backgroundColor: getStatusColor() }]} />

                        {/* Success glow overlay */}
                        <Animated.View style={[styles.glowOverlay, glowStyle]} />

                        {/* Content */}
                        <View style={styles.cardContent}>
                            <Checkbox checked={isCompleted} onToggle={onToggle} />

                            <View style={styles.textContainer}>
                                <View style={styles.titleRow}>
                                    <Animated.Text
                                        style={[
                                            styles.title,
                                            { opacity: textOpacity },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {task.title}
                                    </Animated.Text>

                                    {/* Strike-through line */}
                                    <Animated.View
                                        style={[
                                            styles.strikeLine,
                                            {
                                                transform: [{ scaleX: strikeWidth }],
                                                opacity: strikeWidth,
                                            }
                                        ]}
                                    />
                                </View>

                                {/* Deadline and category row */}
                                <View style={styles.metaRow}>
                                    {task.deadline && (
                                        <Text
                                            style={[
                                                styles.deadline,
                                                isDeadlineOverdue(task.deadline) && styles.deadlineOverdue,
                                                isDeadlineSoon(task.deadline) && !isDeadlineOverdue(task.deadline) && styles.deadlineSoon,
                                            ]}
                                        >
                                            {isDeadlineOverdue(task.deadline) ? '⚠️ ' : '📅 '}
                                            {formatDeadline(task.deadline)}
                                        </Text>
                                    )}

                                    {task.category && (
                                        <View style={[styles.categoryChip, { backgroundColor: categoryColor + '15', borderColor: categoryColor + '30' }]}>
                                            <Text style={[styles.categoryText, { color: categoryColor }]}>
                                                {getCategoryLabel(task.category)}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>
                    </Animated.View>
                </Pressable>
            </GestureDetector>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 12,
        overflow: 'hidden',
    },
    deleteBackground: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        width: 120,
        backgroundColor: colors.error,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteText: {
        color: colors.text,
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.bold,
    },
    card: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    accentBar: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
    },
    glowOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        paddingLeft: 20,
    },
    textContainer: {
        flex: 1,
        marginLeft: 14,
    },
    titleRow: {
        position: 'relative',
        marginBottom: 6,
    },
    title: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
        letterSpacing: -0.2,
    },
    strikeLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: '50%',
        height: 1.5,
        backgroundColor: colors.textMuted,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    deadline: {
        fontSize: typography.fontSize.xs,
        color: colors.textMuted,
        fontWeight: typography.fontWeight.medium,
    },
    deadlineSoon: {
        color: colors.warning,
    },
    deadlineOverdue: {
        color: colors.error,
    },
    categoryChip: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
        borderWidth: 1,
    },
    categoryText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.semibold,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
});

export default TaskCard;
