import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import MentorWidget from "@/components/dashboard/MentorWidget";
import useHomeTheme from "@/hooks/useHomeTheme";

const navItems = [
  { label: "Mentees", path: "/mentor-mentees" },
  { label: "Events", path: "/mentor-events" },
  { label: "Profile", path: "/mentor-profile-view" },
];

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");
  const isDark = useHomeTheme();

  const pageClassName = isDark
    ? "bg-[#0d1117] text-[#c9d1d9]"
    : "bg-[#f8fafc] text-[#0F172A]";
  const surfaceClassName = isDark
    ? "border-[#30363d] bg-[#161b22]"
    : "border-[#dce4ee] bg-white";
  const subtleSurfaceClassName = isDark
    ? "border-[#30363d] bg-[#0d1117]"
    : "border-[#e2e8f0] bg-[#f8fafc]";
  const mutedTextClassName = isDark ? "text-[#8b949e]" : "text-[#526277]";
  const titleClassName = isDark ? "text-[#e6edf3]" : "text-[#162033]";
  const accentTextClassName = isDark ? "text-[#3fb950]" : "text-[#1D4ED8]";

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${pageClassName}`}>
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col">
        <header
          className={`border-b px-4 py-4 sm:px-6 lg:px-8 transition-all duration-300 ${
            isDark ? "border-[#30363d] bg-[#0d1117]" : "border-[#E2E8F0] bg-white"
          }`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    isDark ? "bg-[#161b22] text-[#3fb950]" : "bg-[#ecfdf3] text-[#1D4ED8]"
                  }`}
                >
                  <svg className="size-5" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <h2 className={isDark ? "text-lg font-semibold text-white" : "text-lg font-semibold text-[#162033]"}>
                    CampusNexus
                  </h2>
                  <p className={`text-sm ${mutedTextClassName}`}>Mentor workspace</p>
                </div>
              </div>

              <label className={`hidden md:flex h-11 min-w-[240px] items-center rounded-xl border px-3 ${subtleSurfaceClassName}`}>
                <span className={`material-symbols-outlined text-xl ${mutedTextClassName}`}>search</span>
                <input
                  className={`w-full bg-transparent px-3 text-sm outline-none ${
                    isDark
                      ? "text-white placeholder:text-[#8b949e]"
                      : "text-[#162033] placeholder:text-[#94a3b8]"
                  }`}
                  placeholder="Search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </label>
            </div>

            <div className="flex flex-1 flex-wrap items-center justify-between gap-4 lg:justify-end">
              <div className="hidden lg:flex items-center gap-3">
                {navItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      isDark
                        ? "text-white hover:bg-[#161b22] hover:text-[#3fb950]"
                        : "text-[#0F172A] hover:bg-[#f8fafc] hover:text-[#1D4ED8]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigate("/mentor-notifications")}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-xl border transition-colors ${
                    isDark
                      ? "border-[#30363d] bg-[#161b22] text-white hover:bg-[#21262d]"
                      : "border-[#dce4ee] bg-white text-[#0F172A] hover:bg-[#f8fafc]"
                  }`}
                >
                  <span className="material-symbols-outlined">notifications</span>
                  <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ef4444]"></span>
                </button>
                <Avatar
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgjnv-ixtGxRDh4QEaPBNUdMjXlCgO4Di7YsyjQZ_I21EDiOSRocUjGni8cViV_CJzUNuTwbKO6qL2ELKucJviHvtTGb5IoWrvryA6QiSKES--KcSvqsDWZ1KpSuZmk0lwuAdXOoKx29-hTfGzUVjUFmMfKN8ePF2jbbETEb-ZJ4sbGp0i5zNnzNhdXDhOyG5SRDAgKbhgIsTZDf5Qvwv7Du7ImY-uPgAE-OPeOuTdAxD6cykLE_jM18XdA4t_EU_5vQrYK9XVePg"
                  size="10"
                  border={true}
                  hover={true}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
            <section
              className={`rounded-[2rem] border px-6 py-8 transition-all duration-300 sm:px-8 ${surfaceClassName}`}
              style={{
                boxShadow: isDark
                  ? "0 24px 70px rgba(0,0,0,0.24)"
                  : "0 24px 70px rgba(15,23,42,0.08)",
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-[260px] flex-col gap-2">
                  <span
                    className={`mb-2 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] ${
                      isDark
                        ? "border-[#30363d] bg-[#0d1117] text-[#3fb950]"
                        : "border-[#bfdbfe] bg-[#eff6ff] text-[#1D4ED8]"
                    }`}
                  >
                    MENTOR PORTAL
                  </span>
                  <h1 className={`text-3xl font-bold tracking-tight ${titleClassName}`}>Mentor Dashboard</h1>
                  <p className={`text-sm sm:text-base ${mutedTextClassName}`}>
                    Manage your sessions, ratings, and mentee feedback from one focused workspace.
                  </p>
                </div>
                <button
                  onClick={() => navigate("/mentor-profile")}
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-all duration-300 sm:text-base ${
                    isDark
                      ? "bg-[#238636] text-white hover:bg-[#2ea043]"
                      : "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-[0_10px_24px_rgba(29,78,216,0.18)]"
                  }`}
                >
                  <span className="material-symbols-outlined">calendar_add_on</span>
                  <span className="truncate">Set Your Availability</span>
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <MentorWidget
                title="Upcoming Sessions"
                actionLabel="View All"
                actionIcon="arrow_forward"
                onAction={() => navigate("/my-sessions")}
                actionClassName={`flex items-center gap-1 text-sm font-medium ${accentTextClassName}`}
                className="lg:col-span-2"
              >
                <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
                  <div className={accentTextClassName}>
                    <span className="material-symbols-outlined inline-block text-[64px]">event_busy</span>
                  </div>
                  <div className="flex max-w-[480px] flex-col items-center gap-2">
                    <p className={`text-lg font-medium ${titleClassName}`}>No sessions yet</p>
                    <p className={`text-sm ${mutedTextClassName}`}>
                      Once a student books a session, it will appear here.
                    </p>
                  </div>
                </div>
              </MentorWidget>

              <MentorWidget
                title="Earnings Overview"
                actionIcon="arrow_forward"
                onAction={() => navigate("/earnings")}
                actionClassName={`text-sm font-medium ${accentTextClassName}`}
              >
                <div className="flex flex-1 flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <p className={`text-sm ${mutedTextClassName}`}>Total Earnings</p>
                    <p className={`text-4xl font-bold tracking-tight ${titleClassName}`}>$0.00</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className={`text-sm ${mutedTextClassName}`}>Sessions Completed</p>
                    <p className={`text-2xl font-bold ${titleClassName}`}>0</p>
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() => navigate("/earnings")}
                      className={`flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${
                        isDark
                          ? "bg-[#21262d] text-white hover:bg-[#30363d]"
                          : "bg-[#f8fafc] text-[#162033] hover:bg-[#eef3f9]"
                      }`}
                    >
                      <span className="material-symbols-outlined">account_balance_wallet</span>
                      <span className="truncate">Withdraw Earnings</span>
                    </button>
                  </div>
                </div>
              </MentorWidget>

              <MentorWidget
                title="Pending Feedback"
                actionIcon="arrow_forward"
                onAction={() => navigate("/feedback")}
                actionClassName={`text-sm font-medium ${accentTextClassName}`}
              >
                <div
                  className="flex cursor-pointer flex-col items-center justify-center gap-6 py-10 text-center transition-opacity hover:opacity-80"
                  onClick={() => navigate("/feedback")}
                >
                  <div className={accentTextClassName}>
                    <span className="material-symbols-outlined inline-block text-[64px]">rate_review</span>
                  </div>
                  <div className="flex max-w-[480px] flex-col items-center gap-2">
                    <p className={`text-lg font-medium ${titleClassName}`}>All Caught Up!</p>
                    <p className={`text-sm ${mutedTextClassName}`}>You have no pending feedback requests.</p>
                  </div>
                </div>
              </MentorWidget>

              <MentorWidget
                title="Recent Mentee Ratings"
                actionLabel="View All"
                actionIcon="arrow_forward"
                onAction={() => navigate("/my-sessions")}
                actionClassName={`flex items-center gap-1 text-sm font-medium ${accentTextClassName}`}
                className="lg:col-span-2"
              >
                <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
                  <div className={accentTextClassName}>
                    <span className="material-symbols-outlined inline-block text-[64px]">star_outline</span>
                  </div>
                  <div className="flex max-w-[480px] flex-col items-center gap-2">
                    <p className={`text-lg font-medium ${titleClassName}`}>No ratings yet</p>
                    <p className={`text-sm ${mutedTextClassName}`}>
                      Your mentee ratings will appear here after completed sessions.
                    </p>
                  </div>
                </div>
              </MentorWidget>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
