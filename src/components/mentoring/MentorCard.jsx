import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import ProgressBar from '../common/ProgressBar';

/**
 * Advanced Mentor Card Component - Displays mentor information with booking capabilities
 * Shows mentor profile, expertise, availability, and booking options
 */
const MentorCard = React.forwardRef(({
  mentor,
  onBookSession,
  onViewProfile,
  onMessage,
  onFavorite,
  isFavorited = false,
  isLoading = false,
  showBooking = true,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const [imageError, setImageError] = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  // Calculate average rating
  const averageRating = mentor.reviews && mentor.reviews.length > 0
    ? mentor.reviews.reduce((sum, review) => sum + review.rating, 0) / mentor.reviews.length
    : 0;

  // Get availability status
  const getAvailabilityStatus = () => {
    if (!mentor.availability) return { status: 'unknown', color: 'secondary' };

    const now = new Date();
    const availability = mentor.availability;

    if (availability.isOnline) return { status: 'online', color: 'success' };
    if (availability.nextAvailable) {
      const nextAvailable = new Date(availability.nextAvailable);
      const hoursUntil = (nextAvailable - now) / (1000 * 60 * 60);
      if (hoursUntil <= 24) return { status: 'available_soon', color: 'warning' };
    }

    return { status: 'busy', color: 'secondary' };
  };

  const availability = getAvailabilityStatus();

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
          {/* Avatar with Status */}
          <div className="relative">
            <Avatar
              src={mentor.avatar}
              name={mentor.name}
              size="md"
            />
            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
              availability.color === 'success' ? 'bg-green-500' :
              availability.color === 'warning' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{mentor.name}</h4>
                <p className="text-sm text-gray-600">{mentor.title}</p>
                <p className="text-sm text-gray-500">{mentor.company}</p>
              </div>

              <IconButton
                icon={isFavorited ? 'favorite' : 'favorite_border'}
                size="sm"
                className={isFavorited ? 'text-red-500' : 'text-gray-400'}
                onClick={() => onFavorite?.(mentor.id)}
              />
            </div>

            {/* Rating */}
            <div className="flex items-center space-x-2 mt-2">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-sm ${
                      i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {averageRating.toFixed(1)} ({mentor.reviews?.length || 0})
              </span>
            </div>

            {/* Top Skills */}
            {mentor.skills && mentor.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {mentor.skills.slice(0, 2).map((skill, index) => (
                  <Badge key={index} variant="outline" size="xs" color="primary">
                    {skill}
                  </Badge>
                ))}
                {mentor.skills.length > 2 && (
                  <Badge variant="outline" size="xs" color="secondary">
                    +{mentor.skills.length - 2}
                  </Badge>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewProfile?.(mentor)}
              >
                View Profile
              </Button>

              {showBooking && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onBookSession?.(mentor)}
                  disabled={isLoading}
                >
                  {isLoading ? 'Booking...' : 'Book Session'}
                </Button>
              )}
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
      <div className="p-6 pb-4">
        <div className="flex items-start space-x-4">
          {/* Avatar with Status */}
          <div className="relative">
            <Avatar
              src={mentor.avatar}
              name={mentor.name}
              size="lg"
            />
            <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white ${
              availability.color === 'success' ? 'bg-green-500' :
              availability.color === 'warning' ? 'bg-yellow-500' : 'bg-gray-400'
            }`} />
            {availability.status === 'online' && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-3 border-white bg-green-500 animate-pulse" />
            )}
          </div>

          {/* Basic Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">{mentor.name}</h3>
                <p className="text-gray-600">{mentor.title}</p>
                <p className="text-sm text-gray-500">{mentor.company}</p>
              </div>

              <div className="flex items-center space-x-2">
                <IconButton
                  icon={isFavorited ? 'favorite' : 'favorite_border'}
                  className={isFavorited ? 'text-red-500' : 'text-gray-400'}
                  onClick={() => onFavorite?.(mentor.id)}
                />
                <IconButton
                  icon="more_vert"
                  className="text-gray-400"
                />
              </div>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center space-x-3 mt-3">
              <div className="flex items-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                  >
                    ★
                  </span>
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <span className="text-sm text-gray-500">
                ({mentor.reviews?.length || 0} reviews)
              </span>
              <Badge variant="outline" color={availability.color} size="xs">
                {availability.status === 'online' ? 'Available Now' :
                 availability.status === 'available_soon' ? 'Available Soon' : 'Busy'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {mentor.skills && mentor.skills.length > 0 && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Expertise</h4>
          <div className="flex flex-wrap gap-2">
            {mentor.skills.map((skill, index) => (
              <Badge key={index} variant="filled" color="primary" size="sm">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Bio */}
      {mentor.bio && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">About</h4>
          <p className={`text-sm text-gray-700 leading-relaxed ${
            showFullBio ? '' : 'line-clamp-3'
          }`}>
            {mentor.bio}
          </p>
          {mentor.bio.length > 150 && (
            <button
              onClick={() => setShowFullBio(!showFullBio)}
              className="text-sm text-blue-600 hover:text-blue-700 mt-1"
            >
              {showFullBio ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>
      )}

      {/* Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {mentor.menteesCount || 0}
            </div>
            <div className="text-xs text-gray-500">Mentees</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {mentor.sessionsCount || 0}
            </div>
            <div className="text-xs text-gray-500">Sessions</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {mentor.experienceYears || 0}
            </div>
            <div className="text-xs text-gray-500">Years Exp.</div>
          </div>
        </div>
      </div>

      {/* Pricing */}
      {mentor.sessionPricing && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Session Price</span>
              <div className="text-lg font-semibold text-gray-900">
                ${mentor.sessionPricing.amount}
                <span className="text-sm text-gray-500">/{mentor.sessionPricing.unit}</span>
              </div>
            </div>
            <Badge variant="outline" color="success" size="sm">
              {mentor.sessionPricing.currency || 'USD'}
            </Badge>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 pb-6">
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => onMessage?.(mentor)}
            className="flex-1"
          >
            <span className="material-symbols-outlined text-sm mr-2">chat</span>
            Message
          </Button>

          <Button
            variant="outline"
            onClick={() => onViewProfile?.(mentor)}
            className="flex-1"
          >
            <span className="material-symbols-outlined text-sm mr-2">person</span>
            Profile
          </Button>

          {showBooking && (
            <Button
              variant="primary"
              onClick={() => onBookSession?.(mentor)}
              disabled={isLoading || availability.status === 'busy'}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <span className="material-symbols-outlined text-sm mr-2 animate-spin">refresh</span>
                  Booking...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm mr-2">event_available</span>
                  Book Session
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Response Time Indicator */}
      {mentor.averageResponseTime && (
        <div className="px-6 pb-4 border-t border-gray-100">
          <div className="flex items-center justify-center text-sm text-gray-600">
            <span className="material-symbols-outlined text-sm mr-1">schedule</span>
            Typically responds within {mentor.averageResponseTime}
          </div>
        </div>
      )}
    </motion.div>
  );
});

MentorCard.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    title: PropTypes.string,
    company: PropTypes.string,
    bio: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    reviews: PropTypes.arrayOf(
      PropTypes.shape({
        rating: PropTypes.number
      })
    ),
    menteesCount: PropTypes.number,
    sessionsCount: PropTypes.number,
    experienceYears: PropTypes.number,
    availability: PropTypes.shape({
      isOnline: PropTypes.bool,
      nextAvailable: PropTypes.string
    }),
    sessionPricing: PropTypes.shape({
      amount: PropTypes.number,
      unit: PropTypes.string,
      currency: PropTypes.string
    }),
    averageResponseTime: PropTypes.string
  }).isRequired,
  onBookSession: PropTypes.func,
  onViewProfile: PropTypes.func,
  onMessage: PropTypes.func,
  onFavorite: PropTypes.func,
  isFavorited: PropTypes.bool,
  isLoading: PropTypes.bool,
  showBooking: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact']),
  className: PropTypes.string
};

MentorCard.displayName = 'MentorCard';

export default MentorCard;