import React from 'react';

/**
 * Common Tabs component for administrative and dashboard views.
 * 
 * @param {string} activeTab - The ID of the currently active tab.
 * @param {function} onChange - Callback function triggered when a tab is clicked.
 * @param {Array} tabs - Array of tab objects { id, label, icon }.
 */
const Tabs = ({ activeTab, onChange, tabs }) => {
  return (
    <div className="flex border-b border-[#30363d] bg-[#161b22]">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all relative ${
            activeTab === tab.id
              ? 'text-[#58a6ff]'
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#1f242c]'
          }`}
        >
          {tab.icon && (
            <span className="material-symbols-outlined text-lg">
              {tab.icon}
            </span>
          )}
          {tab.label}
          
          {/* Active Indicator Bar */}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#58a6ff]" />
          )}
        </button>
      ))}
    </div>
  );
};

export default Tabs;
