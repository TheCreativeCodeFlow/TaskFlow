// Animated Splash Screen Component

import React, { useEffect } from 'react';
import { StyleSheet, View, Image, Dimensions } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    withSequence,
    withDelay,
    Easing,
    runOnJS,
} from 'react-native-reanimated';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

interface SplashScreenProps {
    onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
    const logoScale = useSharedValue(0);
    const logoOpacity = useSharedValue(0);
    const containerOpacity = useSharedValue(1);

    useEffect(() => {
        // Animate logo in
        logoOpacity.value = withTiming(1, { duration: 500 });
        logoScale.value = withSequence(
            withTiming(1.1, { duration: 600, easing: Easing.out(Easing.back(2)) }),
            withTiming(1, { duration: 200 })
        );

        // Fade out after delay
        containerOpacity.value = withDelay(
            2000,
            withTiming(0, { duration: 400 }, (finished) => {
                if (finished) {
                    runOnJS(onFinish)();
                }
            })
        );
    }, [logoScale, logoOpacity, containerOpacity, onFinish]);

    const logoAnimatedStyle = useAnimatedStyle(() => ({
        opacity: logoOpacity.value,
        transform: [{ scale: logoScale.value }],
    }));

    const containerAnimatedStyle = useAnimatedStyle(() => ({
        opacity: containerOpacity.value,
    }));

    return (
        <Animated.View style={[styles.container, containerAnimatedStyle]}>
            <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
                <Image
                    source={require('../assets/logo.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: width * 0.6,
        height: width * 0.6,
    },
});

export default SplashScreen;
