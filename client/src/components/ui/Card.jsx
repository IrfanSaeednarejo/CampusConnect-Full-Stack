import React from 'react';

/**
 * Standardized Card Component
 * Replaces hardcoded border limits and hover behaviors.
 */
export const Card = ({ children, className = '', hoverable = false, ...props }) => {
    return (
        <div
            className={`bg-surface border border-border rounded-lg overflow-hidden ${hoverable ? 'card-hover cursor-pointer' : ''
                } ${className}`}
            {...props}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className = '', ...props }) => (
    <div className={`p-6 pb-4 border-b border-border ${className}`} {...props}>
        {children}
    </div>
);

export const CardContent = ({ children, className = '', ...props }) => (
    <div className={`p-6 ${className}`} {...props}>
        {children}
    </div>
);

export const CardFooter = ({ children, className = '', ...props }) => (
    <div className={`p-6 pt-4 border-t border-border bg-background ${className}`} {...props}>
        {children}
    </div>
);
