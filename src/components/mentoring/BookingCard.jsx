import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Modal from '../common/Modal';
import ProgressBar from '../common/ProgressBar';

/**
 * Advanced Booking Card Component - Displays mentoring session bookings with actions
 * Shows session details, status, and management options
 */
const BookingCard = React.forwardRef(({
  booking,
  onReschedule,
  onCancel,
  onJoinSession,
  onViewDetails,
  onRateSession,
  onSendMessage,
  currentUser,
  isLoading = false,
  className = '',
  ...props
}, ref) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [timeUntilSession, setTimeUntilSession] = useState(null);
  const [canJoin, setCanJoin] = useState(false);

  // Calculate time until session
  useEffect(() => {
    const updateTimeUntil = () => {
      const now = new Date();
      const sessionStart = new Date(booking.scheduledAt);
      const sessionEnd = new Date(sessionStart.getTime() + (booking.duration || 60) * 60 * 1000);
      const diff = sessionStart - now;

      if (now >= sessionStart && now <= sessionEnd) {
        setTimeUntilSession('In Progress');
        setCanJoin(true);
      } else if (diff <= 0) {
        setTimeUntilSession('Session Ended');
        setCanJoin(false);
      } else if (diff <= 60 * 60 * 1000) { // Within 1 hour
        const minutes = Math.floor(diff / (1000 * 60));
        setTimeUntilSession(`${minutes} minute${minutes > 1 ? 's' : ''} left`);
        setCanJoin(minutes <= 15); // Can join 15 minutes before
      } else if (diff <= 24 * 60 * 60 * 1000) { // Within 24 hours
        const hours = Math.floor(diff / (1000 * 60 * 60));
        setTimeUntilSession(`${hours} hour${hours > 1 ? 's' : ''} left`);
        setCanJoin(false);
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        setTimeUntilSession(`${days} day${days > 1 ? 's' : ''} left`);
        setCanJoin(false);
      }
    };

    updateTimeUntil();
    const interval = setInterval(updateTimeUntil, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [booking.scheduledAt, booking.duration]);

  // Get session status
  const getSessionStatus = () => {
    const now = new Date();
    const sessionStart = new Date(booking.scheduledAt);
    const sessionEnd = new Date(sessionStart.getTime() + (booking.duration || 60) * 60 * 1000);

    if (now > sessionEnd) return { status: 'completed', color: 'secondary' };
    if (now >= sessionStart && now <= sessionEnd) return { status: 'in_progress', color: 'success' };
    if (booking.status === 'cancelled') return { status: 'cancelled', color: 'danger' };
    if (booking.status === 'confirmed') return { status: 'confirmed', color: 'primary' };
    return { status: 'pending', color: 'warning' };
  };

  const sessionStatus = getSessionStatus();

  // Format date and time
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    };
  };

  const { date, time } = formatDateTime(booking.scheduledAt);

  // Determine if user is mentor or mentee
  const isMentor = currentUser?.id === booking.mentor.id;
  const otherPerson = isMentor ? booking.mentee : booking.mentor;

  // Handle cancel booking
  const handleCancel = async () => {
    try {
      await onCancel?.(booking.id);
      setShowCancelModal(false);
    } catch (error) {
      console.error('Cancel booking failed:', error);
    }
  };

  // Handle reschedule
  const handleReschedule = async (newDateTime) => {
    try {
      await onReschedule?.(booking.id, newDateTime);
      setShowRescheduleModal(false);
    } catch (error) {
      console.error('Reschedule failed:', error);
    }
  };

  // Get available actions based on status and time
  const getAvailableActions = () => {
    const actions = [];
    const now = new Date();
    const sessionStart = new Date(booking.scheduledAt);
    const hoursUntil = (sessionStart - now) / (1000 * 60 * 60);

    // Can join session
    if (canJoin && sessionStatus.status === 'in_progress') {
      actions.push({
        label: 'Join Session',
        action: 'join',
        variant: 'primary',
        icon: 'videocam'
      });
    }

    // Can message
    actions.push({
      label: 'Send Message',
      action: 'message',
      variant: 'outline',
      icon: 'chat'
    });

    // Can reschedule (if more than 24 hours away and not cancelled/completed)
    if (hoursUntil > 24 && !['cancelled', 'completed'].includes(booking.status)) {
      actions.push({
        label: 'Reschedule',
        action: 'reschedule',
        variant: 'outline',
        icon: 'schedule'
      });
    }

    // Can cancel (if more than 2 hours away and not cancelled/completed)
    if (hoursUntil > 2 && !['cancelled', 'completed'].includes(booking.status)) {
      actions.push({
        label: 'Cancel',
        action: 'cancel',
        variant: 'outline',
        icon: 'cancel',
        danger: true
      });
    }

    // Can rate (if completed and not rated yet)
    if (sessionStatus.status === 'completed' && !booking.rating) {
      actions.push({
        label: 'Rate Session',
        action: 'rate',
        variant: 'success',
        icon: 'star'
      });
    }

    return actions;
  };

  const availableActions = getAvailableActions();

  return (
    <>
      <motion.div
        ref={ref}
        className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
        whileHover={{ y: -2 }}
        {...props}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar
                src={otherPerson.avatar}
                name={otherPerson.name}
                size="md"
              />
              <div>
                <h3 className="font-medium text-gray-900">{otherPerson.name}</h3>
                <p className="text-sm text-gray-600">
                  {isMentor ? 'Mentee' : 'Mentor'}
                </p>
              </div>
            </div>

            <div className="text-right">
              <Badge variant="filled" color={sessionStatus.color} size="sm">
                {sessionStatus.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">{timeUntilSession}</p>
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="p-4">
          {/* Date and Time */}
          <div className="flex items-center space-x-4 mb-3">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-lg">calendar_today</span>
              <span>{date}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-lg">schedule</span>
              <span>{time}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="material-symbols-outlined text-lg">timelapse</span>
              <span>{booking.duration || 60} min</span>
            </div>
          </div>

          {/* Topic */}
          {booking.topic && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Topic</h4>
              <p className="text-sm text-gray-700">{booking.topic}</p>
            </div>
          )}

          {/* Goals */}
          {booking.goals && booking.goals.length > 0 && (
            <div className="mb-3">
              <h4 className="text-sm font-medium text-gray-900 mb-1">Goals</h4>
              <ul className="text-sm text-gray-700 space-y-1">
                {booking.goals.map((goal, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                    <span>{goal}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Session Type */}
          {booking.sessionType && (
            <div className="mb-3">
              <Badge variant="outline" color="info" size="xs">
                {booking.sessionType}
              </Badge>
            </div>
          )}

          {/* Rating (if completed) */}
          {booking.rating && (
            <div className="mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Your rating:</span>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`text-sm ${
                        i < booking.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 mt-4">
            {availableActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                onClick={() => {
                  switch (action.action) {
                    case 'join':
                      onJoinSession?.(booking);
                      break;
                    case 'message':
                      onSendMessage?.(otherPerson);
                      break;
                    case 'reschedule':
                      setShowRescheduleModal(true);
                      break;
                    case 'cancel':
                      setShowCancelModal(true);
                      break;
                    case 'rate':
                      onRateSession?.(booking);
                      break;
                    default:
                      break;
                  }
                }}
                disabled={isLoading}
                className={action.danger ? 'text-red-600 border-red-300 hover:bg-red-50' : ''}
              >
                <span className="material-symbols-outlined text-sm mr-1">
                  {action.icon}
                </span>
                {action.label}
              </Button>
            ))}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onViewDetails?.(booking)}
            >
              View Details
            </Button>
          </div>
        </div>

        {/* Progress Bar for Upcoming Sessions */}
        {sessionStatus.status === 'confirmed' && timeUntilSession !== 'Session Ended' && (
          <div className="px-4 pb-4">
            <div className="text-xs text-gray-500 mb-1">Time until session</div>
            <ProgressBar
              value={Math.max(0, Math.min(100,
                ((new Date() - new Date(Date.now() - (Date.parse(booking.scheduledAt) - Date.now()))) /
                 (Date.parse(booking.scheduledAt) - Date.now())) * 100
              ))}
              size="sm"
              color="primary"
            />
          </div>
        )}
      </motion.div>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Cancel Session"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-red-600 text-xl">cancel</span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Cancel this session?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Are you sure you want to cancel your mentoring session with {otherPerson.name}?
              This action cannot be undone.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Cancellations made less than 24 hours before the session
                may be subject to cancellation fees.
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowCancelModal(false)}
              className="flex-1"
            >
              Keep Session
            </Button>
            <Button
              variant="danger"
              onClick={handleCancel}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Cancelling...' : 'Cancel Session'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={showRescheduleModal}
        onClose={() => setShowRescheduleModal(false)}
        title="Reschedule Session"
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Reschedule with {otherPerson.name}
            </h3>
            <p className="text-sm text-gray-600">
              Select a new date and time for your mentoring session.
            </p>
          </div>

          {/* Reschedule form would go here - simplified for demo */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Reschedule functionality would include a calendar picker and time slots.
              For this demo, we'll simulate the reschedule action.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowRescheduleModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={() => handleReschedule(new Date())}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Rescheduling...' : 'Confirm New Time'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
});

BookingCard.propTypes = {
  booking: PropTypes.shape({
    id: PropTypes.string.isRequired,
    mentor: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string
    }).isRequired,
    mentee: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      avatar: PropTypes.string
    }).isRequired,
    scheduledAt: PropTypes.string.isRequired,
    duration: PropTypes.number,
    topic: PropTypes.string,
    goals: PropTypes.arrayOf(PropTypes.string),
    sessionType: PropTypes.string,
    status: PropTypes.oneOf(['pending', 'confirmed', 'cancelled', 'completed']),
    rating: PropTypes.number
  }).isRequired,
  onReschedule: PropTypes.func,
  onCancel: PropTypes.func,
  onJoinSession: PropTypes.func,
  onViewDetails: PropTypes.func,
  onRateSession: PropTypes.func,
  onSendMessage: PropTypes.func,
  currentUser: PropTypes.shape({
    id: PropTypes.string
  }),
  isLoading: PropTypes.bool,
  className: PropTypes.string
};

BookingCard.displayName = 'BookingCard';

export default BookingCard;