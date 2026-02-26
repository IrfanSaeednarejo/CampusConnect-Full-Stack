// Custom hook for tab navigation
// Eliminates repeated tab state management

import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing tab state
 * @param {array} tabs - Array of tab identifiers
 * @param {string} defaultTab - Default active tab
 */
export function useTabs(tabs = [], defaultTab) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]);

  // Navigate to specific tab
  const goToTab = useCallback((tabId) => {
    if (tabs.includes(tabId)) {
      setActiveTab(tabId);
    }
  }, [tabs]);

  // Navigate to next tab
  const nextTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  }, [tabs, activeTab]);

  // Navigate to previous tab
  const previousTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    const previousIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTab(tabs[previousIndex]);
  }, [tabs, activeTab]);

  // Check if tab is active
  const isActive = useCallback((tabId) => {
    return activeTab === tabId;
  }, [activeTab]);

  // Get current tab index
  const currentIndex = useMemo(() => {
    return tabs.indexOf(activeTab);
  }, [tabs, activeTab]);

  return {
    activeTab,
    setActiveTab,
    goToTab,
    nextTab,
    previousTab,
    isActive,
    currentIndex,
    isFirstTab: currentIndex === 0,
    isLastTab: currentIndex === tabs.length - 1
  };
}

export default useTabs;
