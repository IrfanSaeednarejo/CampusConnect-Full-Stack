import React, { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Advanced Tabs Component with animations, keyboard navigation, and accessibility
 * Supports vertical/horizontal layout, custom content, and state management
 */
const Tabs = ({
  tabs = [],
  defaultActiveTab,
  activeTab,
  onTabChange,
  variant = "default",
  size = "md",
  orientation = "horizontal",
  fullWidth = false,
  className = "",
  tabClassName = "",
  contentClassName = "",
  ...props
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(
    defaultActiveTab || tabs[0]?.id,
  );
  const [focusedTab, setFocusedTab] = useState(null);
  const tabRefs = useRef({});
  const isControlled = activeTab !== undefined;
  const currentActiveTab = isControlled ? activeTab : internalActiveTab;

  // Update internal state when controlled prop changes
  useEffect(() => {
    if (isControlled && activeTab !== internalActiveTab) {
      setInternalActiveTab(activeTab);
    }
  }, [activeTab, internalActiveTab, isControlled]);

  // Handle tab change
  const handleTabChange = (tabId) => {
    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  // Keyboard navigation
  const handleKeyDown = (event, tabId) => {
    const currentIndex = tabs.findIndex((tab) => tab.id === tabId);
    let nextIndex;

    switch (event.key) {
      case "ArrowLeft":
        if (orientation === "horizontal") {
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        }
        break;
      case "ArrowRight":
        if (orientation === "horizontal") {
          event.preventDefault();
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      case "ArrowUp":
        if (orientation === "vertical") {
          event.preventDefault();
          nextIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        }
        break;
      case "ArrowDown":
        if (orientation === "vertical") {
          event.preventDefault();
          nextIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        }
        break;
      case "Home":
        event.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        event.preventDefault();
        nextIndex = tabs.length - 1;
        break;
      case "Enter":
      case " ":
        event.preventDefault();
        handleTabChange(tabId);
        return;
      default:
        return;
    }

    if (nextIndex !== undefined) {
      const nextTab = tabs[nextIndex];
      setFocusedTab(nextTab.id);
      tabRefs.current[nextTab.id]?.focus();
    }
  };

  // Size variants
  const sizes = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  // Variant styles
  const variants = {
    default: {
      tabList: "bg-gray-100 p-1 rounded-lg",
      tab: "rounded-md transition-all duration-200",
      activeTab: "bg-white shadow-sm text-gray-900",
      inactiveTab: "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
    },
    underlined: {
      tabList: "border-b border-gray-200",
      tab: "border-b-2 transition-all duration-200",
      activeTab: "border-blue-500 text-blue-600",
      inactiveTab:
        "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
    },
    pills: {
      tabList: "space-x-1",
      tab: "rounded-full px-4 py-2 transition-all duration-200",
      activeTab: "bg-blue-500 text-white shadow-md",
      inactiveTab: "text-gray-600 hover:text-gray-900 hover:bg-gray-100",
    },
    minimal: {
      tabList: "space-x-6",
      tab: "border-b-2 border-transparent pb-2 transition-all duration-200",
      activeTab: "border-blue-500 text-blue-600",
      inactiveTab: "text-gray-500 hover:text-gray-700",
    },
  };

  // Active tab content
  const activeTabContent = tabs.find(
    (tab) => tab.id === currentActiveTab,
  )?.content;

  // Animation variants
  const tabIndicatorVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };

  const contentVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  };

  return (
    <div className={`w-full ${className}`} {...props}>
      {/* Tab List */}
      <div
        className={`flex ${orientation === "vertical" ? "flex-col" : "flex-row"} ${variants[variant].tabList} ${
          fullWidth ? "w-full" : ""
        } ${tabClassName}`}
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === currentActiveTab;
          const isFocused = tab.id === focusedTab;

          return (
            <button
              key={tab.id}
              ref={(el) => (tabRefs.current[tab.id] = el)}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`relative flex items-center justify-center font-medium outline-none ${
                sizes[size]
              } ${fullWidth ? "flex-1" : ""} ${
                isActive
                  ? variants[variant].activeTab
                  : variants[variant].inactiveTab
              } ${variants[variant].tab} ${
                isFocused ? "ring-2 ring-blue-500 ring-offset-2" : ""
              }`}
              onClick={() => handleTabChange(tab.id)}
              onFocus={() => setFocusedTab(tab.id)}
              onBlur={() => setFocusedTab(null)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              disabled={tab.disabled}
            >
              {/* Tab Icon */}
              {tab.icon && (
                <span
                  className={`material-symbols-outlined mr-2 ${
                    isActive ? "text-current" : "text-gray-400"
                  }`}
                >
                  {tab.icon}
                </span>
              )}

              {/* Tab Label */}
              {tab.label}

              {/* Badge/Count */}
              {tab.badge && (
                <motion.span
                  className="ml-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1"
                  variants={tabIndicatorVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {tab.badge}
                </motion.span>
              )}

              {/* Active indicator for underlined variant */}
              {variant === "underlined" && isActive && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
                  layoutId="activeTabIndicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTabContent && (
          <motion.div
            key={currentActiveTab}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.2 }}
            className={`mt-4 ${contentClassName}`}
            role="tabpanel"
            aria-labelledby={`tab-${currentActiveTab}`}
            id={`tabpanel-${currentActiveTab}`}
          >
            {activeTabContent}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Tab component for use within Tabs
Tabs.Tab = ({ children, ...props }) => children;

// Tabs Context for state management
const TabsContext = React.createContext();

Tabs.Provider = ({ children, ...tabsProps }) => (
  <TabsContext.Provider value={tabsProps}>{children}</TabsContext.Provider>
);

Tabs.useTabs = () => {
  const context = React.useContext(TabsContext);
  if (!context) {
    throw new Error(
      "Tabs compound components must be used within a Tabs.Provider",
    );
  }
  return context;
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      content: PropTypes.node,
      icon: PropTypes.string,
      badge: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      disabled: PropTypes.bool,
    }),
  ).isRequired,
  defaultActiveTab: PropTypes.string,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  variant: PropTypes.oneOf(["default", "underlined", "pills", "minimal"]),
  size: PropTypes.oneOf(["xs", "sm", "md", "lg", "xl"]),
  orientation: PropTypes.oneOf(["horizontal", "vertical"]),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  tabClassName: PropTypes.string,
  contentClassName: PropTypes.string,
};

export default Tabs;
