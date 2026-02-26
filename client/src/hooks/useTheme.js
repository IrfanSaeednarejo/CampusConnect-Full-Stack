import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage theme (light/dark mode)
 * Persists theme preference in localStorage
 * 
 * @param {string} initialTheme - Initial theme: 'light' | 'dark' | 'system' (default: 'system')
 * @returns {Object} Theme state and control functions
 * 
 * @example
 * const { theme, toggleTheme, setTheme, isDark } = useTheme();
 * 
 * return (
 *   <div className={isDark ? 'dark' : 'light'}>
 *     <button onClick={toggleTheme}>Toggle Theme</button>
 *     <p>Current theme: {theme}</p>
 *   </div>
 * );
 */
export const useTheme = (initialTheme = 'system') => {
  const [theme, setThemeState] = useState(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) return savedTheme;
    }
    return initialTheme;
  });

  const [systemTheme, setSystemThemeState] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemThemeState(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Determine effective theme
  const effectiveTheme = theme === 'system' ? systemTheme : theme;
  const isDark = effectiveTheme === 'dark';

  // Apply theme to document
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const setTheme = useCallback((newTheme) => {
    setThemeState(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  }, [effectiveTheme, setTheme]);

  const setLightTheme = useCallback(() => {
    setTheme('light');
  }, [setTheme]);

  const setDarkTheme = useCallback(() => {
    setTheme('dark');
  }, [setTheme]);

  const setSystemTheme = useCallback(() => {
    setTheme('system');
  }, [setTheme]);

  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
    setLightTheme,
    setDarkTheme,
    setSystemTheme,
    isDark,
    isLight: !isDark,
    isSystem: theme === 'system'
  };
};
