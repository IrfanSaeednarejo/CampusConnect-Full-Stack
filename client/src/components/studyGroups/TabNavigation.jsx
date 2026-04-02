export default function TabNavigation({ activeTab, onTabChange, tabs }) {
  return (
    <div className="flex gap-2 mb-6 border-b border-border overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
            activeTab === tab
              ? "text-text-primary border-b-2 border-primary"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
