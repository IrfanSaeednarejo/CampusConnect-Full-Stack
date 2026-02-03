import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../common/Button';
import IconButton from '../common/IconButton';
import Badge from '../common/Badge';

/**
 * Advanced Help Search Box Component - AI-powered help search with suggestions
 * Includes search history, popular topics, and quick actions
 */
const HelpSearchBox = React.forwardRef(({
  onSearch,
  onSuggestionClick,
  suggestions = [],
  popularTopics = [],
  recentSearches = [],
  isLoading = false,
  placeholder = 'Search for help...',
  className = '',
  ...props
}, ref) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Filter suggestions based on query
  useEffect(() => {
    if (query.trim()) {
      const filtered = suggestions.filter(suggestion =>
        suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.description?.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setFilteredSuggestions([]);
      setShowSuggestions(isFocused);
    }
  }, [query, suggestions, isFocused]);

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle key down
  const handleKeyDown = (e) => {
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredSuggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSuggestionClick(filteredSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  // Handle search
  const handleSearch = () => {
    if (query.trim()) {
      onSearch?.(query.trim());
      setShowSuggestions(false);
      setIsFocused(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    onSuggestionClick?.(suggestion);
    setQuery(suggestion.title);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  // Handle popular topic click
  const handlePopularTopicClick = (topic) => {
    setQuery(topic);
    onSearch?.(topic);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  // Handle recent search click
  const handleRecentSearchClick = (search) => {
    setQuery(search);
    onSearch?.(search);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  return (
    <div ref={ref} className={`relative ${className}`} {...props}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <span className="material-symbols-outlined text-gray-400">
            {isLoading ? 'hourglass_empty' : 'search'}
          </span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            // Delay to allow click events
            setTimeout(() => {
              setIsFocused(false);
              setShowSuggestions(false);
            }, 200);
          }}
          placeholder={placeholder}
          className="w-full pl-12 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
            className="absolute right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        )}

        {/* Search Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="absolute right-2 top-1/2 transform -translate-y-1/2"
        >
          {isLoading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto"
          >
            {/* Filtered Suggestions */}
            {filteredSuggestions.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                  Suggestions
                </div>
                {filteredSuggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 rounded-lg flex items-start space-x-3 ${
                      index === selectedIndex ? 'bg-blue-50' : ''
                    }`}
                  >
                    <span className="material-symbols-outlined text-gray-400 text-sm mt-0.5">
                      {suggestion.icon || 'help'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">
                        {suggestion.title}
                      </div>
                      {suggestion.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {suggestion.description}
                        </div>
                      )}
                      {suggestion.category && (
                        <Badge variant="outline" size="xs" color="info" className="mt-1">
                          {suggestion.category}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Recent Searches */}
            {!query.trim() && recentSearches.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                  Recent Searches
                </div>
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleRecentSearchClick(search)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-100 rounded-lg flex items-center space-x-2"
                  >
                    <span className="material-symbols-outlined text-gray-400 text-sm">
                      history
                    </span>
                    <span className="text-sm text-gray-700">{search}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Popular Topics */}
            {!query.trim() && popularTopics.length > 0 && (
              <div className="p-2 border-t border-gray-100">
                <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                  Popular Topics
                </div>
                <div className="flex flex-wrap gap-2 px-3 py-2">
                  {popularTopics.map((topic, index) => (
                    <button
                      key={index}
                      onClick={() => handlePopularTopicClick(topic)}
                      className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No Results */}
            {query.trim() && filteredSuggestions.length === 0 && (
              <div className="p-8 text-center">
                <span className="material-symbols-outlined text-gray-400 text-4xl mb-2">
                  search_off
                </span>
                <p className="text-gray-600">No suggestions found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try searching for something else
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

HelpSearchBox.propTypes = {
  onSearch: PropTypes.func.isRequired,
  onSuggestionClick: PropTypes.func,
  suggestions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.string,
      category: PropTypes.string
    })
  ),
  popularTopics: PropTypes.arrayOf(PropTypes.string),
  recentSearches: PropTypes.arrayOf(PropTypes.string),
  isLoading: PropTypes.bool,
  placeholder: PropTypes.string,
  className: PropTypes.string
};

HelpSearchBox.displayName = 'HelpSearchBox';

export default HelpSearchBox;