import { Link } from "react-router-dom";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function NoteCard({
  id,
  title,
  description,
  date,
  course,
  onClick,
  to = "",
  isDark,
}) {
  const themeIsDark = useHomeTheme();
  const resolvedIsDark = typeof isDark === "boolean" ? isDark : themeIsDark;

  const content = (
    <div
      className={`cursor-pointer overflow-hidden rounded-3xl border transition-all ${
        resolvedIsDark
          ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
          : "border-slate-200 bg-white shadow-[0_12px_30px_rgba(15,23,42,0.06)] hover:border-slate-300 hover:bg-slate-50"
      }`}
    >
      <div className="p-6">
        <div className="mb-3 flex items-start justify-between">
          <h3
            className={`line-clamp-2 flex-1 text-base font-medium ${
              resolvedIsDark ? "text-white" : "text-slate-900"
            }`}
          >
            {title}
          </h3>
          {course && (
            <span
              className={`ml-2 whitespace-nowrap rounded-full px-2 py-1 text-xs font-medium ${
                resolvedIsDark
                  ? "bg-[#17cf60]/10 text-[#17cf60]"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {course}
            </span>
          )}
        </div>
        {description && (
          <p
            className={`mb-3 line-clamp-2 text-sm ${
              resolvedIsDark ? "text-white/60" : "text-slate-500"
            }`}
          >
            {description}
          </p>
        )}
        {date && (
          <p className={`text-xs ${resolvedIsDark ? "text-white/40" : "text-slate-400"}`}>
            {new Date(date).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  if (onClick) {
    return <div onClick={onClick}>{content}</div>;
  }

  return content;
}
