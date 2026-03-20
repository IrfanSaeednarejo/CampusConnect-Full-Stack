// Custom hook for loading mock data into Redux
// Eliminates repeated useEffect patterns across pages

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

/**
 * Generic hook to load mock data into Redux state
 * Only loads data once when component mounts and data is empty
 * 
 * @param {function} selector - Redux selector to check if data exists
 * @param {function} action - Redux action to dispatch
 * @param {any} mockData - Mock data to load
 * @param {array} dependencies - Additional dependencies for useEffect
 * 
 * @example
 * // Instead of:
 * useEffect(() => {
 *   if (tasks.length === 0) {
 *     dispatch(setTasks(mockTasks));
 *   }
 * }, [dispatch, tasks.length]);
 * 
 * // Use:
 * const tasks = useMockData(selectAllTasks, setTasks, mockTasks);
 */
export function useMockData(selector, action, mockData, dependencies = []) {
  const dispatch = useDispatch();
  const data = useSelector(selector);
  const hasData = Array.isArray(data) ? data.length > 0 : !!data;

  useEffect(() => {
    // Only initialize if no data exists
    if (!hasData) {
      dispatch(action(mockData));
    }
    // Only run once on mount and when hasData changes
  }, [dispatch, hasData, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return data;
}

/**
 * Hook for initializing multiple mock data sources at once
 * Prevents redundant useEffect patterns in components
 * 
 * @param {array} dataConfigs - Array of {selector, action, mockData, condition}
 * 
 * @example
 * const configs = [
 *   { 
 *     selector: selectTasks, 
 *     action: setTasks, 
 *     mockData: mockTasksData 
 *   },
 *   { 
 *     selector: selectEvents, 
 *     action: setEvents, 
 *     mockData: mockEventsData 
 *   }
 * ];
 * useMultipleMockData(configs);
 */
export function useMultipleMockData(dataConfigs) {
  const dispatch = useDispatch();

  useEffect(() => {
    dataConfigs.forEach(({ selector, action, mockData, condition = true }) => {
      // Skip if condition is false
      if (!condition) return;
      
      // Check if we have a selector and should load data
      // This assumes your Redux store is initialized by this point
      if (action && mockData) {
        dispatch(action(mockData));
      }
    });
    
    // Only run once on component mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch]);
}

export default useMockData;

