// Custom hook for async data fetching
// Can be used for future API integration

import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for fetching data
 * @param {function} fetchFunction - Function that returns a promise
 * @param {array} dependencies - Dependencies for refetching
 */
export function useFetch(fetchFunction, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch,
    setData
  };
}

/**
 * Hook for lazy fetching (manual trigger)
 */
export function useLazyFetch(fetchFunction) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'An error occurred');
      console.error('Fetch error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  return {
    data,
    loading,
    error,
    execute,
    setData
  };
}

export default useFetch;
