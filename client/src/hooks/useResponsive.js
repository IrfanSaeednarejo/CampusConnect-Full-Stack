import { useState, useEffect } from 'react';
export const useResponsive = (customBreakpoints = {}) => {
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

    window.addEventListener('resize', handleResize);
    handleResize();

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
    isAbove: (breakpoint) => windowSize.width >= (breakpoints[breakpoint] || breakpoint),
    isBelow: (breakpoint) => windowSize.width < (breakpoints[breakpoint] || breakpoint)
  };
};
