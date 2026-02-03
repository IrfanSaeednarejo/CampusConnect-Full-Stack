import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import Modal from '../common/Modal';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';

/**
 * Advanced Register Button Component - Smart event registration with multiple states
 * Handles registration flow, waitlists, and capacity management
 */
const RegisterButton = React.forwardRef(({
  event,
  user,
  onRegister,
  onUnregister,
  onJoinWaitlist,
  onLeaveWaitlist,
  isRegistered = false,
  isOnWaitlist = false,
  isLoading = false,
  registrationDeadline,
  className = '',
  variant = 'primary',
  size = 'md',
  ...props
}, ref) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);

  // Calculate time until deadline
  useEffect(() => {
    if (!registrationDeadline) return;

    const updateTimeLeft = () => {
      const now = new Date();
      const deadline = new Date(registrationDeadline);
      const diff = deadline - now;

      if (diff <= 0) {
        setIsDeadlinePassed(true);
        setTimeLeft(null);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 24) {
        const days = Math.floor(hours / 24);
        setTimeLeft(`${days} day${days > 1 ? 's' : ''} left`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m left`);
      } else {
        setTimeLeft(`${minutes} minute${minutes > 1 ? 's' : ''} left`);
      }
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [registrationDeadline]);

  // Determine button state and text
  const getButtonState = () => {
    const now = new Date();
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const deadline = registrationDeadline ? new Date(registrationDeadline) : eventStart;

    // Event has ended
    if (now > eventEnd) {
      return {
        text: 'Event Ended',
        variant: 'secondary',
        disabled: true,
        icon: 'event_busy'
      };
    }

    // Event is ongoing
    if (now >= eventStart && now <= eventEnd) {
      return {
        text: isRegistered ? 'Attending' : 'Event in Progress',
        variant: isRegistered ? 'success' : 'secondary',
        disabled: true,
        icon: 'event_available'
      };
    }

    // Registration deadline has passed
    if (now > deadline) {
      return {
        text: 'Registration Closed',
        variant: 'secondary',
        disabled: true,
        icon: 'lock_clock'
      };
    }

    // Event is full
    if (event.capacity && (event.registeredCount || 0) >= event.capacity) {
      if (isOnWaitlist) {
        return {
          text: 'Leave Waitlist',
          variant: 'outline',
          disabled: false,
          icon: 'hourglass_empty',
          action: 'leave_waitlist'
        };
      } else {
        return {
          text: 'Join Waitlist',
          variant: 'warning',
          disabled: false,
          icon: 'queue',
          action: 'join_waitlist'
        };
      }
    }

    // User is registered
    if (isRegistered) {
      return {
        text: 'Unregister',
        variant: 'outline',
        disabled: false,
        icon: 'cancel',
        action: 'unregister'
      };
    }

    // Default registration state
    return {
      text: 'Register',
      variant: variant,
      disabled: false,
      icon: 'event_available',
      action: 'register'
    };
  };

  const buttonState = getButtonState();

  // Handle button click
  const handleClick = () => {
    if (buttonState.disabled) return;

    switch (buttonState.action) {
      case 'register':
        setShowConfirmModal(true);
        break;
      case 'unregister':
        handleUnregister();
        break;
      case 'join_waitlist':
        handleJoinWaitlist();
        break;
      case 'leave_waitlist':
        handleLeaveWaitlist();
        break;
      default:
        break;
    }
  };

  // Handle registration
  const handleRegister = async () => {
    try {
      await onRegister?.(event.id, user?.id);
      setShowConfirmModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  // Handle unregistration
  const handleUnregister = async () => {
    try {
      await onUnregister?.(event.id, user?.id);
    } catch (error) {
      console.error('Unregistration failed:', error);
    }
  };

  // Handle waitlist actions
  const handleJoinWaitlist = async () => {
    try {
      await onJoinWaitlist?.(event.id, user?.id);
    } catch (error) {
      console.error('Join waitlist failed:', error);
    }
  };

  const handleLeaveWaitlist = async () => {
    try {
      await onLeaveWaitlist?.(event.id, user?.id);
    } catch (error) {
      console.error('Leave waitlist failed:', error);
    }
  };

  // Get spots remaining
  const spotsRemaining = event.capacity ? event.capacity - (event.registeredCount || 0) : null;
  const isAlmostFull = spotsRemaining !== null && spotsRemaining <= 5 && spotsRemaining > 0;

  return (
    <>
      <div ref={ref} className={`relative ${className}`}>
        {/* Urgency Indicators */}
        <div className="flex items-center space-x-2 mb-2">
          {timeLeft && !isDeadlinePassed && (
            <Badge variant="outline" color="warning" size="xs">
              <span className="material-symbols-outlined text-xs mr-1">schedule</span>
              {timeLeft}
            </Badge>
          )}

          {isAlmostFull && (
            <Badge variant="filled" color="danger" size="xs">
              Only {spotsRemaining} spots left!
            </Badge>
          )}

          {isOnWaitlist && (
            <Badge variant="outline" color="secondary" size="xs">
              On Waitlist
            </Badge>
          )}
        </div>

        {/* Main Button */}
        <motion.div
          whileHover={!buttonState.disabled ? { scale: 1.02 } : {}}
          whileTap={!buttonState.disabled ? { scale: 0.98 } : {}}
        >
          <Button
            variant={buttonState.variant}
            size={size}
            onClick={handleClick}
            disabled={buttonState.disabled || isLoading}
            className="w-full relative"
            {...props}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Spinner size="sm" />
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="material-symbols-outlined text-sm">
                  {buttonState.icon}
                </span>
                <span>{buttonState.text}</span>
              </div>
            )}
          </Button>
        </motion.div>

        {/* Capacity Progress Bar */}
        {event.capacity && (
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Registration Progress</span>
              <span>{event.registeredCount || 0} / {event.capacity}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className={`h-2 rounded-full ${
                  isAlmostFull ? 'bg-red-500' :
                  (event.registeredCount || 0) >= event.capacity ? 'bg-gray-400' : 'bg-green-500'
                }`}
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.min(((event.registeredCount || 0) / event.capacity) * 100, 100)}%`
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="mt-2 text-xs text-gray-500 text-center">
          {spotsRemaining === 0 && !isOnWaitlist && 'Event is full - join waitlist'}
          {spotsRemaining !== null && spotsRemaining > 0 && `Spots remaining: ${spotsRemaining}`}
          {isDeadlinePassed && 'Registration period has ended'}
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Registration"
        size="sm"
      >
        <div className="text-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-blue-600 text-xl">event_available</span>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Register for {event.title}
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p><strong>Date:</strong> {new Date(event.startDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(event.startDate).toLocaleTimeString()}</p>
              {event.location && <p><strong>Location:</strong> {event.location}</p>}
              {event.price !== undefined && (
                <p><strong>Cost:</strong> {event.price === 0 ? 'Free' : `$${event.price}`}</p>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              By registering, you'll receive event updates and reminders.
              You can unregister anytime before the event starts.
            </p>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRegister}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? 'Registering...' : 'Confirm Registration'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <Modal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            title="Registration Successful!"
            size="sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center space-y-4"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <span className="material-symbols-outlined text-green-600 text-xl">check_circle</span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-green-900 mb-2">
                  You're registered!
                </h3>
                <p className="text-sm text-gray-600">
                  You'll receive a confirmation email with event details.
                  Add this event to your calendar to stay updated.
                </p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center justify-center space-x-2 text-sm text-green-800">
                  <span className="material-symbols-outlined">calendar_add_on</span>
                  <span>Event added to your dashboard</span>
                </div>
              </div>

              <Button
                onClick={() => setShowSuccessModal(false)}
                className="w-full"
              >
                Continue
              </Button>
            </motion.div>
          </Modal>
        )}
      </AnimatePresence>
    </>
  );
});

RegisterButton.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string,
    location: PropTypes.string,
    capacity: PropTypes.number,
    registeredCount: PropTypes.number,
    price: PropTypes.number
  }).isRequired,
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string
  }),
  onRegister: PropTypes.func,
  onUnregister: PropTypes.func,
  onJoinWaitlist: PropTypes.func,
  onLeaveWaitlist: PropTypes.func,
  isRegistered: PropTypes.bool,
  isOnWaitlist: PropTypes.bool,
  isLoading: PropTypes.bool,
  registrationDeadline: PropTypes.string,
  className: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

RegisterButton.displayName = 'RegisterButton';

export default RegisterButton;