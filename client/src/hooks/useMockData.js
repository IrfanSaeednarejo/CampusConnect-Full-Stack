import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export function useMockData(selector, action, mockData, dependencies = []) {
  const dispatch = useDispatch();
  const data = useSelector(selector);
  const hasData = Array.isArray(data) ? data.length > 0 : !!data;

  useEffect(() => {
    if (!hasData) {
      dispatch(action(mockData));
    }
  }, [dispatch, hasData, action, mockData, ...dependencies]);

  return data;
}
export function useMultipleMockData(dataConfigs) {
  const dispatch = useDispatch();

  useEffect(() => {
    dataConfigs.forEach(({ selector, action, mockData, condition = true }) => {
      if (!condition) return;

      if (action && mockData) {
        dispatch(action(mockData));
      }
    });

  }, [dispatch]);
}

export default useMockData;

