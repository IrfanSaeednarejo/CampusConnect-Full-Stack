import { NavLink } from "react-router-dom";
import useHomeTheme from "@/hooks/useHomeTheme";

const primaryLinks = [
  { to: "/events", icon: "calendar_month", label: "Events" },
  { to: "/student/notifications", icon: "notifications", label: "Notifications" },
  { to: "/network", icon: "hub", label: "Network" },
  { to: "/mentors", icon: "groups", label: "Mentors" },
  { to: "/societies", icon: "diversity_3", label: "Societies" },
];

const societyLinks = [{ to: "/society/manage", icon: "article", label: "Content Management" }];

const societyNestedLinks = [
  {
    icon: "group",
    label: "Manage Members",
    links: [
      { to: "/society/member-requests", label: "Member Requests" },
      { to: "/society/profile", label: "Society Profile" },
      { to: "/society/settings", label: "Society Settings" },
    ],
  },
  {
    icon: "how_to_reg",
    label: "Event Registrations",
    links: [
      { to: "/society/events", label: "All Events" },
      { to: "/society/create", label: "Create Event" },
    ],
  },
];

const mentorNestedLinks = [
  { to: "/mentor/dashboard", icon: "school", label: "Mentor Dashboard" },
  {
    icon: "person_add",
    label: "Manage Mentees",
    links: [
      { to: "/mentor-mentees", label: "All Mentees" },
      { to: "/mentor-events", label: "Mentor Events" },
    ],
  },
  {
    icon: "forum",
    label: "Mentorship Sessions",
    links: [
      { to: "/mentor-sessions", label: "Mentor Sessions" },
      { to: "/my-sessions", label: "My Sessions" },
    ],
  },
];

const footerLinks = [
  { to: "/profile/view", icon: "settings", label: "Settings" },
  { to: "/logout", icon: "logout", label: "Logout" },
];

function SectionLabel({ children, isDark }) {
  return (
    <p
      className={`px-1 text-xs font-semibold uppercase tracking-[0.16em] ${
        isDark ? "text-[#8b949e]" : "text-[#6b7280]"
      }`}
    >
      {children}
    </p>
  );
}

function getNavItemClasses(isDark, isActive) {
  if (isActive) {
    return isDark
      ? "border-[#30363d] bg-[#21262d] text-[#e6edf3] shadow-[0_10px_24px_rgba(0,0,0,0.18)]"
      : "border-[#dbe4ee] bg-[#f8fafc] text-[#0f172a] shadow-[0_10px_24px_rgba(15,23,42,0.06)]";
  }

  return isDark
    ? "border-transparent text-[#c9d1d9] hover:border-[#30363d] hover:bg-[#161b22] hover:text-[#e6edf3]"
    : "border-transparent text-[#475569] hover:border-[#e2e8f0] hover:bg-[#f8fafc] hover:text-[#0f172a]";
}

function getIconClasses(isDark, isActive) {
  if (isActive) {
    return isDark ? "text-[#58a6ff]" : "text-[#0f172a]";
  }

  return isDark ? "text-[#8b949e] group-hover:text-[#e6edf3]" : "text-[#94a3b8] group-hover:text-[#0f172a]";
}

function SurfaceCard({ children, isDark, className = "" }) {
  return (
    <div
      className={`rounded-[26px] border ${
        isDark
          ? "border-[#30363d] bg-[#161b22] shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
          : "border-[#dbe4ee] bg-white shadow-[0_14px_32px_rgba(15,23,42,0.05)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}

function NavItem({ to, icon, label, isDark }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium transition-all duration-200 ${getNavItemClasses(
          isDark,
          isActive
        )}`
      }
    >
      {({ isActive }) => (
        <>
          <span className={`material-symbols-outlined text-[20px] ${getIconClasses(isDark, isActive)}`}>{icon}</span>
          <span className="truncate">{label}</span>
        </>
      )}
    </NavLink>
  );
}

function NestedGroup({ icon, label, links, isDark }) {
  return (
    <div className="flex flex-col gap-2">
      <div
        className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-medium ${
          isDark ? "text-[#c9d1d9]" : "text-[#0f172a]"
        }`}
      >
        <span className={`material-symbols-outlined text-[20px] ${isDark ? "text-[#8b949e]" : "text-[#94a3b8]"}`}>
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>

      <div className={`ml-5 flex flex-col gap-1 border-l pl-4 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-xl border px-3 py-2.5 text-sm transition-all duration-200 ${getNavItemClasses(isDark, isActive)}`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const isDark = useHomeTheme();

  return (
    <aside
      className={`hidden shrink-0 lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[288px] lg:flex-col lg:justify-between lg:overflow-y-auto lg:p-5 xl:w-72 ${
        isDark ? "bg-[#0d1117] text-[#c9d1d9]" : "bg-[#f8fafc] text-[#0f172a]"
      }`}
    >
      <div className="flex flex-col gap-5">
        <SurfaceCard isDark={isDark} className="p-5">
          <div className="flex items-center gap-3">
            <div
              className="size-11 rounded-2xl bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuByHDKs6VLKKg0tivmOOz9TQ-8vono2ty3KY16w06RsABgFGlPaZBbajp_j7DnJ8M2TWVe9YUs_ziqa5E1inc09THc6UAqVQpNASwI1BAPi-du_2FupZ21f-RAAHcnZdVlgytCuoAILhOCB7Op93usaVvDKvYhPdJDKDxMdnVNYB7gSi_c6jZuNe67pgvBT9L6vc4htdTQ6s4lXm7w6g3jooaDixQvdx8VJwcO2ZUQ0ILQly30bWli-W6oMNM_8tzX6_8haj1KXJUk")',
              }}
            />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className={`text-lg font-semibold ${isDark ? "text-white" : "text-[#0f172a]"}`}>CampusNexus</h1>
                <span
                  className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-[0.12em] ${
                    isDark
                      ? "border-[#30363d] bg-[#0d1117] text-[#58a6ff]"
                      : "border-[#dbe4ee] bg-[#f8fafc] text-[#475569]"
                  }`}
                >
                  HUB
                </span>
              </div>
              <p className={`mt-1 text-xs ${isDark ? "text-[#8b949e]" : "text-[#6b7280]"}`}>Dashboard navigation</p>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard isDark={isDark} className="p-4">
          <nav className="flex flex-col gap-2">
            {primaryLinks.map((link) => (
              <NavItem key={link.to} {...link} isDark={isDark} />
            ))}
          </nav>
        </SurfaceCard>

        <SurfaceCard isDark={isDark} className="p-4">
          <div className="space-y-6">
            <div className="space-y-3">
              <SectionLabel isDark={isDark}>Society HQ</SectionLabel>
              <div className="flex flex-col gap-2">
                {societyLinks.map((link) => (
                  <NavItem key={link.to} {...link} isDark={isDark} />
                ))}
                {societyNestedLinks.map((group) => (
                  <NestedGroup key={group.label} {...group} isDark={isDark} />
                ))}
              </div>
            </div>

            <div className={`border-t pt-5 ${isDark ? "border-[#30363d]" : "border-[#e2e8f0]"}`}>
              <div className="space-y-3">
                <SectionLabel isDark={isDark}>Mentor HQ</SectionLabel>
                <div className="flex flex-col gap-2">
                  {mentorNestedLinks.map((item) =>
                    item.to ? (
                      <NavItem key={item.to} {...item} isDark={isDark} />
                    ) : (
                      <NestedGroup key={item.label} {...item} isDark={isDark} />
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>

      <SurfaceCard isDark={isDark} className="p-4">
        <nav className="flex flex-col gap-2">
          {footerLinks.map((link) => (
            <NavItem key={link.to} {...link} isDark={isDark} />
          ))}
        </nav>
      </SurfaceCard>
    </aside>
  );
}
