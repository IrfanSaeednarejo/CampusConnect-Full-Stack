export default function TabNavigation({ activeTab, onTabChange, tabs }) {
  return (
    <div className="flex gap-2 mb-6 border-b border-[#30363d] overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
            activeTab === tab
              ? "text-[#c9d1d9] border-b-2 border-[#238636]"
              : "text-[#8b949e] hover:text-[#c9d1d9]"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
