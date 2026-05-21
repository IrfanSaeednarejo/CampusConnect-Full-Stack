import { getButtonClassName } from "../common/Button";

export default function CategoryFilter({
  categories,
  activeFilter,
  onFilterChange,
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onFilterChange(cat)}
          className={getButtonClassName({
            variant: activeFilter === cat ? "primary" : "secondary",
            size: "sm",
          })}
        >
          {cat === "all" ? "All Groups" : cat}
        </button>
      ))}
    </div>
  );
}
