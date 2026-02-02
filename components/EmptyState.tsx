// Empty State Component

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    withSequence,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';
import { typography } from '../constants/typography';
import { getMotivationalMessage } from '../utils/helpers';

interface EmptyStateProps {
    title?: string;
    subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = getMotivationalMessage(),
    subtitle = 'Tap the + button to add your first task',
}) => {
    const bounce = useSharedValue(0);

    React.useEffect(() => {
        bounce.value = withRepeat(
            withSequence(
                withTiming(-8, { duration: 1000 }),
                withTiming(0, { duration: 1000 })
            ),
            -1,
            true
        );
    }, [bounce]);

    const animatedIconStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: bounce.value }],
    }));

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
                <Text style={styles.icon}>📝</Text>
            </Animated.View>

            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 48,
        paddingBottom: 100,
    },
    iconContainer: {
        marginBottom: 24,
    },
    icon: {
        fontSize: 64,
    },
    title: {
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: colors.text,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: typography.fontSize.base,
        color: colors.textMuted,
        textAlign: 'center',
        lineHeight: 24,
    },
});

export default EmptyState;
