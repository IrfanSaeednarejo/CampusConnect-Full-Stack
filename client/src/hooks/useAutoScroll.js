import { useRef, useEffect } from 'react';

/**
 * Custom hook to auto-scroll an element to the bottom when content changes
 * 
 * @param {*} dependency - Trigger scroll when this value changes (e.g., messages array)
 * @param {Object} options - Scroll behavior options
 * @param {string} options.behavior - Scroll behavior: 'auto' | 'smooth' (default: 'smooth')
 * @param {boolean} options.enabled - Enable/disable auto-scroll (default: true)
 * @returns {React.RefObject} Ref to attach to the scrollable element
 * 
 * @example
 * const scrollRef = useAutoScroll(messages);
 * 
 * return (
 *   <div ref={scrollRef} className="overflow-y-auto">
 *     {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
 *   </div>
 * );
 */
export const useAutoScroll = (dependency, options = {}) => {
  const { behavior = 'smooth', enabled = true } = options;
  const ref = useRef(null);

  useEffect(() => {
    if (enabled && ref.current) {
      ref.current.scrollTop = ref.current.scrollHeight;
    }
  }, [dependency, behavior, enabled]);

  return ref;
};
