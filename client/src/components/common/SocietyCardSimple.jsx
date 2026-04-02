import Button from "./Button";

export default function SocietyCardSimple({
  name,
  category,
  members,
  description,
  head,
  onJoin,
  onLearnMore,
  joinLabel,
  joinLoading,
  joinDisabled,
  joinOutlined,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-4 p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors ${className}`}
    >
      <div>
        <h2 className="text-[#e6edf3] text-lg font-bold leading-tight">
          {name}
        </h2>
        <p className="text-primary text-sm font-semibold mt-1">
          {category}
        </p>
      </div>

      <p className="text-text-secondary text-sm font-normal leading-normal">
        {description}
      </p>

      <div className="flex flex-col gap-2 text-sm text-text-secondary border-t border-border pt-3">
        <p>👥 {members} members</p>
        <p>🎯 Head: {head}</p>
      </div>

      <div className="flex gap-2">
        <Button
          variant={joinOutlined ? "secondary" : "primary"}
          className={`flex-1 h-8 px-3 text-xs flex items-center justify-center gap-2 ${joinOutlined ? "border-border text-text-secondary" : ""}`}
          onClick={onJoin}
          disabled={joinDisabled}
        >
          {joinLoading ? <span className="material-symbols-outlined animate-spin text-sm">sync</span> : null}
          {joinLabel || "Join"}
        </Button>
        <Button
          variant="secondary"
          className="flex-1 h-8 px-3 text-xs"
          onClick={onLearnMore}
        >
          Learn More
        </Button>
      </div>
    </div>
  );
}
