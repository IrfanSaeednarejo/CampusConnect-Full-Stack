import { useRef, useEffect } from 'react';
export const useChatScroll = (messages, options = {}) => {
  const { behavior = 'smooth', scrollOnMount = true } = options;
  const scrollRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (scrollRef.current) {
      if (isFirstRender.current && !scrollOnMount) {
        isFirstRender.current = false;
        return;
      }

      scrollRef.current.scrollIntoView({
        behavior: behavior,
        block: 'end'
      });

      isFirstRender.current = false;
    }
  }, [messages, behavior, scrollOnMount]);

  return scrollRef;
};
