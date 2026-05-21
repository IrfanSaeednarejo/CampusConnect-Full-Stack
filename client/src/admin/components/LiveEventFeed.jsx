import useHomeTheme from "@/hooks/useHomeTheme";

const EVENT_LABELS = {
  "admin:user_registered": { label: "New User", color: "#22c55e" },
  "admin:mentor_applied": { label: "Mentor Request", color: "#2563eb" },
  "admin:society_created": { label: "Society Request", color: "#f59e0b" },
  "admin:event_created": { label: "Event Review", color: "#06b6d4" },
  "admin:booking_created": { label: "Booking", color: "#0ea5e9" },
};

export const LiveEventFeed = ({ events = [] }) => {
  const isDark = useHomeTheme();

  return (
    <div
      className={`rounded-[24px] border p-5 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] text-[#e6edf3]"
          : "border-[#dbe4ee] bg-white text-[#0f172a]"
      }`}
      style={{
        boxShadow: isDark
          ? "0 20px 50px rgba(0,0,0,0.24)"
          : "0 20px 50px rgba(15,23,42,0.08)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Live Feed</h3>
          <p className={isDark ? "text-sm text-[#8b949e]" : "text-sm text-[#64748b]"}>
            Recent platform activity
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isDark ? "bg-[#0d1117] text-[#8b949e]" : "bg-[#f8fafc] text-[#64748b]"
          }`}
        >
          {events.length} items
        </span>
      </div>

      <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
        {events.length === 0 && (
          <div
            className={`rounded-2xl border px-4 py-10 text-center text-sm ${
              isDark
                ? "border-[#30363d] bg-[#0d1117] text-[#8b949e]"
                : "border-[#e2e8f0] bg-[#f8fafc] text-[#64748b]"
            }`}
          >
            Waiting for events...
          </div>
        )}

        {events.map((evt, i) => {
          const meta = EVENT_LABELS[evt.type] || { label: evt.type, color: "#64748b" };

          return (
            <div
              key={evt._id || i}
              className={`flex gap-3 rounded-2xl border p-4 ${
                isDark ? "border-[#30363d] bg-[#0d1117]" : "border-[#e2e8f0] bg-[#f8fafc]"
              }`}
            >
              <span
                className="h-fit rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{
                  backgroundColor: `${meta.color}18`,
                  color: meta.color,
                }}
              >
                {meta.label}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">
                  {evt.displayName || evt.name || evt.title || "—"}
                </div>
                <div className={isDark ? "mt-1 text-xs text-[#8b949e]" : "mt-1 text-xs text-[#64748b]"}>
                {evt._ts ? new Date(evt._ts).toLocaleTimeString() : ""}
              </div>
              {evt.summary && (
                <div className={isDark ? "mt-1 text-xs text-[#6e7681]" : "mt-1 text-xs text-[#94a3b8]"}>
                  {evt.summary}
                </div>
              )}
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
};

export default LiveEventFeed;
