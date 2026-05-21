import Card from "../common/Card";

export default function RewardToast({ event }) {
  if (!event) return null;

  return (
    <Card padding="p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-info/10 text-info">
          <span className="material-symbols-outlined">
            {event.type === "badge" ? "military_tech" : event.type === "certificate" ? "workspace_premium" : "workspace_premium"}
          </span>
        </div>
        <div>
          <p className="text-sm font-semibold">
            {event.type === "badge"
              ? `Badge: ${event.badge?.name}`
              : event.type === "level"
                ? `Level ${event.newLevel} reached`
                : event.type === "certificate"
                  ? event.title
                  : `${event.points || 0} points earned`}
          </p>
        </div>
      </div>
    </Card>
  );
}
