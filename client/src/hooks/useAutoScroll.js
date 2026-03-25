import { useRef, useEffect } from 'react';
export const useAutoScroll = (dependency, options = {}) => {
  const { behavior = 'smooth', enabled = true } = options;
  const ref = useRef(null);

  useEffect(() => {
    if (enabled && ref.current) {
      const element = ref.current;
      const top = element.scrollHeight;

      if (typeof element.scrollTo === 'function') {
        element.scrollTo({ top, behavior });
      } else {
        element.scrollTop = top;
      }
    }
  }, [dependency, behavior, enabled]);

  return ref;
};
