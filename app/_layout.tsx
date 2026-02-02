// Root Layout - App Entry Point

import React, { useState } from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';
import { TaskProvider, useTasks } from '../context/TaskContext';
import { colors } from '../constants/colors';
import SplashScreen from '../components/SplashScreen';

function LoadingScreen() {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading TaskFlow...</Text>
        </View>
    );
}

function AppContent() {
    const { isLoading } = useTasks();

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: colors.background,
                },
                headerTintColor: colors.text,
                headerShadowVisible: false,
                contentStyle: {
                    backgroundColor: colors.background,
                },
                animation: 'slide_from_right',
            }}
        >
            <Stack.Screen
                name="index"
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
                name="completed"
                options={{
                    title: 'Completed Tasks',
                    headerBackTitle: 'Back',
                }}
            />
        </Stack>
    );
}

export default function RootLayout() {
    const [showSplash, setShowSplash] = useState(true);

    const handleSplashFinish = () => {
        setShowSplash(false);
    };

    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <StatusBar style="light" />
                {showSplash ? (
                    <SplashScreen onFinish={handleSplashFinish} />
                ) : (
                    <TaskProvider>
                        <AppContent />
                    </TaskProvider>
                )}
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    loadingText: {
        marginTop: 16,
        color: colors.textMuted,
        fontSize: 16,
    },
});
