import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import ProgressBar from '../common/ProgressBar';

/**
 * Advanced Group Card Component - Displays study group information
 * Shows group details, members, progress, and join/leave functionality
 */
const GroupCard = React.forwardRef(({
  group,
  onJoin,
  onLeave,
  onViewDetails,
  onMessage,
  isMember = false,
  isLoading = false,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const [imageError, setImageError] = useState(false);

  // Calculate capacity percentage
  const capacityPercentage = group.maxMembers
    ? Math.min((group.memberCount / group.maxMembers) * 100, 100)
    : 0;

  const isFull = group.maxMembers && group.memberCount >= group.maxMembers;

  // Handle image error
  const handleImageError = () => {
    setImageError(true);
  };

  // Render compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        ref={ref}
        className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}
        whileHover={{ y: -2 }}
        {...props}
      >
        <div className="flex items-start space-x-3">
          {/* Group Icon */}
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
            {group.image && !imageError ? (
              <img
                src={group.image}
                alt={group.name}
                className="w-full h-full object-cover rounded-lg"
                onError={handleImageError}
              />
            ) : (
              <span className="material-symbols-outlined text-white">groups</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 truncate">{group.name}</h4>
                <p className="text-sm text-gray-600 truncate">{group.subject}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {group.memberCount} / {group.maxMembers || '∞'} members
                  </span>
                  {group.isPrivate && (
                    <Badge variant="outline" color="warning" size="xs">
                      Private
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails?.(group)}
              >
                View
              </Button>

              <Button
                variant={isMember ? 'outline' : 'primary'}
                size="sm"
                onClick={() => isMember ? onLeave?.(group.id) : onJoin?.(group.id)}
                disabled={isLoading || isFull}
              >
                {isLoading ? 'Processing...' :
                 isMember ? 'Leave' :
                 isFull ? 'Full' : 'Join'}
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Render default variant
  return (
    <motion.div
      ref={ref}
      className={`bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${className}`}
      whileHover={{ y: -4 }}
      {...props}
    >
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
        {group.bannerImage && !imageError ? (
          <img
            src={group.bannerImage}
            alt={group.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-4xl">groups</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {group.isPrivate && (
            <Badge variant="filled" color="warning" size="sm">
              <span className="material-symbols-outlined text-xs mr-1">lock</span>
              Private
            </Badge>
          )}
          {group.subject && (
            <Badge variant="filled" color="primary" size="sm">
              {group.subject}
            </Badge>
          )}
        </div>

        {/* Logo Overlay */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
            {group.image && !imageError ? (
              <img
                src={group.image}
                alt={group.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <span className="material-symbols-outlined text-gray-400 text-2xl">groups</span>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="pt-10 p-6">
        {/* Title and Info */}
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{group.name}</h3>
          {group.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{group.description}</p>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {group.memberCount || 0}
            </div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {group.sessionsCount || 0}
            </div>
            <div className="text-xs text-gray-500">Sessions</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {group.studyHours || 0}
            </div>
            <div className="text-xs text-gray-500">Study Hours</div>
          </div>
        </div>

        {/* Capacity Progress */}
        {group.maxMembers && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Group Capacity</span>
              <span>{group.memberCount} / {group.maxMembers}</span>
            </div>
            <ProgressBar
              value={capacityPercentage}
              size="sm"
              color={isFull ? 'danger' : capacityPercentage > 80 ? 'warning' : 'success'}
            />
            {isFull && (
              <p className="text-xs text-red-600 mt-1">Group is full</p>
            )}
          </div>
        )}

        {/* Members Preview */}
        {group.members && group.members.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-900 mb-2">Members</h4>
            <div className="flex items-center space-x-2">
              {group.members.slice(0, 5).map((member, index) => (
                <Avatar
                  key={member.id || index}
                  src={member.avatar}
                  name={member.name}
                  size="sm"
                />
              ))}
              {group.members.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600">
                  +{group.members.length - 5}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {group.tags && group.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {group.tags.slice(0, 4).map((tag, index) => (
              <Badge key={index} variant="outline" size="xs" color="secondary">
                {tag}
              </Badge>
            ))}
            {group.tags.length > 4 && (
              <Badge variant="outline" size="xs" color="secondary">
                +{group.tags.length - 4}
              </Badge>
            )}
          </div>
        )}

        {/* Next Session */}
        {group.nextSession && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-1">
              <span className="material-symbols-outlined text-blue-600 text-sm">schedule</span>
              <span className="text-sm font-medium text-blue-900">Next Session</span>
            </div>
            <p className="text-sm text-blue-800">{group.nextSession.title}</p>
            <p className="text-xs text-blue-700 mt-1">
              {new Date(group.nextSession.date).toLocaleDateString()} at{' '}
              {new Date(group.nextSession.date).toLocaleTimeString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(group)}
            >
              View Details
            </Button>
            {isMember && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMessage?.(group)}
              >
                <span className="material-symbols-outlined text-sm mr-1">chat</span>
                Message
              </Button>
            )}
          </div>

          <div className="flex space-x-2">
            {isMember ? (
              <Button
                variant="outline"
                onClick={() => onLeave?.(group.id)}
                disabled={isLoading}
              >
                {isLoading ? 'Leaving...' : 'Leave Group'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => onJoin?.(group.id)}
                disabled={isLoading || isFull}
              >
                {isLoading ? 'Joining...' :
                 isFull ? 'Group Full' : 'Join Group'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

GroupCard.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    subject: PropTypes.string,
    image: PropTypes.string,
    bannerImage: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    memberCount: PropTypes.number,
    maxMembers: PropTypes.number,
    sessionsCount: PropTypes.number,
    studyHours: PropTypes.number,
    isPrivate: PropTypes.bool,
    members: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string
      })
    ),
    nextSession: PropTypes.shape({
      title: PropTypes.string,
      date: PropTypes.string
    })
  }).isRequired,
  onJoin: PropTypes.func,
  onLeave: PropTypes.func,
  onViewDetails: PropTypes.func,
  onMessage: PropTypes.func,
  isMember: PropTypes.bool,
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact']),
  className: PropTypes.string
};

GroupCard.displayName = 'GroupCard';

export default GroupCard;