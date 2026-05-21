import useHomeTheme from "@/hooks/useHomeTheme";

export const AdminStatCard = ({
  icon,
  label,
  value,
  color = "#818cf8",
  trend,
  sub,
  onClick,
}) => {
  const isDark = useHomeTheme();

  return (
    <div
      onClick={onClick}
      className={[
        "relative flex flex-col gap-4 overflow-hidden rounded-[24px] border p-6 transition-all duration-200",
        onClick ? "cursor-pointer" : "cursor-default",
        isDark
          ? "border-[#30363d] bg-[#161b22] hover:border-[#475569]"
          : "border-[#dbe4ee] bg-white hover:border-[#cbd5e1]",
      ].join(" ")}
      style={{
        boxShadow: isDark
          ? "0 20px 50px rgba(0,0,0,0.24)"
          : "0 20px 50px rgba(15,23,42,0.08)",
      }}
    >
      <div
        className="pointer-events-none absolute right-6 top-6 h-16 w-16 rounded-full opacity-20 blur-2xl"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-center justify-between">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl border text-[22px]"
          style={{
            backgroundColor: `${color}18`,
            borderColor: `${color}30`,
            color,
          }}
        >
          {icon}
        </div>

        {trend !== undefined && (
          <div
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{
              backgroundColor: trend >= 0 ? "rgba(22,163,74,0.12)" : "rgba(220,38,38,0.12)",
              color: trend >= 0 ? "#16a34a" : "#dc2626",
            }}
          >
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-3xl font-bold leading-none" style={{ color }}>
          {value}
        </div>
        <div className={isDark ? "text-sm font-medium text-[#8b949e]" : "text-sm font-medium text-[#64748b]"}>
          {label}
        </div>
        {sub && <div className={isDark ? "text-xs text-[#6e7681]" : "text-xs text-[#94a3b8]"}>{sub}</div>}
      </div>
    </div>
  );
};

export default AdminStatCard;
