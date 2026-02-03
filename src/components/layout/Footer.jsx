import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Button from '../common/Button';

/**
 * Advanced Footer Component with multiple sections and responsive design
 */
const Footer = ({ className = '', ...props }) => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Platform',
      links: [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Events', href: '/events' },
        { label: 'Mentoring', href: '/mentoring' },
        { label: 'Societies', href: '/societies' },
        { label: 'Study Groups', href: '/study-groups' }
      ]
    },
    {
      title: 'Community',
      links: [
        { label: 'Chat', href: '/chat' },
        { label: 'Forums', href: '/forums' },
        { label: 'Help Center', href: '/help' },
        { label: 'Contact Us', href: '/contact' },
        { label: 'Feedback', href: '/feedback' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'API', href: '/api' },
        { label: 'Blog', href: '/blog' },
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' }
      ]
    },
    {
      title: 'Company',
      links: [
        { label: 'About Us', href: '/about' },
        { label: 'Careers', href: '/careers' },
        { label: 'Press', href: '/press' },
        { label: 'Partners', href: '/partners' },
        { label: 'Investors', href: '/investors' }
      ]
    }
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'facebook', href: '#' },
    { name: 'Twitter', icon: 'twitter', href: '#' },
    { name: 'LinkedIn', icon: 'linkedin', href: '#' },
    { name: 'Instagram', icon: 'instagram', href: '#' },
    { name: 'YouTube', icon: 'youtube', href: '#' }
  ];

  return (
    <footer className={`bg-gray-900 text-white ${className}`} {...props}>
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <motion.div
              className="flex items-center space-x-3 mb-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-xl font-bold">CampusConnect</span>
            </motion.div>

            <p className="text-gray-400 mb-6 max-w-md">
              Empowering campus communities with intelligent tools for events, mentoring,
              collaboration, and growth. Connect, learn, and thrive together.
            </p>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-white">Stay Updated</h3>
              <div className="flex space-x-2">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="primary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className="text-sm font-semibold text-white mb-4">
                {section.title}
              </h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Social Links and Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">Follow us:</span>
              <div className="flex space-x-3">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className="w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center text-gray-400 hover:bg-blue-600 hover:text-white transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={social.name}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {social.icon === 'facebook' ? 'facebook' :
                       social.icon === 'twitter' ? 'twitter' :
                       social.icon === 'linkedin' ? 'linkedin' :
                       social.icon === 'instagram' ? 'instagram' : 'youtube'}
                    </span>
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Copyright and Legal */}
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
              <span>© {currentYear} CampusConnect. All rights reserved.</span>
              <div className="flex space-x-4">
                <Link to="/privacy" className="hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="hover:text-white transition-colors">
                  Terms
                </Link>
                <Link to="/cookies" className="hover:text-white transition-colors">
                  Cookies
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors z-10"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <span className="material-symbols-outlined">keyboard_arrow_up</span>
      </motion.button>
    </footer>
  );
};

Footer.propTypes = {
  className: PropTypes.string
};

export default Footer;