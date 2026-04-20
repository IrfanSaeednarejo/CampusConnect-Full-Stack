import { useRef, useEffect } from 'react';

/**
 * useAutoScroll Hook
 * Smarter scrolling for chat windows
 * Only scrolls to bottom if user was already near the bottom
 * Prevents jarring scroll shifts when loading history
 */
export const useAutoScroll = (dependency, options = {}) => {
  const { behavior = 'smooth', threshold = 150 } = options;
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const isAtBottom = el.scrollHeight - el.scrollTop <= el.clientHeight + threshold;

      // Auto scroll if we are already at the bottom or if it's the first render
      if (isAtBottom) {
        el.scrollTo({
          top: el.scrollHeight,
          behavior: behavior
        });
      }
    }
  }, [dependency, behavior, threshold]);

  return scrollRef;
};
