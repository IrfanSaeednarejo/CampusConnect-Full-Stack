import Button from "./Button";

export default function EventCard({
  title,
  date,
  time,
  location,
  description,
  attendees,
  onRegister,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-3 p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors ${className}`}
    >
      <h2 className="text-text-primary text-lg font-bold leading-tight">
        {title}
      </h2>
      <div className="flex flex-col gap-2 text-sm text-text-secondary">
        <p>📅 {date}</p>
        <p>⏰ {time}</p>
        <p>📍 {typeof location === 'string' ? location : (location?.address || location?.type || 'Online')}</p>
      </div>
      <p className="text-text-secondary text-sm font-normal leading-normal">
        {description}
      </p>
      <div className="flex justify-between items-center pt-2 border-t border-border">
        <span className="text-text-secondary text-xs">{attendees} attending</span>
        <Button
          variant="primary"
          className="h-8 px-3 text-xs"
          onClick={onRegister}
        >
          Register
        </Button>
      </div>
    </div>
  );
}
