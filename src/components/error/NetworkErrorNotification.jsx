import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Badge from '../common/Badge';

/**
 * Advanced Network Error Notification Component - Detects and displays network connectivity issues
 * Includes auto-retry, offline mode indicator, and connection status
 */
const NetworkErrorNotification = React.forwardRef(({
  onRetry,
  onDismiss,
  autoRetry = true,
  retryInterval = 5000,
  showOfflineMode = true,
  className = '',
  ...props
}, ref) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(!navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowNotification(false);
      setRetryCount(0);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-retry functionality
  useEffect(() => {
    if (!isOnline && autoRetry && showNotification) {
      const interval = setInterval(() => {
        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        // Check connection
        fetch('/api/health', { method: 'HEAD', cache: 'no-cache' })
          .then(() => {
            setIsOnline(true);
            setShowNotification(false);
            setRetryCount(0);
          })
          .catch(() => {
            setIsRetrying(false);
          });
      }, retryInterval);

      return () => clearInterval(interval);
    }
  }, [isOnline, autoRetry, showNotification, retryInterval]);

  // Handle manual retry
  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);

    try {
      const response = await fetch('/api/health', { method: 'HEAD', cache: 'no-cache' });
      if (response.ok) {
        setIsOnline(true);
        setShowNotification(false);
        setRetryCount(0);
      } else {
        throw new Error('Network error');
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }

    onRetry?.();
  };

  // Handle dismiss
  const handleDismiss = () => {
    setShowNotification(false);
    onDismiss?.();
  };

  if (!showNotification) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md ${className}`}
        {...props}
      >
        <div className="bg-red-50 border-l-4 border-red-500 rounded-lg shadow-lg p-4 mx-4">
          <div className="flex items-start">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-red-600">
                  {isOnline ? 'wifi' : 'wifi_off'}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 ml-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-red-900">
                    {isOnline ? 'Connection Restored' : 'No Internet Connection'}
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    {isOnline
                      ? 'Your connection has been restored.'
                      : 'Please check your internet connection and try again.'}
                  </p>
                </div>

                {onDismiss && (
                  <IconButton
                    icon="close"
                    size="sm"
                    className="text-red-600 ml-2"
                    onClick={handleDismiss}
                  />
                )}
              </div>

              {/* Retry Info */}
              {!isOnline && (
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {autoRetry && (
                      <Badge variant="outline" color="warning" size="xs">
                        {isRetrying ? 'Retrying...' : `Auto-retry (${retryCount})`}
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="text-red-700 border-red-300 hover:bg-red-100"
                  >
                    {isRetrying ? (
                      <>
                        <span className="material-symbols-outlined text-sm mr-1 animate-spin">
                          refresh
                        </span>
                        Retrying...
                      </>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-sm mr-1">refresh</span>
                        Retry
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Offline Mode Option */}
              {showOfflineMode && !isOnline && (
                <div className="mt-3 pt-3 border-t border-red-200">
                  <p className="text-xs text-red-600">
                    Some features may be limited while offline. Your data will sync when connection is restored.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
});

NetworkErrorNotification.propTypes = {
  onRetry: PropTypes.func,
  onDismiss: PropTypes.func,
  autoRetry: PropTypes.bool,
  retryInterval: PropTypes.number,
  showOfflineMode: PropTypes.bool,
  className: PropTypes.string
};

NetworkErrorNotification.displayName = 'NetworkErrorNotification';

export default NetworkErrorNotification;