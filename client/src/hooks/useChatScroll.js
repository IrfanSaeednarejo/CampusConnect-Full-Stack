import { useRef, useEffect } from 'react';

/**
 * Custom hook to scroll to the latest message in a chat interface
 * Automatically scrolls to bottom when new messages arrive
 * 
 * @param {Array} messages - Array of messages
 * @param {Object} options - Scroll options
 * @param {string} options.behavior - Scroll behavior: 'auto' | 'smooth' (default: 'smooth')
 * @param {boolean} options.scrollOnMount - Scroll on initial mount (default: true)
 * @returns {React.RefObject} Ref to attach to the last message element
 * 
 * @example
 * const scrollRef = useChatScroll(messages);
 * 
 * return (
 *   <div className="chat-container">
 *     {messages.map((msg, index) => (
 *       <div 
 *         key={msg.id} 
 *         ref={index === messages.length - 1 ? scrollRef : null}
 *       >
 *         {msg.text}
 *       </div>
 *     ))}
 *   </div>
 * );
 */
export const useChatScroll = (messages, options = {}) => {
  const { behavior = 'smooth', scrollOnMount = true } = options;
  const scrollRef = useRef(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (scrollRef.current) {
      // Skip scroll on mount if disabled
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
