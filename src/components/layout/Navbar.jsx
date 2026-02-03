import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import IconButton from '../common/IconButton';

/**
 * Advanced Navbar Component with breadcrumbs, actions, and contextual navigation
 */
const Navbar = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  showBackButton = false,
  onBack,
  className = '',
  ...props
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      window.history.back();
    }
  };

  return (
    <motion.nav
      className={`sticky top-0 z-40 w-full border-b backdrop-blur-sm transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 border-gray-200 shadow-sm'
          : 'bg-white/90 border-gray-100'
      } ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Back Button */}
            {showBackButton && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <IconButton
                  icon="arrow_back"
                  size="sm"
                  onClick={handleBack}
                  className="text-gray-600 hover:text-gray-900"
                />
              </motion.div>
            )}

            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <div className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <span className="text-gray-400">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                      </span>
                    )}
                    {crumb.href ? (
                      <Link
                        to={crumb.href}
                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-sm text-gray-900 font-medium">
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Title and Subtitle */}
            <div className="flex flex-col">
              <AnimatePresence>
                {title && (
                  <motion.h1
                    className="text-lg font-semibold text-gray-900"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    {title}
                  </motion.h1>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {subtitle && (
                  <motion.p
                    className="text-sm text-gray-500"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: 0.1 }}
                  >
                    {subtitle}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Section - Actions */}
          <div className="flex items-center space-x-2">
            <AnimatePresence>
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {action.type === 'button' ? (
                    <Button
                      {...action}
                      size="sm"
                      className="hidden sm:flex"
                    />
                  ) : action.type === 'icon' ? (
                    <IconButton
                      {...action}
                      size="sm"
                    />
                  ) : (
                    <div>{action.content}</div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Progress Bar for Loading States */}
      {actions.some(action => action.loading) && (
        <motion.div
          className="h-0.5 bg-blue-600"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        />
      )}
    </motion.nav>
  );
};

// Breadcrumb Helper Component
Navbar.Breadcrumb = ({ items, className = '' }) => (
  <nav className={`flex ${className}`} aria-label="Breadcrumb">
    <ol className="flex items-center space-x-2">
      {items.map((item, index) => (
        <li key={index} className="flex items-center">
          {index > 0 && (
            <span className="text-gray-400 mx-2">
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </span>
          )}
          {item.href ? (
            <Link
              to={item.href}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-sm text-gray-900 font-medium">{item.label}</span>
          )}
        </li>
      ))}
    </ol>
  </nav>
);

Navbar.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['button', 'icon', 'custom']),
      content: PropTypes.node,
      // Button props
      variant: PropTypes.string,
      onClick: PropTypes.func,
      children: PropTypes.node,
      loading: PropTypes.bool,
      // Icon props
      icon: PropTypes.string,
      onClick: PropTypes.func
    })
  ),
  showBackButton: PropTypes.bool,
  onBack: PropTypes.func,
  className: PropTypes.string
};

export default Navbar;