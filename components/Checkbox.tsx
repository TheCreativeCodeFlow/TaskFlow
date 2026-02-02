// Animated Checkbox Component

import React, { useEffect } from 'react';
import { StyleSheet, Pressable, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSpring,
    interpolateColor,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';

interface CheckboxProps {
    checked: boolean;
    onToggle: () => void;
    size?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onToggle,
    size = 24
}) => {
    const progress = useSharedValue(checked ? 1 : 0);
    const scale = useSharedValue(1);

    useEffect(() => {
        progress.value = withTiming(checked ? 1 : 0, { duration: 200 });
    }, [checked, progress]);

    const containerStyle = useAnimatedStyle(() => {
        return {
            backgroundColor: interpolateColor(
                progress.value,
                [0, 1],
                ['transparent', colors.success]
            ),
            borderColor: interpolateColor(
                progress.value,
                [0, 1],
                [colors.border, colors.success]
            ),
            transform: [{ scale: scale.value }],
        };
    });

    const checkmarkStyle = useAnimatedStyle(() => {
        return {
            opacity: progress.value,
            transform: [
                { scale: withSpring(progress.value, { damping: 15, stiffness: 200 }) },
            ],
        };
    });

    const handlePressIn = () => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    return (
        <AnimatedPressable
            onPress={onToggle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[
                styles.container,
                containerStyle,
                { width: size, height: size, borderRadius: size / 2 },
            ]}
        >
            <Animated.View style={[styles.checkmark, checkmarkStyle]}>
                <View style={[styles.checkLine1, { width: size * 0.25 }]} />
                <View style={[styles.checkLine2, { width: size * 0.45 }]} />
            </Animated.View>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkLine1: {
        position: 'absolute',
        height: 2,
        backgroundColor: colors.textInverse,
        borderRadius: 1,
        transform: [
            { rotate: '45deg' },
            { translateX: -2 },
            { translateY: 2 },
        ],
    },
    checkLine2: {
        position: 'absolute',
        height: 2,
        backgroundColor: colors.textInverse,
        borderRadius: 1,
        transform: [
            { rotate: '-45deg' },
            { translateX: 2 },
            { translateY: 0 },
        ],
    },
});

export default Checkbox;
