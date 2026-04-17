import React from 'react';

/**
 * Reusable ProgressBar component for visual progress tracking.
 */
const ProgressBar = ({ 
  progress, 
  height = 'h-2', 
  color = 'bg-[#1f6feb]',
  showStatus = false,
  className = "" 
}) => {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <div className={`w-full ${className}`}>
      {showStatus && (
        <div className="flex justify-between items-center mb-1 text-xs text-gray-400">
          <span>Progress</span>
          <span className="font-bold">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-white/10 rounded-full overflow-hidden ${height}`}>
        <div 
          className={`h-full ${color} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
