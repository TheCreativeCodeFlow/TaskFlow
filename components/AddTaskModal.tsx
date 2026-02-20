// Add/Edit Task Modal - Bottom Sheet Component

import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    Pressable,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
    runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { Task, TaskCategory } from '../types/task';
import CategoryChip from './CategoryChip';
import { useTasks } from '../context/TaskContext';

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, description?: string, category?: TaskCategory, deadline?: number) => void;
    editingTask?: Task | null;
}

const categories: TaskCategory[] = ['work', 'personal', 'study', 'project', 'other'];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
    visible,
    onClose,
    onSave,
    editingTask,
}) => {
    const { updateTask } = useTasks();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('other');
    const [deadline, setDeadline] = useState<Date | undefined>(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const isEditMode = !!editingTask;

    // Pre-fill form when editing
    useEffect(() => {
        if (editingTask) {
            setTitle(editingTask.title);
            setDescription(editingTask.description || '');
            setSelectedCategory(editingTask.category);
            setDeadline(editingTask.deadline ? new Date(editingTask.deadline) : undefined);
        } else {
            resetForm();
        }
    }, [editingTask, visible]);

    const translateY = useSharedValue(500);
    const overlayOpacity = useSharedValue(0);

    useEffect(() => {
        if (visible) {
            translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
            overlayOpacity.value = withTiming(1, { duration: 200 });
        } else {
            translateY.value = withSpring(500, { damping: 20, stiffness: 150 });
            overlayOpacity.value = withTiming(0, { duration: 200 });
        }
    }, [visible, translateY, overlayOpacity]);

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setSelectedCategory('other');
        setDeadline(undefined);
        setShowDatePicker(false);
    };

    const handleClose = () => {
        Keyboard.dismiss();
        resetForm();
        onClose();
    };

    const handleSave = async () => {
        if (title.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            if (isEditMode && editingTask) {
                // Update existing task
                await updateTask(editingTask.id, {
                    title: title.trim(),
                    description: description?.trim(),
                    category: selectedCategory,
                    deadline: deadline ? deadline.getTime() : undefined,
                });
            } else {
                // Create new task
                onSave(
                    title, 
                    description || undefined, 
                    selectedCategory,
                    deadline ? deadline.getTime() : undefined
                );
            }
            
            resetForm();
            onClose();
        } else {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }
    };

    const panGesture = Gesture.Pan()
        .onUpdate((event) => {
            if (event.translationY > 0) {
                translateY.value = event.translationY;
            }
        })
        .onEnd((event) => {
            if (event.translationY > 100) {
                runOnJS(handleClose)();
            } else {
                translateY.value = withSpring(0, { damping: 20, stiffness: 150 });
            }
        });

    const modalStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: translateY.value }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        opacity: overlayOpacity.value,
    }));

    if (!visible) return null;

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.overlay, overlayStyle]}>
                <Pressable style={styles.overlayPressable} onPress={handleClose} />
            </Animated.View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
            >
                <GestureDetector gesture={panGesture}>
                    <Animated.View style={[styles.modal, modalStyle]}>
                        {/* Handle bar */}
                        <View style={styles.handleBar} />

                        <Text style={styles.title}>New Task</Text>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            keyboardShouldPersistTaps="handled"
                        >
                            {/* Title input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Task Title *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="What needs to be done?"
                                    placeholderTextColor={colors.textMuted}
                                    value={title}
                                    onChangeText={setTitle}
                                    autoFocus
                                    returnKeyType="next"
                                />
                            </View>

                            {/* Description input */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Description (optional)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Add more details..."
                                    placeholderTextColor={colors.textMuted}
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={3}
                                    textAlignVertical="top"
                                />
                            </View>

                            {/* Category selector */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Category</Text>
                                <View style={styles.categoryContainer}>
                                    {categories.map((category) => (
                                        <CategoryChip
                                            key={category}
                                            category={category}
                                            selected={selectedCategory === category}
                                            onPress={() => setSelectedCategory(category)}
                                        />
                                    ))}
                                </View>
                            </View>

                            {/* Deadline selector */}
                            <View style={styles.inputContainer}>
                                <Text style={styles.label}>Deadline (optional)</Text>
                                <Pressable
                                    style={styles.deadlineButton}
                                    onPress={() => {
                                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                        setShowDatePicker(true);
                                    }}
                                >
                                    <Text style={styles.deadlineButtonText}>
                                        {deadline 
                                            ? deadline.toLocaleDateString('en-US', { 
                                                month: 'short', 
                                                day: 'numeric', 
                                                year: 'numeric' 
                                              })
                                            : '+ Set Deadline'
                                        }
                                    </Text>
                                    {deadline && (
                                        <Pressable
                                            style={styles.clearDeadlineButton}
                                            onPress={(e) => {
                                                e.stopPropagation();
                                                setDeadline(undefined);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }}
                                        >
                                            <Text style={styles.clearDeadlineText}>✕</Text>
                                        </Pressable>
                                    )}
                                </Pressable>

                                {showDatePicker && (
                                    <DateTimePicker
                                        value={deadline || new Date()}
                                        mode="date"
                                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                        minimumDate={new Date()}
                                        onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
                                            if (Platform.OS === 'android') {
                                                setShowDatePicker(false);
                                            }
                                            if (event.type === 'set' && selectedDate) {
                                                setDeadline(selectedDate);
                                                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                                            }
                                            if (event.type === 'dismissed') {
                                                setShowDatePicker(false);
                                            }
                                        }}
                                        themeVariant="dark"
                                    />
                                )}
                            </View>
                        </ScrollView>

                        {/* Save button */}
                        <Pressable
                            style={[
                                styles.saveButton,
                                !title.trim() && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={!title.trim()}
                        >
                            <Text
                                style={[
                                    styles.saveButtonText,
                                    !title.trim() && styles.saveButtonTextDisabled,
                                ]}
                            >
                                {isEditMode ? 'Update Task' : 'Save Task'}
                            </Text>
                        </Pressable>
                    </Animated.View>
                </GestureDetector>
            </KeyboardAvoidingView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: colors.overlay,
    },
    overlayPressable: {
        flex: 1,
    },
    keyboardView: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modal: {
        backgroundColor: colors.surface,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 24,
        paddingBottom: 40,
        maxHeight: '85%',
        borderWidth: 1,
        borderColor: colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 12,
    },
    handleBar: {
        width: 40,
        height: 4,
        backgroundColor: colors.border,
        borderRadius: 2,
        alignSelf: 'center',
        marginTop: 12,
        marginBottom: 20,
    },
    title: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        color: colors.text,
        marginBottom: 24,
        letterSpacing: -0.5,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        color: colors.textSecondary,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: typography.fontSize.base,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
    textArea: {
        minHeight: 80,
        paddingTop: 14,
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    deadlineButton: {
        backgroundColor: colors.surfaceLight,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: colors.border,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    deadlineButtonText: {
        fontSize: typography.fontSize.base,
        color: colors.text,
        fontWeight: typography.fontWeight.medium,
    },
    clearDeadlineButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.error + '20',
        alignItems: 'center',
        justifyContent: 'center',
    },
    clearDeadlineText: {
        fontSize: typography.fontSize.sm,
        color: colors.error,
        fontWeight: typography.fontWeight.bold,
    },
    saveButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 12,
    },
    saveButtonDisabled: {
        backgroundColor: colors.surfaceLight,
    },
    saveButtonText: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.semibold,
        color: colors.textInverse,
    },
    saveButtonTextDisabled: {
        color: colors.textMuted,
    },
});

export default AddTaskModal;
