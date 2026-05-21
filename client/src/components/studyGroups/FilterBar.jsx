import useHomeTheme from "@/hooks/useHomeTheme";
import { getStudyGroupTheme } from "./studyGroupTheme";

export default function FilterBar({ filters, activeFilter, onFilterChange }) {
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);

  return (
    <div className={`mb-6 rounded-[28px] border p-4 ${theme.surface}`}>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${
              activeFilter === filter.value ? theme.tabActive : theme.tabIdle
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}
