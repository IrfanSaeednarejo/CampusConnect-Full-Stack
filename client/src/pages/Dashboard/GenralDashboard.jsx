import Sidebar from "../../components/layout/Sidebar";
import useHomeTheme from "@/hooks/useHomeTheme";

export default function GenralDashboard() {
  const isDark = useHomeTheme();

  return (
    <div className={`flex min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0d1117]" : "bg-[#f8fafc]"}`}>
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto max-w-7xl">
          <section
            className={`rounded-[28px] border p-6 sm:p-8 ${
              isDark ? "border-[#30363d] bg-[#161b22]" : "border-[#dbe4ee] bg-white"
            }`}
            style={{
              boxShadow: isDark
                ? "0 24px 60px rgba(0,0,0,0.22)"
                : "0 24px 60px rgba(15,23,42,0.08)",
            }}
          >
            <div className="space-y-3">
              <span
                className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] ${
                  isDark
                    ? "border-[#30363d] bg-[#0d1117] text-[#58a6ff]"
                    : "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"
                }`}
              >
                GENERAL DASHBOARD
              </span>
              <h1 className={isDark ? "text-3xl font-bold text-[#e6edf3]" : "text-3xl font-bold text-[#0f172a]"}>
                Main Content Area
              </h1>
              <p className={isDark ? "text-sm text-[#8b949e]" : "text-sm text-[#64748b]"}>
                This workspace is ready for dashboard content while staying visually aligned with the rest of the app.
              </p>
            </div>

            <div
              className={`mt-8 flex min-h-[420px] items-center justify-center rounded-[24px] border border-dashed ${
                isDark ? "border-[#30363d] bg-[#0d1117]" : "border-[#cbd5e1] bg-[#f8fafc]"
              }`}
            >
              <p className={isDark ? "text-base text-[#8b949e]" : "text-base text-[#64748b]"}>
                Main Content Area
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
