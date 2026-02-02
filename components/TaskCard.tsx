// Premium Task Card Component
// Using React Native Animated API for reliable micro-interactions

import React, { useRef, useEffect } from 'react';
import { StyleSheet, Text, View, Dimensions, Animated, Easing } from 'react-native';
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
    // Animation values using React Native Animated
    const translateX = useRef(new Animated.Value(0)).current;
    const cardHeight = useRef(new Animated.Value(72)).current;
    const cardOpacity = useRef(new Animated.Value(1)).current;

    // Premium completion animations
    const textOpacity = useRef(new Animated.Value(task.status === 'completed' ? 0.5 : 1)).current;
    const cardShift = useRef(new Animated.Value(0)).current;
    const accentOpacity = useRef(new Animated.Value(0)).current;
    const strikeWidth = useRef(new Animated.Value(task.status === 'completed' ? 1 : 0)).current;

    const isCompleted = task.status === 'completed';
    const categoryColor = categoryColors[task.category] || colors.textMuted;

    // Track previous completion state for animation triggers
    const prevCompletedRef = useRef(isCompleted);

    useEffect(() => {
        // Only animate if state actually changed
        if (prevCompletedRef.current !== isCompleted) {
            prevCompletedRef.current = isCompleted;

            if (isCompleted) {
                // Card shift animation - move right and settle back
                Animated.sequence([
                    Animated.timing(cardShift, {
                        toValue: 8,
                        duration: 150,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(cardShift, {
                        toValue: 0,
                        duration: 200,
                        easing: Easing.out(Easing.ease),
                        useNativeDriver: true,
                    }),
                ]).start();

                // Text fade animation
                Animated.timing(textOpacity, {
                    toValue: 0.5,
                    duration: 200,
                    delay: 100,
                    useNativeDriver: true,
                }).start();

                // Strike-through animation
                Animated.timing(strikeWidth, {
                    toValue: 1,
                    duration: 200,
                    delay: 150,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: true,
                }).start();

                // Green accent flash
                Animated.sequence([
                    Animated.timing(accentOpacity, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                    Animated.delay(150),
                    Animated.timing(accentOpacity, {
                        toValue: 0,
                        duration: 200,
                        useNativeDriver: true,
                    }),
                ]).start();
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
                    Animated.timing(cardShift, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]).start();
            }
        }
    }, [isCompleted, cardShift, textOpacity, strikeWidth, accentOpacity]);

    const triggerHaptic = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const handleDelete = () => {
        Animated.parallel([
            Animated.timing(cardHeight, {
                toValue: 0,
                duration: 200,
                useNativeDriver: false,
            }),
            Animated.timing(cardOpacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onDelete();
        });
    };

    const handleSwipeComplete = () => {
        triggerHaptic();
        onToggle();
        Animated.timing(translateX, {
            toValue: 0,
            duration: 200,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
        }).start();
    };

    const panGesture = Gesture.Pan()
        .activeOffsetX([-10, 10])
        .onUpdate((event) => {
            translateX.setValue(event.translationX);
        })
        .onEnd((event) => {
            if (event.translationX < -SWIPE_THRESHOLD) {
                Animated.timing(translateX, {
                    toValue: -SCREEN_WIDTH,
                    duration: 200,
                    useNativeDriver: true,
                }).start(() => {
                    triggerHaptic();
                    handleDelete();
                });
            } else if (event.translationX > SWIPE_THRESHOLD && !isCompleted) {
                handleSwipeComplete();
            } else {
                Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                    damping: 20,
                    stiffness: 200,
                }).start();
            }
        });

    // Calculate margin based on opacity for delete animation
    const marginBottom = cardOpacity.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 12],
    });

    // Delete background opacity based on swipe
    const deleteOpacity = translateX.interpolate({
        inputRange: [-SCREEN_WIDTH * 0.5, -50, 0],
        outputRange: [1, 0.8, 0],
        extrapolate: 'clamp',
    });

    // Complete background opacity based on swipe
    const completeOpacity = translateX.interpolate({
        inputRange: [0, 50, SCREEN_WIDTH * 0.5],
        outputRange: [0, 0.8, 1],
        extrapolate: 'clamp',
    });

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    height: cardHeight,
                    opacity: cardOpacity,
                    marginBottom,
                }
            ]}
        >
            {/* Delete background */}
            <Animated.View
                style={[
                    styles.actionBackground,
                    styles.deleteBackground,
                    { opacity: deleteOpacity }
                ]}
            >
                <Text style={styles.actionText}>Delete</Text>
            </Animated.View>

            {/* Complete background */}
            <Animated.View
                style={[
                    styles.actionBackground,
                    styles.completeBackground,
                    { opacity: completeOpacity }
                ]}
            >
                <Text style={styles.actionText}>Complete</Text>
            </Animated.View>

            {/* Main card */}
            <GestureDetector gesture={panGesture}>
                <Animated.View
                    style={[
                        styles.card,
                        {
                            transform: [
                                { translateX: Animated.add(translateX, cardShift) }
                            ]
                        }
                    ]}
                >
                    {/* Success accent line */}
                    <Animated.View
                        style={[
                            styles.accentLine,
                            { opacity: accentOpacity }
                        ]}
                    />

                    <Checkbox checked={isCompleted} onToggle={onToggle} />

                    <View style={styles.content}>
                        <View style={styles.titleContainer}>
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
        overflow: 'hidden',
    },
    accentLine: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: colors.success,
        borderTopLeftRadius: 16,
        borderBottomLeftRadius: 16,
    },
    content: {
        flex: 1,
        marginLeft: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    titleContainer: {
        flex: 1,
        position: 'relative',
        justifyContent: 'center',
    },
    title: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.medium,
        color: colors.text,
    },
    strikeLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1.5,
        backgroundColor: colors.textMuted,
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
