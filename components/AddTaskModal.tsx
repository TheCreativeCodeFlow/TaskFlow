// Add Task Modal - Bottom Sheet Component

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
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { TaskCategory } from '../types/task';
import CategoryChip from './CategoryChip';

interface AddTaskModalProps {
    visible: boolean;
    onClose: () => void;
    onSave: (title: string, description?: string, category?: TaskCategory) => void;
}

const categories: TaskCategory[] = ['work', 'personal', 'study', 'project', 'other'];

export const AddTaskModal: React.FC<AddTaskModalProps> = ({
    visible,
    onClose,
    onSave,
}) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TaskCategory>('other');

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
    };

    const handleClose = () => {
        Keyboard.dismiss();
        resetForm();
        onClose();
    };

    const handleSave = () => {
        if (title.trim()) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            onSave(title, description || undefined, selectedCategory);
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
                                Save Task
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
