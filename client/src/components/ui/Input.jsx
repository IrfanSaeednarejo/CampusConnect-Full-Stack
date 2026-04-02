import React, { forwardRef } from 'react';

/**
 * Standardized Input Component
 * Replaces hardcoded borders, rings, and padding.
 */
export const Input = forwardRef(({ className = '', error, label, ...props }, ref) => {
    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`w-full px-4 py-2 bg-surface border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border'
                    } ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-danger">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';

export const Textarea = forwardRef(({ className = '', error, label, ...props }, ref) => {
    return (
        <div className="w-full flex flex-col gap-1.5">
            {label && (
                <label className="text-sm font-medium text-text-primary">
                    {label}
                </label>
            )}
            <textarea
                ref={ref}
                className={`w-full px-4 py-3 bg-surface border rounded-lg text-text-primary placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[100px] resize-y ${error ? 'border-danger focus:ring-danger focus:border-danger' : 'border-border'
                    } ${className}`}
                {...props}
            />
            {error && <span className="text-xs text-danger">{error}</span>}
        </div>
    );
});

Textarea.displayName = 'Textarea';
