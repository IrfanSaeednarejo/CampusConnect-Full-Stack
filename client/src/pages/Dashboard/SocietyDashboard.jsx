import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import SocietySummary from "@/components/dashboard/SocietySummary";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  selectRegisteredSocieties,
  setRegisteredSocieties,
} from "@/redux/slices/societySlice";
import {
  selectUpcomingEvents,
  setUpcomingEvents,
} from "@/redux/slices/eventSlice";

const navItems = [
  { icon: "dashboard", label: "Dashboard", href: "#" },
  { icon: "groups", label: "Societies", href: "/societies" },
  { icon: "event", label: "Events", href: "/society/events" },
  { icon: "school", label: "Mentoring", href: "/society/mentoring" },
  { icon: "lan", label: "Networking", href: "/society/networking" },
  { icon: "analytics", label: "Analytics", href: "/society/analytics" },
];

export default function SocietyDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const societies = useSelector(selectRegisteredSocieties);
  const upcomingEvents = useSelector(selectUpcomingEvents);

  useEffect(() => {
    if (societies.length === 0) {
      dispatch(
        setRegisteredSocieties([
          { id: 1, name: "Tech Innovators Club", image: "🚀" },
          { id: 2, name: "Entrepreneurs of Tomorrow", image: "💼" },
          { id: 3, name: "Debate Society", image: "🎤" },
        ])
      );
    }
  }, [dispatch, societies.length]);

  useEffect(() => {
    if (upcomingEvents.length === 0) {
      dispatch(
        setUpcomingEvents([
          {
            id: 1,
            date: "28",
            month: "NOV",
            title: "Annual Tech Summit",
            society: "Tech Innovators Club",
            time: "10:00 AM - 4:00 PM",
          },
          {
            id: 2,
            date: "02",
            month: "DEC",
            title: "Startup Pitch Night",
            society: "Entrepreneurs of Tomorrow",
            time: "7:00 PM",
          },
          {
            id: 3,
            date: "05",
            month: "DEC",
            title: "The Art of Persuasion Workshop",
            society: "Debate Society",
            time: "2:00 PM - 3:30 PM",
          },
        ])
      );
    }
  }, [dispatch, upcomingEvents.length]);

  const pageClassName = isDark ? "bg-[#0d1117]" : "bg-[#f8fafc]";
  const surfaceClassName = isDark
    ? "border-[#30363d] bg-[#161b22]"
    : "border-[#dce4ee] bg-white";
  const subtleSurfaceClassName = isDark
    ? "border-[#30363d] bg-[#0d1117]"
    : "border-[#e2e8f0] bg-[#f8fafc]";
  const mutedTextClassName = isDark ? "text-[#8b949e]" : "text-[#526277]";
  const titleClassName = isDark ? "text-[#e6edf3]" : "text-[#162033]";

  return (
    <div className={`min-h-screen transition-colors duration-300 ${pageClassName}`}>
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside
          className={`hidden w-72 shrink-0 border-r lg:flex lg:flex-col lg:justify-between lg:p-5 ${
            isDark ? "border-[#30363d] bg-[#0d1117]" : "border-[#E2E8F0] bg-[#f8fafc]"
          }`}
        >
          <div className="flex flex-col gap-5">
            <button
              onClick={() => {
                window.location.href = "/society/profile";
              }}
              className={`flex items-center gap-3 rounded-[24px] border p-4 text-left transition-all duration-300 ${
                surfaceClassName
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-bold ${
                  isDark ? "bg-[#21262d] text-white" : "bg-[#eff6ff] text-[#1D4ED8]"
                }`}
              >
                AC
              </div>
              <div className="flex flex-col">
                <h1 className={`text-base font-medium ${titleClassName}`}>Alex Chen</h1>
                <p className={`text-sm ${mutedTextClassName}`}>Society Head</p>
              </div>
            </button>

            <nav className={`rounded-[24px] border p-3 ${surfaceClassName}`}>
              <div className="space-y-1">
                {navItems.map((item, index) => (
                  <a
                    key={item.label}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      index === 0
                        ? isDark
                          ? "bg-[#21262d] text-[#e6edf3]"
                          : "bg-[#eff6ff] text-[#1D4ED8]"
                        : isDark
                          ? "text-[#c9d1d9] hover:bg-[#161b22]"
                          : "text-[#334155] hover:bg-[#f8fafc]"
                    }`}
                    href={item.href}
                  >
                    <span className="material-symbols-outlined">{item.icon}</span>
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </nav>
          </div>

          <div className={`rounded-[24px] border p-3 ${surfaceClassName}`}>
            <button
              onClick={() => {
                window.location.href = "/society/create";
              }}
              className={`mb-3 flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                isDark
                  ? "bg-[#238636] text-white hover:bg-[#2ea043]"
                  : "bg-[#1D4ED8] text-white hover:bg-[#1E40AF]"
              }`}
            >
              <span className="truncate">Create New</span>
            </button>
            <div className={`space-y-1 border-t pt-3 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
              <a
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isDark ? "text-[#c9d1d9] hover:bg-[#161b22]" : "text-[#334155] hover:bg-[#f8fafc]"
                }`}
                href="/society/settings"
              >
                <span className="material-symbols-outlined">settings</span>
                <span>Settings</span>
              </a>
              <a
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isDark ? "text-[#c9d1d9] hover:bg-[#161b22]" : "text-[#334155] hover:bg-[#f8fafc]"
                }`}
                href="/logout"
              >
                <span className="material-symbols-outlined">logout</span>
                <span>Logout</span>
              </a>
            </div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto max-w-7xl">
            <section
              className={`mb-8 rounded-[2rem] border px-6 py-8 transition-all duration-300 sm:px-8 ${surfaceClassName}`}
              style={{
                boxShadow: isDark
                  ? "0 24px 70px rgba(0,0,0,0.24)"
                  : "0 24px 70px rgba(15,23,42,0.08)",
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-col gap-2">
                  <span
                    className={`mb-2 inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] ${
                      isDark
                        ? "border-[#30363d] bg-[#0d1117] text-[#3fb950]"
                        : "border-[#bfdbfe] bg-[#eff6ff] text-[#1D4ED8]"
                    }`}
                  >
                    SOCIETY HQ
                  </span>
                  <h1 className={`text-3xl font-bold tracking-tight ${titleClassName}`}>Society Dashboard</h1>
                  <p className={`text-sm sm:text-base ${mutedTextClassName}`}>
                    Oversee your societies, upcoming events, and campus impact from one control center.
                  </p>
                </div>
                <button
                  onClick={() => {
                    window.location.href = "/society/create";
                  }}
                  className={`flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition-colors sm:text-base ${
                    isDark
                      ? "bg-[#238636] text-white hover:bg-[#2ea043]"
                      : "bg-[#1D4ED8] text-white hover:bg-[#1E40AF]"
                  }`}
                >
                  <span className="material-symbols-outlined">add_circle</span>
                  <span className="truncate">Create New Society</span>
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <SocietySummary
                title="My Societies"
                societies={societies}
                variant="list"
                onItemAction={() => {
                  window.location.href = "/society/manage";
                }}
              />

              <section
                className={`rounded-[28px] border p-5 transition-all duration-300 sm:p-6 ${surfaceClassName}`}
                style={{
                  boxShadow: isDark
                    ? "0 20px 50px rgba(0,0,0,0.2)"
                    : "0 20px 50px rgba(15,23,42,0.06)",
                }}
              >
                <h2 className={`mb-4 text-xl font-semibold ${titleClassName}`}>Approvals Needed</h2>
                <div className={isDark ? "flex flex-col items-start gap-4 rounded-2xl border border-[#3fb950]/30 bg-[#3fb950]/10 p-4" : "flex flex-col items-start gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4"}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-[#3fb950]">person_add</span>
                    <p className={titleClassName}>
                      You have <span className="font-bold">3</span> pending member requests.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = "/society/member-requests";
                    }}
                    className={`flex h-10 w-full items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                      isDark
                        ? "bg-[#238636] text-white hover:bg-[#2ea043]"
                        : "bg-[#1D4ED8] text-white hover:bg-[#1E40AF]"
                    }`}
                  >
                    <span className="truncate">Review Requests</span>
                  </button>
                </div>
              </section>

              <section
                className={`flex flex-col rounded-[28px] border p-5 transition-all duration-300 sm:p-6 lg:col-span-2 ${surfaceClassName}`}
                style={{
                  boxShadow: isDark
                    ? "0 20px 50px rgba(0,0,0,0.2)"
                    : "0 20px 50px rgba(15,23,42,0.06)",
                }}
              >
                <div className={`mb-4 flex items-center justify-between gap-3 border-b pb-4 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
                  <h2 className={`text-xl font-semibold ${titleClassName}`}>Upcoming Events</h2>
                  <button
                    onClick={() => {
                      window.location.href = "/society/events";
                    }}
                    className={`flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${
                      isDark
                        ? "bg-[#21262d] text-white hover:bg-[#30363d]"
                        : "bg-[#f8fafc] text-[#162033] hover:bg-[#eef3f9]"
                    }`}
                  >
                    <span className="material-symbols-outlined">add</span>
                    <span className="truncate">Add Event</span>
                  </button>
                </div>
                <div className="flex flex-col gap-4">
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className={`flex items-start gap-4 rounded-2xl border p-4 ${subtleSurfaceClassName}`}>
                      <div className={`flex w-14 flex-col items-center justify-center rounded-xl p-2 text-center ${isDark ? "bg-[#21262d]" : "bg-white"}`}>
                        <span className={`text-xs font-bold uppercase ${mutedTextClassName}`}>{event.month}</span>
                        <span className={`text-2xl font-bold ${titleClassName}`}>{event.date}</span>
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${titleClassName}`}>{event.title}</p>
                        <p className={`text-sm ${mutedTextClassName}`}>
                          {event.society} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <AnalyticsWidget
                title="Society Analytics"
                options={["All Societies", "Tech Club", "Entrepreneurs"]}
                statLabel="Total Members"
                statValue="1,284"
                trendLabel="+112 this month"
                onOpen={() => navigate("/society/analytics")}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
