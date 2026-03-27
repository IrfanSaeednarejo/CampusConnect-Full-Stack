import React, { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks';

/**
 * Example component demonstrating useDebounce hook usage
 * 
 * This component shows how to use useDebounce to delay API calls
 * until the user has stopped typing for 500ms
 */
const ExampleComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounce the search term - only updates 500ms after user stops typing
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Effect runs only when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      setIsSearching(true);
      
      // Simulate API call
      // In real app, replace with: fetch(`/api/search?q=${debouncedSearchTerm}`)
      setTimeout(() => {
        const mockResults = [
          `Result for "${debouncedSearchTerm}" - Item 1`,
          `Result for "${debouncedSearchTerm}" - Item 2`,
          `Result for "${debouncedSearchTerm}" - Item 3`,
        ];
        setSearchResults(mockResults);
        setIsSearching(false);
      }, 300);
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Search Example</h2>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Type to search..."
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      <div className="mt-2 text-sm text-gray-500">
        <p>Current input: {searchTerm}</p>
        <p>Debounced value: {debouncedSearchTerm}</p>
      </div>

      {isSearching && (
        <div className="mt-4 text-gray-600">Searching...</div>
      )}

      {searchResults.length > 0 && (
        <ul className="mt-4 space-y-2">
          {searchResults.map((result, index) => (
            <li 
              key={index}
              className="p-3 bg-gray-50 rounded border border-gray-200"
            >
              {result}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExampleComponent;
