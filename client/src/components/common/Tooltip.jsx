import React, { useState } from 'react';

/**
 * Reusable Tooltip component for hover information.
 */
const Tooltip = ({ 
  text, 
  children, 
  position = 'top',
  delay = 200,
  className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const show = () => {
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const hide = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const positions = {
    top: '-top-2 left-1/2 -translate-x-1/2 -translate-y-full mb-2',
    bottom: '-bottom-2 left-1/2 -translate-x-1/2 translate-y-full mt-2',
    left: 'top-1/2 -left-2 -translate-x-full -translate-y-1/2 mr-2',
    right: 'top-1/2 -right-2 translate-x-full -translate-y-1/2 ml-2'
  };

  const triangles = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-[#30363d] border-l-transparent border-r-transparent border-b-transparent',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-[#30363d] border-l-transparent border-r-transparent border-t-transparent',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-[#30363d] border-t-transparent border-b-transparent border-r-transparent',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-[#30363d] border-t-transparent border-b-transparent border-l-transparent'
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {children}
      {isVisible && (
        <div className={`absolute z-[1000] px-3 py-2 bg-[#161b22] border border-[#30363d] rounded shadow-xl text-xs text-white whitespace-nowrap animate-in fade-in duration-200 ${positions[position]}`}>
          {text}
          {/* Triangle Pointer */}
          <div className={`absolute w-0 h-0 border-[4px] ${triangles[position]}`} />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
