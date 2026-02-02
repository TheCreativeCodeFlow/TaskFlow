// Task Card Component with swipe gestures

import React from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    runOnJS,
    interpolate,
    Extrapolation,
} from 'react-native-reanimated';
import {
    Gesture,
    GestureDetector,
} from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { colors, categoryColors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Task } from '../types/task';
import { getCategoryLabel } from '../utils/helpers';
import Checkbox from './Checkbox';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface TaskCardProps {
    task: Task;
    onToggle: () => void;
    onDelete: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onToggle, onDelete }) => {
    const translateX = useSharedValue(0);
    const cardHeight = useSharedValue(72);
    const cardOpacity = useSharedValue(1);
    const cardScale = useSharedValue(1);

    const isCompleted = task.status === 'completed';
    const categoryColor = categoryColors[task.category] || colors.textMuted;

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    };

    const handleDelete = () => {
        cardHeight.value = withTiming(0, { duration: 200 });
        cardOpacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(onDelete)();
        });
    };

    const handleComplete = () => {
        runOnJS(triggerHaptic)();
        runOnJS(onToggle)();
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
    };

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.value = event.translationX;
        })
        .onEnd((event) => {
            // Swipe left to delete
            if (event.translationX < -SWIPE_THRESHOLD) {
                translateX.value = withTiming(-SCREEN_WIDTH, { duration: 200 });
                runOnJS(triggerHaptic)();
                runOnJS(handleDelete)();
            }
            // Swipe right to complete
            else if (event.translationX > SWIPE_THRESHOLD && !isCompleted) {
                handleComplete();
            }
            // Reset position
            else {
                translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
            }
        });

    const cardAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { scale: cardScale.value },
        ],
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        height: cardHeight.value,
        opacity: cardOpacity.value,
        marginBottom: interpolate(cardOpacity.value, [0, 1], [0, 12]),
    }));

    const deleteBackgroundStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [-SCREEN_WIDTH * 0.5, -50, 0],
            [1, 0.8, 0],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    const completeBackgroundStyle = useAnimatedStyle(() => {
        const opacity = interpolate(
            translateX.value,
            [0, 50, SCREEN_WIDTH * 0.5],
            [0, 0.8, 1],
            Extrapolation.CLAMP
        );
        return { opacity };
    });

    return (
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
            {/* Delete background (left swipe) */}
            <Animated.View style={[styles.actionBackground, styles.deleteBackground, deleteBackgroundStyle]}>
                <Text style={styles.actionText}>Delete</Text>
            </Animated.View>

            {/* Complete background (right swipe) */}
            <Animated.View style={[styles.actionBackground, styles.completeBackground, completeBackgroundStyle]}>
                <Text style={styles.actionText}>Complete</Text>
            </Animated.View>

            {/* Main card */}
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.card, cardAnimatedStyle]}>
                    <Checkbox checked={isCompleted} onToggle={onToggle} />

                    <View style={styles.content}>
                        <Text
                            style={[
                                styles.title,
                                isCompleted && styles.titleCompleted,
                            ]}
                            numberOfLines={1}
                        >
                            {task.title}
                        </Text>

                        {task.category && (
                            <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
                                <Text style={[styles.categoryText, { color: categoryColor }]}>
                                    {getCategoryLabel(task.category)}
                                </Text>
                            </View>
                        )}
                    </View>
                </Animated.View>
            </GestureDetector>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        overflow: 'hidden',
    },
    actionBackground: {
        position: 'absolute',
        top: 0,
        bottom: 12,
        left: 0,
        right: 0,
        borderRadius: 16,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    deleteBackground: {
        backgroundColor: colors.error,
        alignItems: 'flex-end',
    },
    completeBackground: {
        backgroundColor: colors.success,
        alignItems: 'flex-start',
    },
    actionText: {
        color: colors.text,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
    },
    card: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
    },
    content: {
        flex: 1,
        marginLeft: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    title: {
        flex: 1,
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
    },
    titleCompleted: {
        color: colors.textMuted,
        textDecorationLine: 'line-through',
    },
    categoryBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginLeft: 12,
    },
    categoryText: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
    },
});

export default TaskCard;
