import React from 'react';

/**
 * Standardized PageContainer Component
 * Replaces arbitrary layouts and max-widths throughout pages.
 */
export const PageContainer = ({ children, className = '', maxWidth = '7xl', centered = false }) => {
    const maxWidthClass = {
        'sm': 'max-w-sm',
        'md': 'max-w-md',
        'lg': 'max-w-lg',
        'xl': 'max-w-xl',
        '2xl': 'max-w-2xl',
        '3xl': 'max-w-3xl',
        '4xl': 'max-w-4xl',
        '5xl': 'max-w-5xl',
        '6xl': 'max-w-6xl',
        '7xl': 'max-w-7xl',
        'full': 'max-w-full'
    }[maxWidth] || 'max-w-7xl';

    return (
        <div className={`min-h-[calc(100vh-64px)] bg-background w-full px-4 sm:px-6 lg:px-8 py-8 ${centered ? 'flex flex-col items-center justify-center' : ''}`}>
            <div className={`w-full mx-auto ${maxWidthClass} ${className}`}>
                {children}
            </div>
        </div>
    );
};
