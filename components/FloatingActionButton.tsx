// Floating Action Button Component

import React from 'react';
import { StyleSheet, Pressable, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors } from '../constants/colors';

interface FloatingActionButtonProps {
    onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress }) => {
    const scale = useSharedValue(1);
    const rotate = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: scale.value },
            { rotate: `${rotate.value}deg` },
        ],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
        rotate.value = withSpring(90, { damping: 15, stiffness: 200 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
        rotate.value = withSpring(0, { damping: 15, stiffness: 200 });
    };

    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    return (
        <AnimatedPressable
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.button, animatedStyle]}
        >
            <Text style={styles.icon}>+</Text>
        </AnimatedPressable>
    );
};

const styles = StyleSheet.create({
    button: {
        position: 'absolute',
        bottom: 32,
        right: 24,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 10,
    },
    icon: {
        fontSize: 36,
        fontWeight: '300',
        color: colors.text,
        marginTop: -2,
    },
});

export default FloatingActionButton;
