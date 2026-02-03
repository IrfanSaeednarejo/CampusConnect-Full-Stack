import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Badge from '../common/Badge';

/**
 * Advanced Header Component with responsive navigation, search, and user menu
 */
const Header = ({
  user,
  onLogout,
  notifications = [],
  unreadCount = 0,
  className = '',
  ...props
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    { label: 'Dashboard', path: '/dashboard', icon: 'dashboard' },
    { label: 'Events', path: '/events', icon: 'event' },
    { label: 'Mentors', path: '/mentors', icon: 'person_search' },
    { label: 'Societies', path: '/societies', icon: 'groups' },
    { label: 'Chat', path: '/chat', icon: 'chat' },
    // Use existing contact/help route instead of non-existent /help
    { label: 'Help', path: '/contact', icon: 'help' }
  ];

  const isActive = (path) => location.pathname === path;

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleNotificationClick = () => {
    navigate('/notifications');
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <motion.header
      className={`sticky top-0 z-50 w-full border-b backdrop-blur-sm transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 border-gray-200 shadow-sm'
          : 'bg-white/90 border-transparent'
      } ${className}`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:block">
                CampusConnect
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <motion.div
                key={item.path}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to={item.path}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <div className="relative">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.form
                    onSubmit={handleSearch}
                    className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-2"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <div className="flex">
                      <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm border-0 focus:outline-none focus:ring-0"
                        autoFocus
                      />
                      <IconButton
                        icon="search"
                        size="sm"
                        onClick={handleSearch}
                        className="text-gray-400 hover:text-gray-600"
                      />
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>

              <IconButton
                icon="search"
                size="sm"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="text-gray-600 hover:text-gray-900 hidden sm:flex"
              />
            </div>

            {/* Notifications */}
            <div className="relative">
              <IconButton
                icon="notifications"
                size="sm"
                onClick={handleNotificationClick}
                className="text-gray-600 hover:text-gray-900 relative"
              >
                {unreadCount > 0 && (
                  <Badge.Notification
                    count={unreadCount}
                    className="absolute -top-1 -right-1"
                  />
                )}
              </IconButton>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <Avatar
                    src={user.avatar}
                    name={user.name}
                    size="sm"
                    status={user.status}
                  />
                  <span className="hidden lg:block text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>
                  Sign In
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/register')}>
                  Sign Up
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            <IconButton
              icon={isMobileMenuOpen ? 'close' : 'menu'}
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-gray-600 hover:text-gray-900"
            />
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              className="md:hidden border-t border-gray-200 bg-white"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <nav className="py-4 space-y-1">
                {navigationItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`block px-4 py-2 text-base font-medium ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <span className="flex items-center space-x-3">
                      <span className="material-symbols-outlined">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                  </Link>
                ))}

                {!user && (
                  <div className="px-4 pt-4 space-y-2 border-t border-gray-200 mt-4">
                    <Button variant="ghost" size="sm" fullWidth onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                    <Button variant="primary" size="sm" fullWidth onClick={() => navigate('/register')}>
                      Sign Up
                    </Button>
                  </div>
                )}

                {user && (
                  <div className="px-4 pt-4 border-t border-gray-200 mt-4">
                    <Button variant="ghost" size="sm" fullWidth onClick={onLogout}>
                      Sign Out
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

Header.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.oneOf(['online', 'offline', 'away', 'busy'])
  }),
  onLogout: PropTypes.func,
  notifications: PropTypes.array,
  unreadCount: PropTypes.number,
  className: PropTypes.string
};

export default Header;