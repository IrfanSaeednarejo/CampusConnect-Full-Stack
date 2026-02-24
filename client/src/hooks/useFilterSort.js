// Custom hook for filtering and sorting data
// Eliminates repeated filter/sort logic across list pages

import { useState, useMemo, useCallback } from 'react';

/**
 * Custom hook for filtering and sorting data
 * @param {array} data - Data array to filter and sort
 * @param {object} options - Configuration options
 */
export function useFilterSort(data, options = {}) {
  const {
    initialFilter = 'all',
    initialSortBy = 'name',
    filterKey = 'category',
    sortKey = 'name'
  } = options;

  const [filter, setFilter] = useState(initialFilter);
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter data
  const filteredData = useMemo(() => {
    if (!data) return [];
    
    let result = [...data];

    // Apply category/type filter
    if (filter && filter !== 'all') {
      result = result.filter(item => {
        const itemFilterValue = typeof filterKey === 'function' 
          ? filterKey(item) 
          : item[filterKey];
        return itemFilterValue === filter;
      });
    }

    // Apply search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      result = result.filter(item => {
        return Object.values(item).some(value => 
          String(value).toLowerCase().includes(lowerSearch)
        );
      });
    }

    return result;
  }, [data, filter, filterKey, searchTerm]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!filteredData) return [];
    
    const result = [...filteredData];

    switch (sortBy) {
      case 'name':
      case 'title':
        return result.sort((a, b) => {
          const aVal = a.name || a.title || '';
          const bVal = b.name || b.title || '';
          return aVal.localeCompare(bVal);
        });
      
      case 'date':
      case 'createdAt':
        return result.sort((a, b) => {
          const aDate = new Date(a.date || a.createdAt || 0);
          const bDate = new Date(b.date || b.createdAt || 0);
          return bDate - aDate; // Most recent first
        });
      
      case 'members':
      case 'attendees':
      case 'count':
        return result.sort((a, b) => {
          const aVal = a.members || a.attendees || a.count || 0;
          const bVal = b.members || b.attendees || b.count || 0;
          return bVal - aVal; // Highest first
        });
      
      case 'popularity':
      case 'rating':
        return result.sort((a, b) => {
          const aVal = a.popularity || a.rating || 0;
          const bVal = b.popularity || b.rating || 0;
          return bVal - aVal;
        });
      
      default:
        return result;
    }
  }, [filteredData, sortBy]);

  // Get unique filter options from data
  const filterOptions = useMemo(() => {
    if (!data) return [];
    
    const options = new Set();
    data.forEach(item => {
      const value = typeof filterKey === 'function' 
        ? filterKey(item) 
        : item[filterKey];
      if (value) options.add(value);
    });
    
    return ['all', ...Array.from(options)];
  }, [data, filterKey]);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilter(initialFilter);
    setSortBy(initialSortBy);
    setSearchTerm('');
  }, [initialFilter, initialSortBy]);

  return {
    // Filtered and sorted data
    data: sortedData,
    filteredData,
    sortedData,
    
    // Filter state
    filter,
    setFilter,
    
    // Sort state
    sortBy,
    setSortBy,
    
    // Search state
    searchTerm,
    setSearchTerm,
    
    // Helpers
    filterOptions,
    resetFilters,
    
    // Counts
    totalCount: data?.length || 0,
    filteredCount: sortedData?.length || 0
  };
}

export default useFilterSort;
