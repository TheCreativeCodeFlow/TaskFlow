// TaskFlow Typography System

import { TextStyle } from 'react-native';

export const typography = {
    // Font families - using system fonts for best performance
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },

    // Font sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 30,
        '4xl': 36,
    },

    // Font weights
    fontWeight: {
        regular: '400' as TextStyle['fontWeight'],
        medium: '500' as TextStyle['fontWeight'],
        semibold: '600' as TextStyle['fontWeight'],
        bold: '700' as TextStyle['fontWeight'],
    },

    // Line heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },

    // Letter spacing
    letterSpacing: {
        tight: -0.5,
        normal: 0,
        wide: 0.5,
    },
} as const;

// Pre-defined text styles
export const textStyles = {
    heading: {
        fontSize: typography.fontSize['2xl'],
        fontWeight: typography.fontWeight.bold,
        lineHeight: typography.fontSize['2xl'] * typography.lineHeight.tight,
    } as TextStyle,

    subheading: {
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        lineHeight: typography.fontSize.lg * typography.lineHeight.normal,
    } as TextStyle,

    body: {
        fontSize: typography.fontSize.base,
        fontWeight: typography.fontWeight.regular,
        lineHeight: typography.fontSize.base * typography.lineHeight.normal,
    } as TextStyle,

    caption: {
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.regular,
        lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
    } as TextStyle,

    small: {
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.regular,
        lineHeight: typography.fontSize.xs * typography.lineHeight.normal,
    } as TextStyle,
} as const;
