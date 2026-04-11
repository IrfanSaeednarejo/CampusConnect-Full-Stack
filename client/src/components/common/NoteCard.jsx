import { Link } from "react-router-dom";

export default function NoteCard({
  id,
  title,
  description,
  date,
  course,
  onClick,
  to = "",
}) {
  const content = (
    <div className="bg-surface border border-border border border-border rounded-lg overflow-hidden hover:border-white/20 hover:bg-white/7 transition-all cursor-pointer">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-text-primary font-bold text-base flex-1 line-clamp-2">
            {title}
          </h3>
          {course && (
            <span className="text-primary text-xs font-medium bg-primary/10 px-2 py-1 rounded ml-2 whitespace-nowrap">
              {course}
            </span>
          )}
        </div>
        {description && (
          <p className="text-text-primary/60 text-sm line-clamp-2 mb-3">
            {description}
          </p>
        )}
        {date && (
          <p className="text-text-primary/40 text-xs">
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
