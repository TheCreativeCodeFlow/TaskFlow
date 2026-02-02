// TaskFlow Color Palette - Dark, tech-inspired theme

export const colors = {
    // Background colors
    background: '#0D1117',      // Deep navy - main background
    surface: '#161B22',         // Elevated surface
    surfaceLight: '#21262D',    // Card backgrounds
    surfaceHighlight: '#30363D', // Hover/active states

    // Primary accent
    primary: '#58A6FF',         // Sky blue for actions and highlights
    primaryDark: '#388BFD',     // Pressed state
    primaryLight: '#79C0FF',    // Light variant

    // Semantic colors
    success: '#3FB950',         // Green for completed tasks
    successLight: '#56D364',
    error: '#F85149',           // Red for delete actions
    errorDark: '#DA3633',
    warning: '#D29922',         // Amber for warnings

    // Text colors
    text: '#E6EDF3',            // Primary text
    textSecondary: '#B1BAC4',   // Secondary text
    textMuted: '#8B949E',       // Muted/placeholder text
    textInverse: '#0D1117',     // Text on light backgrounds

    // Border colors
    border: '#30363D',          // Subtle borders
    borderLight: '#21262D',     // Very subtle borders

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.6)', // Modal overlay
} as const;

// Category colors
export const categoryColors: Record<string, string> = {
    work: '#58A6FF',      // Blue
    personal: '#A371F7',  // Purple
    study: '#3FB950',     // Green
    project: '#F0883E',   // Orange
    other: '#8B949E',     // Gray
};
