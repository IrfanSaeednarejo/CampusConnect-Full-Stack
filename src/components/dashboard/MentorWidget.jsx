import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import ProgressBar from '../common/ProgressBar';

/**
 * Advanced Mentor Widget Component with session management and progress tracking
 */
const MentorWidget = ({
  mentor,
  upcomingSession,
  completedSessions = 0,
  totalSessions = 0,
  progress = 0,
  skills = [],
  rating = 0,
  reviews = 0,
  isOnline = false,
  onScheduleSession,
  onMessage,
  onViewProfile,
  className = '',
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const sessionStatus = upcomingSession ? (
    new Date(upcomingSession.date) > new Date() ? 'upcoming' : 'ongoing'
  ) : 'none';

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Avatar
              src={mentor.avatar}
              name={mentor.name}
              size="lg"
              status={isOnline ? 'online' : 'offline'}
            />
            {rating > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                ★
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">{mentor.name}</h3>
            <p className="text-sm text-gray-600">{mentor.title}</p>
            <div className="flex items-center space-x-2 mt-1">
              {rating > 0 && (
                <div className="flex items-center space-x-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm text-gray-700">{rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({reviews})</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <IconButton
          icon="expand_more"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
        />
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {skills.slice(0, 3).map((skill, index) => (
              <Badge key={index} variant="outline" size="sm" color="primary">
                {skill}
              </Badge>
            ))}
            {skills.length > 3 && (
              <Badge variant="outline" size="sm" color="secondary">
                +{skills.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Progress */}
      {totalSessions > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600">Mentoring Progress</span>
            <span className="text-sm text-gray-900">{completedSessions}/{totalSessions}</span>
          </div>
          <ProgressBar value={progress} size="sm" color="primary" />
        </div>
      )}

      {/* Upcoming Session */}
      {upcomingSession && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${
                sessionStatus === 'ongoing' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <span className="text-sm font-medium text-blue-900">
                {sessionStatus === 'ongoing' ? 'Session in progress' : 'Upcoming session'}
              </span>
            </div>
            <Badge
              variant="rounded"
              color={sessionStatus === 'ongoing' ? 'success' : 'primary'}
              size="xs"
            >
              {sessionStatus === 'ongoing' ? 'Live' : 'Scheduled'}
            </Badge>
          </div>

          <div className="mt-2 text-sm text-blue-800">
            <div>{format(new Date(upcomingSession.date), 'MMM d, yyyy \'at\' h:mm a')}</div>
            <div className="text-blue-600">{upcomingSession.topic}</div>
          </div>
        </div>
      )}

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200 pt-4 mt-4"
          >
            {/* Bio */}
            {mentor.bio && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
                <p className="text-sm text-gray-600 line-clamp-3">{mentor.bio}</p>
              </div>
            )}

            {/* Experience */}
            {mentor.experience && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Experience</h4>
                <div className="space-y-2">
                  {mentor.experience.slice(0, 2).map((exp, index) => (
                    <div key={index} className="text-sm text-gray-600">
                      <span className="font-medium">{exp.role}</span> at {exp.company}
                      <span className="text-gray-500"> ({exp.duration})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Availability */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Availability</h4>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-sm text-gray-600">
                  {isOnline ? 'Available now' : 'Currently offline'}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex space-x-2 pt-4 border-t border-gray-200">
        <Button
          variant="primary"
          size="sm"
          onClick={onScheduleSession}
          className="flex-1"
        >
          Schedule Session
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onMessage}
        >
          <span className="material-symbols-outlined text-lg">chat</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewProfile}
        >
          <span className="material-symbols-outlined text-lg">person</span>
        </Button>
      </div>
    </motion.div>
  );
};

MentorWidget.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    avatar: PropTypes.string,
    bio: PropTypes.string,
    experience: PropTypes.arrayOf(
      PropTypes.shape({
        role: PropTypes.string,
        company: PropTypes.string,
        duration: PropTypes.string
      })
    )
  }).isRequired,
  upcomingSession: PropTypes.shape({
    date: PropTypes.string,
    topic: PropTypes.string
  }),
  completedSessions: PropTypes.number,
  totalSessions: PropTypes.number,
  progress: PropTypes.number,
  skills: PropTypes.arrayOf(PropTypes.string),
  rating: PropTypes.number,
  reviews: PropTypes.number,
  isOnline: PropTypes.bool,
  onScheduleSession: PropTypes.func,
  onMessage: PropTypes.func,
  onViewProfile: PropTypes.func,
  className: PropTypes.string
};

export default MentorWidget;