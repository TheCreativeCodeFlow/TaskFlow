// TaskFlow Color Palette - Modern developer-centric dark theme

export const colors = {
    // Background colors
    background: '#0B1120',      // Deep navy background
    surface: '#111827',         // Primary surface
    surfaceLight: '#1F2937',    // Card backgrounds
    surfaceHighlight: '#374151', // Hover/active states

    // Primary accent
    primary: '#3B82F6',         // Modern blue for actions
    primaryDark: '#2563EB',     // Pressed state
    primaryLight: '#60A5FA',    // Light variant

    // Semantic colors
    success: '#10B981',         // Success green
    successLight: '#34D399',
    error: '#EF4444',           // Danger red
    errorDark: '#DC2626',
    warning: '#F59E0B',         // Warning amber
    info: '#06B6D4',            // Info cyan

    // Text colors
    text: '#F9FAFB',            // Primary text
    textSecondary: '#D1D5DB',   // Secondary text
    textMuted: '#9CA3AF',       // Muted/placeholder text
    textInverse: '#111827',     // Text on light backgrounds

    // Border colors
    border: '#1F2937',          // Subtle borders
    borderLight: '#374151',     // Light borders

    // Overlay
    overlay: 'rgba(11, 17, 32, 0.85)', // Modal overlay
} as const;

// Category colors with modern palette
export const categoryColors: Record<string, string> = {
    work: '#3B82F6',      // Blue
    personal: '#A855F7',  // Purple
    study: '#10B981',     // Green
    project: '#F59E0B',   // Orange
    other: '#6B7280',     // Gray
};
