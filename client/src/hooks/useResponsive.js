import { useState, useEffect } from 'react';

/**
 * Custom hook to detect responsive breakpoints
 * 
 * @param {Object} breakpoints - Custom breakpoints (optional)
 * @returns {Object} Responsive state with boolean flags for each breakpoint
 * 
 * @example
 * const { isMobile, isTablet, isDesktop, width } = useResponsive();
 * 
 * return (
 *   <div>
 *     {isMobile && <MobileNav />}
 *     {isDesktop && <DesktopNav />}
 *     <p>Current width: {width}px</p>
 *   </div>
 * );
 */
export const useResponsive = (customBreakpoints = {}) => {
  // Default Tailwind breakpoints
  const defaultBreakpoints = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536
  };

  const breakpoints = { ...defaultBreakpoints, ...customBreakpoints };

  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Call handler right away so state gets updated with initial window size
    handleResize();

    // Remove event listener on cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    width: windowSize.width,
    height: windowSize.height,
    isMobile: windowSize.width < breakpoints.md,
    isTablet: windowSize.width >= breakpoints.md && windowSize.width < breakpoints.lg,
    isDesktop: windowSize.width >= breakpoints.lg,
    isSmallMobile: windowSize.width < breakpoints.sm,
    isLargeDesktop: windowSize.width >= breakpoints.xl,
    is2XL: windowSize.width >= breakpoints['2xl'],
    // Custom breakpoint checks
    isAbove: (breakpoint) => windowSize.width >= (breakpoints[breakpoint] || breakpoint),
    isBelow: (breakpoint) => windowSize.width < (breakpoints[breakpoint] || breakpoint)
  };
};
