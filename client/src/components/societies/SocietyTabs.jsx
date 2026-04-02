export default function SocietyTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  containerClassName = "",
}) {
  return (
    <div className={`bg-surface border-b border-border ${containerClassName}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex gap-6 ${className}`}>
          {tabs.map((tab) => {
            const value = typeof tab === "string" ? tab : tab.value;
            const label = typeof tab === "string" ? tab : tab.label;
            const badge = typeof tab === "string" ? null : tab.badge;

            return (
              <button
                key={value}
                onClick={() => onChange(value)}
                className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                  activeTab === value
                    ? "border-[#1dc964] text-white"
                    : "border-transparent text-text-secondary hover:text-white"
                }`}
              >
                {label}
                {badge ? (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">
                    {badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
