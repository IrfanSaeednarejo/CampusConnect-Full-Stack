import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import ProgressBar from '../common/ProgressBar';

/**
 * Advanced Society Summary Component with member management and activity tracking
 */
const SocietySummary = ({
  society,
  isMember = false,
  isAdmin = false,
  memberCount = 0,
  recentActivity = [],
  upcomingEvents = [],
  onJoin,
  onLeave,
  onViewDetails,
  onManage,
  className = '',
  ...props
}) => {
  const [showAllActivity, setShowAllActivity] = useState(false);

  const visibleActivity = showAllActivity ? recentActivity : recentActivity.slice(0, 3);

  return (
    <motion.div
      className={`bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar
              src={society.logo}
              name={society.name}
              size="lg"
              variant="rounded"
            />

            <div>
              <h3 className="text-xl font-semibold text-gray-900">{society.name}</h3>
              <p className="text-sm text-gray-600">{society.category}</p>

              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-1">
                  <span className="material-symbols-outlined text-gray-400 text-sm">group</span>
                  <span className="text-sm text-gray-600">{memberCount} members</span>
                </div>

                {society.rating && (
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">{society.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin && (
              <Badge variant="rounded" color="primary" size="sm">
                Admin
              </Badge>
            )}

            <Button
              variant={isMember ? 'secondary' : 'primary'}
              size="sm"
              onClick={isMember ? onLeave : onJoin}
            >
              {isMember ? 'Leave' : 'Join'}
            </Button>
          </div>
        </div>

        {/* Description */}
        {society.description && (
          <p className="text-gray-600 mt-4 line-clamp-2">{society.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 p-6 border-b border-gray-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{society.eventsCount || 0}</div>
          <div className="text-sm text-gray-500">Events</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{society.postsCount || 0}</div>
          <div className="text-sm text-gray-500">Posts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{memberCount}</div>
          <div className="text-sm text-gray-500">Members</div>
        </div>
      </div>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <div className="p-6 border-b border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Upcoming Events</h4>
          <div className="space-y-3">
            {upcomingEvents.slice(0, 2).map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <h5 className="text-sm font-medium text-gray-900">{event.title}</h5>
                  <p className="text-xs text-gray-500">{event.date}</p>
                </div>
                <Badge variant="outline" size="xs" color="primary">
                  {event.attendees} attending
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900">Recent Activity</h4>
            {recentActivity.length > 3 && (
              <button
                onClick={() => setShowAllActivity(!showAllActivity)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {showAllActivity ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          <div className="space-y-3">
            <AnimatePresence>
              {visibleActivity.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Avatar
                    src={activity.user.avatar}
                    name={activity.user.name}
                    size="sm"
                  />

                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user.name}</span> {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">{activity.timestamp}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
        <Button variant="ghost" size="sm" onClick={onViewDetails}>
          View Details
        </Button>

        {isAdmin && (
          <Button variant="outline" size="sm" onClick={onManage}>
            Manage Society
          </Button>
        )}
      </div>
    </motion.div>
  );
};

SocietySummary.propTypes = {
  society: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    logo: PropTypes.string,
    category: PropTypes.string,
    description: PropTypes.string,
    rating: PropTypes.number,
    eventsCount: PropTypes.number,
    postsCount: PropTypes.number
  }).isRequired,
  isMember: PropTypes.bool,
  isAdmin: PropTypes.bool,
  memberCount: PropTypes.number,
  recentActivity: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      user: PropTypes.shape({
        name: PropTypes.string,
        avatar: PropTypes.string
      }),
      action: PropTypes.string,
      timestamp: PropTypes.string
    })
  ),
  upcomingEvents: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string,
      date: PropTypes.string,
      attendees: PropTypes.number
    })
  ),
  onJoin: PropTypes.func,
  onLeave: PropTypes.func,
  onViewDetails: PropTypes.func,
  onManage: PropTypes.func,
  className: PropTypes.string
};

export default SocietySummary;