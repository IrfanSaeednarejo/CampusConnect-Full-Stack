export default function SocietyTabs({
  tabs,
  activeTab,
  onChange,
  className = "",
  containerClassName = "",
}) {
  return (
    <div className={`bg-[#1a241e] border-b border-[#29382f] ${containerClassName}`}>
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
                    : "border-transparent text-[#9eb7a9] hover:text-white"
                }`}
              >
                {label}
                {badge ? (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-[#1dc964] text-[#111714] text-xs font-bold">
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
