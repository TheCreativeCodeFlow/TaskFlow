// Helper utilities for TaskFlow

/**
 * Get greeting message based on time of day
 */
export const getGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour < 12) {
        return 'Good morning';
    } else if (hour < 17) {
        return 'Good afternoon';
    } else if (hour < 21) {
        return 'Good evening';
    } else {
        return 'Good night';
    }
};

/**
 * Format date for display
 */
export const formatDate = (date: Date = new Date()): string => {
    const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
};

/**
 * Get motivational message for empty state
 */
export const getMotivationalMessage = (): string => {
    const messages = [
        "Ready to be productive?",
        "What's on your mind today?",
        "Let's get things done!",
        "Time to crush some tasks!",
        "Your blank slate awaits...",
        "Start fresh, think big!",
    ];
    return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * Category display names
 */
export const categoryLabels: Record<string, string> = {
    work: 'Work',
    personal: 'Personal',
    study: 'Study',
    project: 'Project',
    other: 'Other',
};

/**
 * Get category label
 */
export const getCategoryLabel = (category: string): string => {
    return categoryLabels[category] || 'Other';
};
