import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isToday, isTomorrow, formatDistanceToNow } from 'date-fns';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Event Card Component with interactive features and animations
 */
const EventCard = ({
  event,
  variant = 'default',
  size = 'md',
  showActions = true,
  showAttendees = true,
  isBookmarked = false,
  isRegistered = false,
  onBookmark,
  onRegister,
  onShare,
  onViewDetails,
  className = '',
  ...props
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Format event date
  const formatEventDate = (date) => {
    const eventDate = new Date(date);

    if (isToday(eventDate)) {
      return `Today at ${format(eventDate, 'h:mm a')}`;
    } else if (isTomorrow(eventDate)) {
      return `Tomorrow at ${format(eventDate, 'h:mm a')}`;
    } else {
      return format(eventDate, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  // Get event status
  const getEventStatus = () => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);

    if (now > eventEnd) return 'completed';
    if (now >= eventStart && now <= eventEnd) return 'ongoing';
    if (eventStart - now < 24 * 60 * 60 * 1000) return 'upcoming';
    return 'scheduled';
  };

  const status = getEventStatus();
  const statusColors = {
    completed: 'secondary',
    ongoing: 'success',
    upcoming: 'warning',
    scheduled: 'info'
  };

  // Size variants
  const sizes = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };

  // Variant styles
  const variants = {
    default: 'bg-white border border-gray-200 hover:shadow-md',
    featured: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-2 border-blue-200 hover:shadow-lg',
    minimal: 'bg-gray-50 border border-gray-100 hover:bg-gray-100',
    card: 'bg-white border border-gray-200 shadow-sm hover:shadow-lg'
  };

  return (
    <motion.div
      className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${variants[variant]} ${sizes[size]} ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -2 }}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onClick={onViewDetails}
      {...props}
    >
      {/* Event Image */}
      {event.image && (
        <div className="relative h-48 -m-6 mb-6 overflow-hidden rounded-t-lg">
          <motion.img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: imageLoaded ? 1 : 1.1 }}
            transition={{ duration: 0.3 }}
            onLoad={() => setImageLoaded(true)}
          />

          {/* Overlay on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); onViewDetails(); }}>
                  View Details
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <Badge
              variant="rounded"
              color={statusColors[status]}
              className="text-xs font-medium"
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>

          {/* Bookmark Button */}
          {showActions && (
            <div className="absolute top-3 right-3">
              <IconButton
                icon={isBookmarked ? 'bookmark' : 'bookmark_border'}
                size="sm"
                onClick={(e) => { e.stopPropagation(); onBookmark?.(); }}
                className={`${isBookmarked ? 'text-yellow-500' : 'text-white'} hover:text-yellow-400`}
              />
            </div>
          )}
        </div>
      )}

      {/* Event Content */}
      <div className="space-y-3">
        {/* Title and Category */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {event.title}
          </h3>
          {event.category && (
            <p className="text-sm text-blue-600 font-medium mt-1">
              {event.category}
            </p>
          )}
        </div>

        {/* Description */}
        {event.description && (
          <p className="text-gray-600 text-sm line-clamp-3">
            {event.description}
          </p>
        )}

        {/* Date and Location */}
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <span className="material-symbols-outlined text-lg mr-2">schedule</span>
            <span>{formatEventDate(event.startDate)}</span>
          </div>

          {event.location && (
            <div className="flex items-center text-sm text-gray-500">
              <span className="material-symbols-outlined text-lg mr-2">location_on</span>
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {/* Organizer */}
        {event.organizer && (
          <div className="flex items-center space-x-2">
            <Avatar
              src={event.organizer.avatar}
              name={event.organizer.name}
              size="sm"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900 truncate">
                Organized by {event.organizer.name}
              </p>
              {event.organizer.role && (
                <p className="text-xs text-gray-500">{event.organizer.role}</p>
              )}
            </div>
          </div>
        )}

        {/* Attendees */}
        {showAttendees && event.attendees && event.attendees.length > 0 && (
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {event.attendees.slice(0, 3).map((attendee, index) => (
                <Avatar
                  key={attendee.id}
                  src={attendee.avatar}
                  name={attendee.name}
                  size="sm"
                  className="ring-2 ring-white"
                />
              ))}
              {event.attendees.length > 3 && (
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center ring-2 ring-white">
                  <span className="text-xs text-gray-600 font-medium">
                    +{event.attendees.length - 3}
                  </span>
                </div>
              )}
            </div>

            <span className="text-sm text-gray-500">
              {event.attendees.length} attending
            </span>
          </div>
        )}

        {/* Tags */}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" size="sm" color="secondary">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" size="sm" color="secondary">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => { e.stopPropagation(); onShare?.(); }}
                className="text-gray-600 hover:text-gray-900"
              >
                <span className="material-symbols-outlined text-lg mr-1">share</span>
                Share
              </Button>

              {event.capacity && (
                <div className="text-sm text-gray-500">
                  {event.registeredCount || 0}/{event.capacity} spots
                </div>
              )}
            </div>

            <Button
              variant={isRegistered ? 'secondary' : 'primary'}
              size="sm"
              onClick={(e) => { e.stopPropagation(); onRegister?.(); }}
              disabled={status === 'completed' || (event.capacity && event.registeredCount >= event.capacity)}
            >
              {isRegistered ? 'Registered' : 'Register'}
            </Button>
          </div>
        )}

        {/* Event Stats */}
        {variant === 'featured' && (
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {event.views || 0}
              </div>
              <div className="text-xs text-gray-500">Views</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {event.likes || 0}
              </div>
              <div className="text-xs text-gray-500">Likes</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">
                {event.shares || 0}
              </div>
              <div className="text-xs text-gray-500">Shares</div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Event Card Grid/List Layout
EventCard.Grid = ({ events, columns = 3, ...props }) => (
  <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-${columns}`}>
    {events.map((event) => (
      <EventCard key={event.id} event={event} {...props} />
    ))}
  </div>
);

EventCard.List = ({ events, ...props }) => (
  <div className="space-y-4">
    {events.map((event) => (
      <EventCard key={event.id} event={event} variant="minimal" {...props} />
    ))}
  </div>
);

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    location: PropTypes.string,
    image: PropTypes.string,
    category: PropTypes.string,
    organizer: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string,
      role: PropTypes.string
    }),
    attendees: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        avatar: PropTypes.string
      })
    ),
    tags: PropTypes.arrayOf(PropTypes.string),
    capacity: PropTypes.number,
    registeredCount: PropTypes.number,
    views: PropTypes.number,
    likes: PropTypes.number,
    shares: PropTypes.number
  }).isRequired,
  variant: PropTypes.oneOf(['default', 'featured', 'minimal', 'card']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showActions: PropTypes.bool,
  showAttendees: PropTypes.bool,
  isBookmarked: PropTypes.bool,
  isRegistered: PropTypes.bool,
  onBookmark: PropTypes.func,
  onRegister: PropTypes.func,
  onShare: PropTypes.func,
  onViewDetails: PropTypes.func,
  className: PropTypes.string
};

export default EventCard;