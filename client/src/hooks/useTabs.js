import { useState, useCallback, useMemo } from 'react';

export function useTabs(tabs = [], defaultTab) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]);
  const goToTab = useCallback((tabId) => {
    if (tabs.includes(tabId)) {
      setActiveTab(tabId);
    }
  }, [tabs]);

  const nextTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    const nextIndex = (currentIndex + 1) % tabs.length;
    setActiveTab(tabs[nextIndex]);
  }, [tabs, activeTab]);

  const previousTab = useCallback(() => {
    const currentIndex = tabs.indexOf(activeTab);
    const previousIndex = currentIndex === 0 ? tabs.length - 1 : currentIndex - 1;
    setActiveTab(tabs[previousIndex]);
  }, [tabs, activeTab]);

  const isActive = useCallback((tabId) => {
    return activeTab === tabId;
  }, [activeTab]);
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
