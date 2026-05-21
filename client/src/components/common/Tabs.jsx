import React from "react";
import useHomeTheme from "../../hooks/useHomeTheme";

const Tabs = ({ activeTab, onChange, tabs }) => {
  const isDark = useHomeTheme();

  return (
    <div
      className={`flex border-b ${
        isDark
          ? "border-border-dark bg-transparent"
          : "border-border-light bg-transparent"
      }`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          type="button"
          className={`relative flex items-center gap-2 px-6 py-4 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
            activeTab === tab.id
              ? isDark
                ? "text-info focus-visible:ring-info"
                : "text-info focus-visible:ring-info"
              : isDark
                ? "text-text-secondary-dark hover:bg-surface-dark hover:text-text-primary-dark focus-visible:ring-info"
                : "text-text-secondary-light hover:bg-surface-muted hover:text-text-primary-light focus-visible:ring-info"
          }`}
        >
          {tab.icon && (
            <span className="material-symbols-outlined text-lg">{tab.icon}</span>
          )}
          {tab.label}

          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-info" />
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
