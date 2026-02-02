// Premium Animated Checkbox Component
// Using React Native Animated API for reliable animations

import React, { useRef, useEffect } from 'react';
import { StyleSheet, Pressable, View, Animated, Easing } from 'react-native';
import { colors } from '../constants/colors';

interface CheckboxProps {
    checked: boolean;
    onToggle: () => void;
    size?: number;
}

export const Checkbox: React.FC<CheckboxProps> = ({
    checked,
    onToggle,
    size = 24
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const progressAnim = useRef(new Animated.Value(checked ? 1 : 0)).current;
    const checkOpacity = useRef(new Animated.Value(checked ? 1 : 0)).current;

    useEffect(() => {
        if (checked) {
            // Animate to checked
            Animated.parallel([
                Animated.timing(progressAnim, {
                    toValue: 1,
                    duration: 150,
                    easing: Easing.out(Easing.ease),
                    useNativeDriver: false,
                }),
                Animated.sequence([
                    Animated.delay(80),
                    Animated.timing(checkOpacity, {
                        toValue: 1,
                        duration: 150,
                        useNativeDriver: true,
                    }),
                ]),
            ]).start();
        } else {
            // Animate to unchecked
            Animated.parallel([
                Animated.timing(checkOpacity, {
                    toValue: 0,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.sequence([
                    Animated.delay(50),
                    Animated.timing(progressAnim, {
                        toValue: 0,
                        duration: 150,
                        useNativeDriver: false,
                    }),
                ]),
            ]).start();
        }
    }, [checked, progressAnim, checkOpacity]);

    const handlePressIn = () => {
        Animated.timing(scaleAnim, {
            toValue: 0.85,
            duration: 80,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, {
                toValue: 1.08,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 80,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const backgroundColor = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['transparent', colors.success],
    });

    const borderColor = progressAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [colors.border, colors.success],
    });

    return (
        <Pressable
            onPress={onToggle}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
        >
            <Animated.View
                style={[
                    styles.container,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor,
                        borderColor,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Animated.View
                    style={[
                        styles.checkmark,
                        {
                            opacity: checkOpacity,
                            transform: [
                                {
                                    scale: checkOpacity.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [0.5, 1],
                                    }),
                                },
                            ],
                        },
                    ]}
                >
                    <View style={[styles.checkLine1, { width: size * 0.2 }]} />
                    <View style={[styles.checkLine2, { width: size * 0.4 }]} />
                </Animated.View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkmark: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkLine1: {
        position: 'absolute',
        height: 2,
        backgroundColor: colors.background,
        borderRadius: 1,
        left: '18%',
        top: '50%',
        transform: [{ rotate: '45deg' }, { translateY: 1 }],
    },
    checkLine2: {
        position: 'absolute',
        height: 2,
        backgroundColor: colors.background,
        borderRadius: 1,
        left: '28%',
        top: '42%',
        transform: [{ rotate: '-45deg' }],
    },
});

export default Checkbox;
