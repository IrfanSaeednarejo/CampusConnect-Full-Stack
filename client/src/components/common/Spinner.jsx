import React from 'react';

/**
 * Reusable Spinner component for showing loading states in small areas.
 */
const Spinner = ({ 
  size = 'md', 
  color = 'primary', 
  className = "" 
}) => {
  const sizes = {
    xs: 'w-3 h-3 border-2',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
    xl: 'w-16 h-16 border-4'
  };

  const colors = {
    primary: 'border-t-[#1f6feb]',
    success: 'border-t-[#238636]',
    error: 'border-t-red-500',
    white: 'border-t-white'
  };

  return (
    <div className={`inline-block animate-spin rounded-full border-white/10 ${sizes[size]} ${colors[color]} ${className}`} />
  );
};

export default Spinner;
