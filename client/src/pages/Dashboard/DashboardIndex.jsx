import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserProfile } from "../../redux/slices/userSlice";
import { selectUpcomingEvents, setUpcomingEvents } from "../../redux/slices/eventSlice";
import { selectRecentActivity, setRecentActivity } from "../../redux/slices/dashboardSlice";
import Sidebar from "../../components/layout/Sidebar.jsx";
import Button from "../../components/common/Button";
import Avatar from "../../components/common/Avatar";
import useHomeTheme from "@/hooks/useHomeTheme";

const quickActions = [
  {
    icon: "add_circle",
    label: "Create Event",
    className: "bg-[#1d4ed8] text-white hover:bg-[#1e40af]",
  },
  {
    icon: "person_search",
    label: "Find a Mentor",
    className: "",
  },
];

const DashboardIndex = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();

  const profile = useSelector(selectUserProfile);
  const upcomingEvents = useSelector(selectUpcomingEvents);
  const recentActivity = useSelector(selectRecentActivity);

  useEffect(() => {
    if (upcomingEvents.length === 0) {
      dispatch(
        setUpcomingEvents([
          { id: 1, title: "CS Society: Hackathon Kick-off", date: "Oct 26, 2024, 6:00 PM" },
          { id: 2, title: "Alumni Mentorship Mixer", date: "Nov 2, 2024, 7:30 PM" },
          { id: 3, title: "Final Year Project Showcase", date: "Nov 15, 2024, 10:00 AM" },
        ])
      );
    }

    if (recentActivity.length === 0) {
      dispatch(
        setRecentActivity([
          {
            id: 1,
            type: "post",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnUqFlqtncpo8A-RQPe27lJ_WS8g54tjvBgnIBzcU1Ll7bgw_L2wwGvNZwV7bieV0IZw0IfSjxpDCFUfR3b_T2R9xfAy8PMbfzRXydNPMEmlPz3-_JKNv1tq9Q0GVVlvQVA5FvEL16uDt_dvB3dS1jQekuwt9VXLhsYoGg9mD_SMm9K90_dyc4T1DbRnSwcnemQS558OEoqhtnigYeMBdJ5urG5yfYGtoocbPc4LAtc8AaONwphWDbI-75skX0De7_uDfP-oJDZyA",
            text: "Sarah L. posted in Biotech Innovators",
            time: "2 hours ago",
          },
          {
            id: 2,
            type: "connection",
            img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBG8getaXNBPqeoxobLHq4-ezIUQo4TqQ12EPt6maLD--AHUCwHOGgjn2v88p1YabN6wufKDZIU5_kJsHYrin-B8jV4grph9u5sShOAsbbyO3x1iQ4aPYRcqJP7Y6S87a8Lyfe2aq5pNyGP2h2_whIXY8OpnbPDqwQ2mQyF7Pb1xkkt14pL5OehhiTmz9K9dptvHuOB5uMFG0UUMbeBVQSF-sVXyLlEKUpkwq1PABi0oaflwkycL-DgS5ErKi_BzaHE93Kx6ZBiqMw",
            text: "Mike R. is now connected with David Chen",
            time: "Yesterday",
          },
          {
            id: 3,
            type: "announcement",
            icon: "campaign",
            text: "New announcement in CS Society",
            time: "3 days ago",
          },
        ])
      );
    }
  }, [dispatch, upcomingEvents.length, recentActivity.length]);

  const pageClassName = isDark
    ? "bg-[#0d1117] text-[#e6edf3]"
    : "bg-[#f8fafc] text-[#0f172a]";
  const surfaceClassName = isDark
    ? "border-[#30363d] bg-[#161b22]"
    : "border-[#dbe4ee] bg-white";
  const subtleSurfaceClassName = isDark
    ? "border-[#30363d] bg-[#0d1117]"
    : "border-[#e2e8f0] bg-[#f8fafc]";
  const mutedTextClassName = isDark ? "text-[#8b949e]" : "text-[#64748b]";
  const titleClassName = isDark ? "text-[#e6edf3]" : "text-[#0f172a]";

  return (
    <div className={`relative flex min-h-screen w-full overflow-x-hidden transition-colors duration-300 ${pageClassName}`}>
      <header
        className={`sticky top-0 z-50 w-full border-b backdrop-blur-sm lg:hidden ${
          isDark ? "border-[#30363d] bg-[#0d1117]/85" : "border-[#e2e8f0] bg-white/85"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                isDark ? "bg-[#161b22] text-[#58a6ff]" : "bg-[#eff6ff] text-[#1d4ed8]"
              }`}
            >
              <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <h2 className={`text-base font-semibold ${titleClassName}`}>CampusNexus</h2>
              <p className={`text-xs ${mutedTextClassName}`}>Student dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${subtleSurfaceClassName}`}
            >
              <span className="material-symbols-outlined text-xl">notifications</span>
            </button>
            <div className="cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate("/profile/view")}>
              <Avatar src={profile?.picture || "/default-avatar.png"} size="10" border={true} />
            </div>
          </div>
        </div>
      </header>

      <Sidebar profile={profile} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`sticky top-0 z-40 hidden border-b backdrop-blur-sm lg:block ${
            isDark ? "border-[#30363d] bg-[#0d1117]/85" : "border-[#e2e8f0] bg-white/85"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
            <div>
              <p className={`text-sm font-medium ${mutedTextClassName}`}>Dashboard</p>
              <h2 className={`text-lg font-semibold ${titleClassName}`}>Your campus workspace</h2>
            </div>

            <div className="flex items-center gap-3">
              <label className="hidden min-w-[240px] xl:block">
                <div className={`flex h-11 items-center rounded-xl border px-3 ${surfaceClassName}`}>
                  <span className={`material-symbols-outlined text-xl ${mutedTextClassName}`}>search</span>
                  <input
                    className={`w-full bg-transparent px-3 text-sm outline-none ${
                      isDark
                        ? "text-[#e6edf3] placeholder:text-[#8b949e]"
                        : "text-[#0f172a] placeholder:text-[#64748b]"
                    }`}
                    placeholder="Search..."
                  />
                </div>
              </label>
              <button className={`flex h-11 w-11 items-center justify-center rounded-xl border ${surfaceClassName}`}>
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <div className="cursor-pointer transition-opacity hover:opacity-80" onClick={() => navigate("/profile/view")}>
                <Avatar src={profile?.picture || "/default-avatar.png"} size="10" border={true} />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <section
              className={`rounded-[28px] border p-6 sm:p-8 ${surfaceClassName}`}
              style={{
                boxShadow: isDark
                  ? "0 24px 60px rgba(0,0,0,0.22)"
                  : "0 24px 60px rgba(15,23,42,0.08)",
              }}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] ${
                        isDark
                          ? "border-[#30363d] bg-[#0d1117] text-[#58a6ff]"
                          : "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]"
                      }`}
                    >
                      STUDENT DASHBOARD
                    </span>
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${subtleSurfaceClassName} ${mutedTextClassName}`}
                    >
                      Personalized overview
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h1 className={`text-3xl font-bold tracking-tight ${titleClassName}`}>
                      Welcome back, {profile?.name || "User"}!
                    </h1>
                    <p className={`max-w-2xl text-sm leading-6 sm:text-base ${mutedTextClassName}`}>
                      Stay on top of upcoming events, mentoring, and campus activity from one organized home base.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <HeroMetric label="Upcoming" value={upcomingEvents.length} isDark={isDark} />
                  <HeroMetric label="Activity" value={recentActivity.length} isDark={isDark} />
                  <HeroMetric label="Mentoring" value="1" isDark={isDark} />
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <div className="flex min-w-0 flex-col gap-6 lg:col-span-2">
                <section
                  className={`rounded-[28px] border ${surfaceClassName}`}
                  style={{
                    boxShadow: isDark
                      ? "0 20px 50px rgba(0,0,0,0.2)"
                      : "0 20px 50px rgba(15,23,42,0.06)",
                  }}
                >
                  <SectionHeader
                    title="Upcoming Events"
                    subtitle="Keep track of the next campus opportunities on your calendar."
                    isDark={isDark}
                  />
                  <div className={`divide-y ${isDark ? "divide-[#30363d]" : "divide-[#e2e8f0]"}`}>
                    {upcomingEvents.slice(0, 3).map((event) => (
                      <EventItem key={event.id} title={event.title} date={event.date} isDark={isDark} />
                    ))}
                  </div>
                </section>

                <section
                  className={`rounded-[28px] border ${surfaceClassName}`}
                  style={{
                    boxShadow: isDark
                      ? "0 20px 50px rgba(0,0,0,0.2)"
                      : "0 20px 50px rgba(15,23,42,0.06)",
                  }}
                >
                  <SectionHeader
                    title="My Mentoring"
                    subtitle="Your next session and quick actions in one place."
                    isDark={isDark}
                  />
                  <div className="p-5 sm:p-6">
                    <div className={`flex flex-col gap-4 rounded-2xl border p-4 sm:flex-row sm:items-center sm:justify-between ${subtleSurfaceClassName}`}>
                      <div className="flex items-center gap-4">
                        <Avatar
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA93M4OEVTPSalVWpPg6oniNGkZhlm5SOXDGwxRtAc0Tx-kZ-wozDOkRBZZACWY3_axtayHpazxzohQLZ36P3GPz8s_D40_VhjpsSPxkZnooS6hQ_sTGil0ZNcJGE-CysBHzX6-Uf4sw7z1MDdFvvo6_Y-NzAVy_N44J7sL5JB65EEDIpSnpMj1pk3CQs1Em-3UtF2FCbykoay5NVQpmdFK_lDlB5H9tNcZoRcQCJCGH637Co8KUnklFzVhUzyFhDkEbNXlS_kaOyg"
                          size="12"
                        />
                        <div>
                          <p className={`text-base font-medium ${titleClassName}`}>Career Advice with Dr. Chen</p>
                          <p className={`text-sm ${mutedTextClassName}`}>Tomorrow, 3:00 PM</p>
                        </div>
                      </div>
                      <div className="flex w-full flex-wrap gap-2 sm:w-auto">
                        <Button variant="secondary" className="h-10 w-full text-sm sm:w-auto">
                          Join Call
                        </Button>
                        <button
                          className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
                            isDark
                              ? "text-[#8b949e] hover:bg-[#21262d] hover:text-[#e6edf3]"
                              : "text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]"
                          }`}
                        >
                          Reschedule
                        </button>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <div className="flex min-w-0 flex-col gap-6">
                <section
                  className={`rounded-[28px] border p-5 sm:p-6 ${surfaceClassName}`}
                  style={{
                    boxShadow: isDark
                      ? "0 20px 50px rgba(0,0,0,0.2)"
                      : "0 20px 50px rgba(15,23,42,0.06)",
                  }}
                >
                  <div className="mb-4">
                    <h2 className={`text-xl font-semibold ${titleClassName}`}>Quick Actions</h2>
                    <p className={`mt-1 text-sm ${mutedTextClassName}`}>Launch your most common dashboard tasks.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {quickActions.map((action) =>
                      action.className ? (
                        <button
                          key={action.label}
                          className={`flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors ${action.className}`}
                        >
                          <span className="material-symbols-outlined text-xl">{action.icon}</span>
                          <span>{action.label}</span>
                        </button>
                      ) : (
                        <Button key={action.label} variant="secondary" className="h-11 w-full gap-2">
                          <span className="material-symbols-outlined text-xl">{action.icon}</span>
                          <span>{action.label}</span>
                        </Button>
                      )
                    )}
                  </div>
                </section>

                <RecentActivity activities={recentActivity} isDark={isDark} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

const HeroMetric = ({ label, value, isDark }) => (
  <div className={`rounded-2xl border p-4 ${isDark ? "border-[#30363d] bg-[#0d1117]" : "border-[#e2e8f0] bg-[#f8fafc]"}`}>
    <p className={isDark ? "text-xs font-semibold uppercase tracking-[0.12em] text-[#8b949e]" : "text-xs font-semibold uppercase tracking-[0.12em] text-[#64748b]"}>
      {label}
    </p>
    <p className={isDark ? "mt-2 text-2xl font-bold text-[#e6edf3]" : "mt-2 text-2xl font-bold text-[#0f172a]"}>
      {value}
    </p>
  </div>
);

const SectionHeader = ({ title, subtitle, isDark }) => (
  <div className={`border-b px-5 py-5 sm:px-6 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
    <h2 className={isDark ? "text-xl font-semibold text-[#e6edf3]" : "text-xl font-semibold text-[#0f172a]"}>
      {title}
    </h2>
    <p className={isDark ? "mt-1 text-sm text-[#8b949e]" : "mt-1 text-sm text-[#64748b]"}>
      {subtitle}
    </p>
  </div>
);

const EventItem = ({ title, date, isDark }) => (
  <div className="flex min-h-[88px] flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
    <div className="flex min-w-0 flex-1 items-center gap-4">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${
          isDark ? "bg-[#21262d] text-[#8b949e]" : "bg-[#f1f5f9] text-[#64748b]"
        }`}
      >
        <span className="material-symbols-outlined">event</span>
      </div>
      <div className="min-w-0">
        <p className={isDark ? "truncate text-base font-medium text-[#e6edf3]" : "truncate text-base font-medium text-[#0f172a]"}>
          {title}
        </p>
        <p className={isDark ? "truncate text-sm text-[#8b949e]" : "truncate text-sm text-[#64748b]"}>
          {date}
        </p>
      </div>
    </div>
    <button className={isDark ? "shrink-0 text-sm font-medium text-[#58a6ff] hover:underline" : "shrink-0 text-sm font-medium text-[#1d4ed8] hover:underline"}>
      View Details
    </button>
  </div>
);

const RecentActivity = ({ activities = [], isDark }) => (
  <section
    className={`rounded-[28px] border ${isDark ? "border-[#30363d] bg-[#161b22]" : "border-[#dbe4ee] bg-white"}`}
    style={{
      boxShadow: isDark
        ? "0 20px 50px rgba(0,0,0,0.2)"
        : "0 20px 50px rgba(15,23,42,0.06)",
    }}
  >
    <SectionHeader
      title="Recent Activity"
      subtitle="A quick look at your latest community updates."
      isDark={isDark}
    />
    <div className={`divide-y ${isDark ? "divide-[#30363d]" : "divide-[#e2e8f0]"}`}>
      {activities.map((activity) => (
        <ActivityItem key={activity.id} {...activity} isDark={isDark} />
      ))}
    </div>
  </section>
);

const ActivityItem = ({ img, icon, text, time, isDark }) => (
  <div className="flex items-start gap-4 p-5 sm:p-6">
    {img ? (
      <Avatar src={img} size="8" className="mt-1 shrink-0" />
    ) : (
      <div
        className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isDark ? "bg-[#21262d] text-[#8b949e]" : "bg-[#f1f5f9] text-[#64748b]"
        }`}
      >
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
    )}
    <div className="flex min-w-0 flex-col">
      <p className={isDark ? "text-sm text-[#e6edf3]" : "text-sm text-[#0f172a]"}>{text}</p>
      <p className={isDark ? "text-xs text-[#8b949e]" : "text-xs text-[#64748b]"}>{time}</p>
    </div>
  </div>
);

export default DashboardIndex;
