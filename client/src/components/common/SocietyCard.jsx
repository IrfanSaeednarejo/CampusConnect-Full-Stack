import useHomeTheme from "../../hooks/useHomeTheme";

export default function SocietyCard({ society, className = "", isDark }) {
  const themeIsDark = useHomeTheme();
  const resolvedIsDark = typeof isDark === "boolean" ? isDark : themeIsDark;

  return (
    <div
      className={`group cursor-pointer overflow-hidden rounded-3xl border transition-colors ${
        resolvedIsDark
          ? "border-[#30363d] bg-[#161b22] hover:border-[#238636]/50"
          : "border-slate-200 bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:border-slate-300"
      } ${className}`}
    >
      <div
        className={`relative h-40 w-full overflow-hidden ${
          resolvedIsDark ? "bg-[#0d1117]" : "bg-slate-100"
        }`}
      >
        <div
          className="h-full w-full bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url("${society.image}")` }}
        />
        <div className="absolute right-4 top-4">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-bold ${
              resolvedIsDark
                ? "border-[#238636] bg-[#161b22]/80 text-[#238636]"
                : "border-slate-200 bg-white/90 text-slate-700"
            }`}
          >
            {society.category}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div>
          <h3
            className={`text-lg font-medium leading-tight ${
              resolvedIsDark ? "text-white" : "text-slate-900"
            }`}
          >
            {society.name}
          </h3>
        </div>

        <p
          className={`line-clamp-2 text-sm ${
            resolvedIsDark ? "text-[#8b949e]" : "text-slate-500"
          }`}
        >
          {society.description}
        </p>

        <div
          className={`space-y-1 border-y py-3 ${
            resolvedIsDark ? "border-[#30363d]" : "border-slate-200"
          }`}
        >
          <div
            className={`flex items-center gap-2 text-sm ${
              resolvedIsDark ? "text-[#8b949e]" : "text-slate-500"
            }`}
          >
            <span className="material-symbols-outlined text-base">group</span>
            <span>{society.members} members</span>
          </div>
          <div
            className={`flex items-center gap-2 text-sm ${
              resolvedIsDark ? "text-[#8b949e]" : "text-slate-500"
            }`}
          >
            <span className="material-symbols-outlined text-base">event</span>
            <span>{society.events} events this year</span>
          </div>
          {society.status === "registered" && (
            <div
              className={`flex items-center gap-2 text-sm font-medium ${
                resolvedIsDark ? "text-[#238636]" : "text-slate-900"
              }`}
            >
              <span className="material-symbols-outlined text-base">verified</span>
              <span>{society.role}</span>
            </div>
          )}
        </div>

        <button
          className={`flex h-10 w-full items-center justify-center gap-2 overflow-hidden rounded-2xl px-4 text-sm font-semibold leading-normal tracking-[0.015em] transition-colors ${
            society.status === "registered"
              ? resolvedIsDark
                ? "bg-[#30363d] text-[#c9d1d9] hover:bg-[#3d444d]"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              : resolvedIsDark
                ? "bg-[#238636] text-[#0d1117] hover:bg-[#2ea043]"
                : "bg-slate-900 text-white hover:bg-slate-800"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {society.status === "registered" ? "check_circle" : "add_circle"}
          </span>
          <span>{society.status === "registered" ? "Registered" : "Join Now"}</span>
        </button>
      </div>
    </div>
  );
}
