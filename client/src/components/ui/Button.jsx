import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Standardized Button Component
 * Replaces hardcoded buttons with fixed widths and hex colors.
 */
export const Button = ({
    children,
    variant = 'primary', // primary, secondary, outline, ghost, danger
    size = 'md', // sm, md, lg
    className = '',
    isLoading = false,
    fullWidth = false,
    as,
    to,
    href,
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold tracking-[0.015em] transition-all duration-200 focus-visible:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
        primary: 'bg-primary text-white hover:bg-primary-hover focus:ring-primary border border-transparent',
        secondary: 'bg-surface border border-border text-text-primary hover:border-border-hover focus:ring-primary',
        ghost: 'bg-transparent text-text-secondary hover:text-text-primary hover:bg-surface focus:ring-border',
        danger: 'bg-danger text-text-primary hover:bg-danger-hover focus:ring-danger border border-transparent',
        outline: 'bg-transparent border border-border text-text-primary hover:bg-surface focus:ring-primary',
    };

    const sizes = {
        sm: 'h-8 px-3 text-xs rounded-md',
        md: 'h-10 px-4 text-sm rounded-lg',
        lg: 'h-12 px-6 text-base rounded-lg',
    };

    const classes = `${baseStyles} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;

    if (as === 'link' || to) {
        return (
            <Link to={to || href} className={classes} {...props}>
                {isLoading ? <Spinner size={size} /> : children}
            </Link>
        );
    }

    if (href) {
        return (
            <a href={href} className={classes} {...props}>
                {isLoading ? <Spinner size={size} /> : children}
            </a>
        );
    }

    return (
        <button className={classes} disabled={disabled || isLoading} {...props}>
            {isLoading ? <Spinner size={size} /> : children}
        </button>
    );
};

const Spinner = ({ size }) => {
    const sizeMap = { sm: 'w-3 h-3', md: 'w-4 h-4', lg: 'w-5 h-5' };
    return (
        <svg className={`animate-spin ${sizeMap[size]} text-current mr-2`} fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );
};
