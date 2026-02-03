import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import ProgressBar from '../common/ProgressBar';
import Badge from '../common/Badge';

/**
 * Advanced Progress Tracker Component with milestones and gamification
 */
const ProgressTracker = ({
  title,
  progress = 0,
  milestones = [],
  currentMilestone,
  showPercentage = true,
  showMilestones = true,
  color = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const completedMilestones = milestones.filter(m => m.completed).length;

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {showPercentage && (
          <Badge variant="rounded" color={color} size="sm">
            {Math.round(progress)}%
          </Badge>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <ProgressBar
          value={progress}
          size={size}
          color={color}
          showLabel={false}
        />
      </div>

      {/* Milestones */}
      {showMilestones && milestones.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Milestones</span>
            <span>{completedMilestones}/{milestones.length} completed</span>
          </div>

          <div className="space-y-2">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className={`flex items-center space-x-3 p-3 rounded-lg ${
                  milestone.completed
                    ? 'bg-green-50 border border-green-200'
                    : milestone.id === currentMilestone?.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  milestone.completed
                    ? 'bg-green-500 text-white'
                    : milestone.id === currentMilestone?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {milestone.completed ? (
                    <span className="material-symbols-outlined text-sm">check</span>
                  ) : milestone.id === currentMilestone?.id ? (
                    <span className="material-symbols-outlined text-sm">flag</span>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>

                <div className="flex-1">
                  <h4 className={`text-sm font-medium ${
                    milestone.completed ? 'text-green-900' : 'text-gray-900'
                  }`}>
                    {milestone.title}
                  </h4>
                  {milestone.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {milestone.description}
                    </p>
                  )}
                </div>

                {milestone.reward && (
                  <div className="flex items-center space-x-1">
                    <span className="material-symbols-outlined text-yellow-500 text-sm">stars</span>
                    <span className="text-xs text-gray-600">{milestone.reward}</span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Current Milestone Highlight */}
      {currentMilestone && (
        <motion.div
          className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white">flag</span>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900">Current Goal</h4>
              <p className="text-sm text-blue-700">{currentMilestone.title}</p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

ProgressTracker.propTypes = {
  title: PropTypes.string.isRequired,
  progress: PropTypes.number,
  milestones: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      completed: PropTypes.bool,
      reward: PropTypes.string
    })
  ),
  currentMilestone: PropTypes.shape({
    id: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string
  }),
  showPercentage: PropTypes.bool,
  showMilestones: PropTypes.bool,
  color: PropTypes.string,
  size: PropTypes.string,
  className: PropTypes.string
};

export default ProgressTracker;