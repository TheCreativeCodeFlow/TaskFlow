// Category Chip Component

import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import { colors, categoryColors } from '../constants/colors';
import { typography } from '../constants/typography';
import { TaskCategory } from '../types/task';
import { getCategoryLabel } from '../utils/helpers';

interface CategoryChipProps {
    category: TaskCategory;
    selected?: boolean;
    onPress?: () => void;
    showLabel?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const CategoryChip: React.FC<CategoryChipProps> = ({
    category,
    selected = false,
    onPress,
    showLabel = true,
}) => {
    const scale = useSharedValue(1);
    const categoryColor = categoryColors[category] || colors.textMuted;

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        if (onPress) {
            scale.value = withSpring(0.95, { damping: 15, stiffness: 400 });
        }
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    return (
        <AnimatedPressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={!onPress}
            style={[
                styles.container,
                animatedStyle,
                {
                    backgroundColor: selected ? categoryColor : 'transparent',
                    borderColor: categoryColor,
                },
            ]}
        >
            {showLabel && (
                <Text
                    style={[
                        styles.label,
                        {
                            color: selected ? colors.textInverse : categoryColor,
                        },
                    ]}
                >
                    {getCategoryLabel(category)}
                </Text>
            )}
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        borderWidth: 1.5,
        marginRight: 8,
        marginBottom: 8,
    },
    label: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
    },
});

export default CategoryChip;
