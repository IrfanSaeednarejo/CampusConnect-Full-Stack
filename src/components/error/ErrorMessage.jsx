import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Error Message Component - Displays error messages with actions
 * Includes retry, dismiss, and detailed error information
 */
const ErrorMessage = React.forwardRef(({
  error,
  onRetry,
  onDismiss,
  onReport,
  showDetails = false,
  variant = 'default',
  className = '',
  ...props
}, ref) => {
  const [showFullDetails, setShowFullDetails] = useState(false);

  // Get error icon based on type
  const getErrorIcon = (type) => {
    switch (type) {
      case 'network':
        return 'wifi_off';
      case 'validation':
        return 'error_outline';
      case 'permission':
        return 'lock';
      case 'not_found':
        return 'search_off';
      case 'server':
        return 'dns';
      default:
        return 'error';
    }
  };

  // Get error color based on type
  const getErrorColor = (type) => {
    switch (type) {
      case 'network':
        return 'warning';
      case 'validation':
        return 'warning';
      case 'permission':
        return 'danger';
      case 'not_found':
        return 'info';
      case 'server':
        return 'danger';
      default:
        return 'danger';
    }
  };

  const errorType = error?.type || 'general';
  const icon = getErrorIcon(errorType);
  const color = getErrorColor(errorType);

  // Render inline variant
  if (variant === 'inline') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`flex items-center space-x-3 p-3 bg-red-50 border border-red-200 rounded-lg ${className}`}
        {...props}
      >
        <span className="material-symbols-outlined text-red-600 flex-shrink-0">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-red-900">
            {error?.message || 'An error occurred'}
          </p>
          {error?.details && showDetails && (
            <p className="text-xs text-red-700 mt-1">{error.details}</p>
          )}
        </div>
        {onDismiss && (
          <IconButton
            icon="close"
            size="sm"
            className="text-red-600"
            onClick={onDismiss}
          />
        )}
      </motion.div>
    );
  }

  // Render banner variant
  if (variant === 'banner') {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`}
        {...props}
      >
        <div className="flex items-start">
          <span className="material-symbols-outlined text-red-600 mr-3 flex-shrink-0">
            {icon}
          </span>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-red-900">
              {error?.title || 'Error'}
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error?.message || 'An error occurred'}
            </p>
            {error?.details && showFullDetails && (
              <p className="text-xs text-red-600 mt-2 font-mono">
                {error.details}
              </p>
            )}
            {error?.details && !showFullDetails && (
              <button
                onClick={() => setShowFullDetails(true)}
                className="text-xs text-red-600 mt-2 hover:underline"
              >
                Show details
              </button>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {onRetry && (
              <Button
                variant="outline"
                size="sm"
                onClick={onRetry}
                className="text-red-700 border-red-300 hover:bg-red-100"
              >
                Retry
              </Button>
            )}
            {onDismiss && (
              <IconButton
                icon="close"
                size="sm"
                className="text-red-600"
                onClick={onDismiss}
              />
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Render default (card) variant
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white border border-red-200 rounded-lg shadow-sm p-6 ${className}`}
      {...props}
    >
      <div className="text-center">
        {/* Icon */}
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-red-600 text-3xl">
            {icon}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {error?.title || 'Something went wrong'}
        </h3>

        {/* Message */}
        <p className="text-gray-600 mb-4">
          {error?.message || 'An unexpected error occurred. Please try again.'}
        </p>

        {/* Details */}
        {error?.details && showFullDetails && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-mono text-gray-700 break-all">
              {error.details}
            </p>
          </div>
        )}

        {error?.details && !showFullDetails && (
          <button
            onClick={() => setShowFullDetails(true)}
            className="text-sm text-blue-600 hover:text-blue-700 mb-4"
          >
            Show error details
          </button>
        )}

        {/* Error Code */}
        {error?.code && (
          <div className="mb-4">
            <Badge variant="outline" color="danger" size="sm">
              Error Code: {error.code}
            </Badge>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-center space-x-3">
          {onRetry && (
            <Button
              variant="primary"
              onClick={onRetry}
            >
              <span className="material-symbols-outlined text-sm mr-1">refresh</span>
              Try Again
            </Button>
          )}
          {onReport && (
            <Button
              variant="outline"
              onClick={onReport}
            >
              <span className="material-symbols-outlined text-sm mr-1">bug_report</span>
              Report Issue
            </Button>
          )}
          {onDismiss && (
            <Button
              variant="ghost"
              onClick={onDismiss}
            >
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

ErrorMessage.propTypes = {
  error: PropTypes.shape({
    type: PropTypes.oneOf(['network', 'validation', 'permission', 'not_found', 'server', 'general']),
    title: PropTypes.string,
    message: PropTypes.string.isRequired,
    details: PropTypes.string,
    code: PropTypes.string
  }).isRequired,
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  onReport: PropTypes.func,
  showDetails: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'inline', 'banner']),
  className: PropTypes.string
};

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;