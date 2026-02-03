import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import ProgressBar from '../common/ProgressBar';

/**
 * Advanced Society Card Component - Displays society/club information with membership features
 * Shows society details, member count, events, and join/leave functionality
 */
const SocietyCard = React.forwardRef(({
  society,
  onJoin,
  onLeave,
  onViewDetails,
  onFollow,
  isMember = false,
  isFollowing = false,
  isLoading = false,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const [imageError, setImageError] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Calculate membership percentage
  const membershipPercentage = society.maxMembers
    ? Math.min((society.memberCount / society.maxMembers) * 100, 100)
    : 0;

  // Check if society is full
  const isFull = society.maxMembers && society.memberCount >= society.maxMembers;

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
          {/* Society Logo */}
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {society.logo && !imageError ? (
              <img
                src={society.logo}
                alt={society.name}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <span className="material-symbols-outlined text-gray-400">groups</span>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 truncate">{society.name}</h4>
                <p className="text-sm text-gray-600 truncate">{society.category}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {society.memberCount} members
                  </span>
                  {society.isVerified && (
                    <Badge variant="filled" color="success" size="xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </div>

              <IconButton
                icon={isFollowing ? 'notifications' : 'notifications_off'}
                size="sm"
                className={isFollowing ? 'text-blue-500' : 'text-gray-400'}
                onClick={() => onFollow?.(society.id)}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewDetails?.(society)}
              >
                View
              </Button>

              <Button
                variant={isMember ? 'outline' : 'primary'}
                size="sm"
                onClick={() => isMember ? onLeave?.(society.id) : onJoin?.(society.id)}
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
      {/* Header Image */}
      <div className="relative h-40 bg-gradient-to-r from-blue-500 to-purple-600">
        {society.bannerImage && !imageError ? (
          <img
            src={society.bannerImage}
            alt={society.name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-5xl">groups</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {society.isVerified && (
            <Badge variant="filled" color="success" size="sm">
              <span className="material-symbols-outlined text-xs mr-1">verified</span>
              Verified
            </Badge>
          )}
          {society.category && (
            <Badge variant="filled" color="primary" size="sm">
              {society.category}
            </Badge>
          )}
        </div>

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          <IconButton
            icon={isFollowing ? 'notifications' : 'notifications_off'}
            size="sm"
            className={`bg-white/90 backdrop-blur-sm ${isFollowing ? 'text-blue-500' : 'text-gray-600'}`}
            onClick={() => onFollow?.(society.id)}
          />
          <IconButton
            icon="more_vert"
            size="sm"
            className="bg-white/90 backdrop-blur-sm text-gray-600"
          />
        </div>

        {/* Logo Overlay */}
        <div className="absolute -bottom-8 left-6">
          <div className="w-16 h-16 bg-white rounded-lg shadow-lg flex items-center justify-center overflow-hidden border-4 border-white">
            {society.logo && !imageError ? (
              <img
                src={society.logo}
                alt={society.name}
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
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{society.name}</h3>
          {society.tagline && (
            <p className="text-sm text-gray-600 italic">{society.tagline}</p>
          )}
        </div>

        {/* Description */}
        {society.description && (
          <div className="mb-4">
            <p className={`text-sm text-gray-700 leading-relaxed ${
              showFullDescription ? '' : 'line-clamp-3'
            }`}>
              {society.description}
            </p>
            {society.description.length > 150 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-sm text-blue-600 hover:text-blue-700 mt-1"
              >
                {showFullDescription ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {society.memberCount || 0}
            </div>
            <div className="text-xs text-gray-500">Members</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {society.upcomingEventsCount || 0}
            </div>
            <div className="text-xs text-gray-500">Events</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">
              {society.postsCount || 0}
            </div>
            <div className="text-xs text-gray-500">Posts</div>
          </div>
        </div>

        {/* Membership Progress */}
        {society.maxMembers && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Membership Capacity</span>
              <span>{society.memberCount} / {society.maxMembers}</span>
            </div>
            <ProgressBar
              value={membershipPercentage}
              size="sm"
              color={isFull ? 'danger' : membershipPercentage > 80 ? 'warning' : 'success'}
            />
            {isFull && (
              <p className="text-xs text-red-600 mt-1">Society is full</p>
            )}
          </div>
        )}

        {/* Tags */}
        {society.tags && society.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {society.tags.slice(0, 5).map((tag, index) => (
              <Badge key={index} variant="outline" size="xs" color="secondary">
                {tag}
              </Badge>
            ))}
            {society.tags.length > 5 && (
              <Badge variant="outline" size="xs" color="secondary">
                +{society.tags.length - 5} more
              </Badge>
            )}
          </div>
        )}

        {/* Upcoming Event Preview */}
        {society.nextEvent && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-1">
              <span className="material-symbols-outlined text-blue-600 text-sm">event</span>
              <span className="text-sm font-medium text-blue-900">Next Event</span>
            </div>
            <p className="text-sm text-blue-800">{society.nextEvent.title}</p>
            <p className="text-xs text-blue-700 mt-1">
              {new Date(society.nextEvent.date).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails?.(society)}
          >
            View Details
          </Button>

          <div className="flex space-x-2">
            {isMember ? (
              <Button
                variant="outline"
                onClick={() => onLeave?.(society.id)}
                disabled={isLoading}
              >
                {isLoading ? 'Leaving...' : 'Leave Society'}
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => onJoin?.(society.id)}
                disabled={isLoading || isFull}
              >
                {isLoading ? 'Joining...' :
                 isFull ? 'Society Full' : 'Join Society'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
});

SocietyCard.propTypes = {
  society: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    tagline: PropTypes.string,
    description: PropTypes.string,
    logo: PropTypes.string,
    bannerImage: PropTypes.string,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    memberCount: PropTypes.number,
    maxMembers: PropTypes.number,
    upcomingEventsCount: PropTypes.number,
    postsCount: PropTypes.number,
    isVerified: PropTypes.bool,
    nextEvent: PropTypes.shape({
      title: PropTypes.string,
      date: PropTypes.string
    })
  }).isRequired,
  onJoin: PropTypes.func,
  onLeave: PropTypes.func,
  onViewDetails: PropTypes.func,
  onFollow: PropTypes.func,
  isMember: PropTypes.bool,
  isFollowing: PropTypes.bool,
  isLoading: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact']),
  className: PropTypes.string
};

SocietyCard.displayName = 'SocietyCard';

export default SocietyCard;