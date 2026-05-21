import Button from "@/components/common/Button";
import useHomeTheme from "@/hooks/useHomeTheme";

export default function EventCard({
  event,
  variant = "catalog",
  onPrimaryAction,
  onSecondaryAction,
}) {
  const isDark = useHomeTheme();

  if (!event) {
    return null;
  }

  const cardClassName = isDark
    ? "border-[#30363d] bg-[#161b22] hover:border-[#3b82f6]/50"
    : "border-[#dbe4ee] bg-white hover:border-[#93c5fd]";
  const mutedTextClassName = isDark ? "text-[#8b949e]" : "text-[#64748b]";
  const titleClassName = isDark ? "text-[#e6edf3]" : "text-[#0f172a]";
  const subtleSurfaceClassName = isDark ? "bg-[#0d1117]" : "bg-[#f8fafc]";
  const tagClassName = isDark
    ? "bg-[#1d2733] text-[#93c5fd]"
    : "bg-[#eff6ff] text-[#1d4ed8]";
  const statusClassName =
    event.status === "Upcoming"
      ? isDark
        ? "bg-[#1a2e22] text-[#86efac]"
        : "bg-[#ecfdf3] text-[#166534]"
      : isDark
        ? "bg-[#21262d] text-[#c9d1d9]"
        : "bg-[#f1f5f9] text-[#475569]";

  if (variant === "compact") {
    return (
      <div
        className={`flex flex-col gap-4 rounded-2xl border p-4 transition-all duration-200 sm:flex-row sm:items-center sm:justify-between ${cardClassName}`}
      >
        <div className="flex flex-[2] flex-col gap-3">
          <div className="flex flex-col gap-1">
            <p className={`text-sm ${mutedTextClassName}`}>{event.society}</p>
            <p className={`text-base font-medium ${titleClassName}`}>{event.title}</p>
            <p className={`text-sm ${mutedTextClassName}`}>{event.date}</p>
          </div>
          <Button
            onClick={onPrimaryAction}
            variant="secondary"
            size="sm"
            className="w-fit"
          >
            <span className="truncate">Join Event</span>
            <span className="text-lg">→</span>
          </Button>
        </div>
        <div
          className={`aspect-video w-full rounded-xl bg-cover bg-center bg-no-repeat sm:w-48 sm:aspect-square ${subtleSurfaceClassName}`}
          style={{ backgroundImage: `url("${event.image}")` }}
        />
      </div>
    );
  }

  const isUpcoming = event.status === "Upcoming";

  return (
    <div
      className={`flex flex-col gap-4 rounded-2xl border p-4 transition-all duration-200 sm:flex-row ${cardClassName}`}
    >
      <div
        className={`h-24 w-full shrink-0 rounded-xl bg-cover bg-center sm:w-28 ${subtleSurfaceClassName}`}
        style={{ backgroundImage: `url("${event.image}")` }}
      />

      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <div className="space-y-1">
            <h3 className={`text-lg font-medium ${titleClassName}`}>{event.title}</h3>
            <p className={`text-sm ${mutedTextClassName}`}>
              {event.date} • {event.location}
            </p>
            <p className={`text-sm ${mutedTextClassName}`}>{event.society}</p>
          </div>

          {(event.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {event.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${tagClassName}`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${statusClassName}`}
          >
            {isUpcoming ? "Upcoming" : "Past Event"}
          </span>

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={isUpcoming ? onPrimaryAction : undefined}
              variant={isUpcoming ? "primary" : "secondary"}
              size="md"
              disabled={!isUpcoming}
            >
              {isUpcoming ? "Register" : "Closed"}
            </Button>
            <Button
              onClick={onSecondaryAction}
              variant="secondary"
              size="md"
            >
              Details
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
