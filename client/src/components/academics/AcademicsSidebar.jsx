import { Link } from "react-router-dom";

const navItems = [
  {
    to: "/student/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    to: "/events",
    icon: "event",
    label: "Events",
  },
  {
    to: "/mentorship-hub",
    icon: "groups",
    label: "Mentorship",
  },
  {
    to: "/academics/notes",
    icon: "description",
    label: "Notes",
  },
  {
    to: "/societies",
    icon: "work",
    label: "Societies",
  },
];

const footerItems = [
  {
    to: "/student/profile",
    icon: "settings",
    label: "Settings",
  },
  {
    to: "/student/notifications",
    icon: "notifications",
    label: "Notifications",
  },
  {
    to: "/login",
    icon: "logout",
    label: "Logout",
  },
];

export default function AcademicsSidebar({ activePath = "/academics/notes" }) {
  return (
    <aside className="flex-shrink-0 w-64 bg-white dark:bg-surface border-r border-[#d0d7de] dark:border-border flex flex-col justify-between p-4">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3 px-2">
          <span className="material-symbols-outlined text-primary text-3xl">
            school
          </span>
          <h1 className="text-lg font-bold text-[#24292f] dark:text-text-primary">
            CampusConnect
          </h1>
        </div>
        <div className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = item.to === activePath;
            return (
              <Link
                key={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  isActive
                    ? "bg-primary/20 text-primary"
                    : "text-[#24292f] dark:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
                to={item.to}
              >
                <span
                  className={`material-symbols-outlined ${
                    isActive ? "font-bold" : ""
                  }`}
                >
                  {item.icon}
                </span>
                <span className={`text-sm ${isActive ? "font-bold" : "font-medium"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {footerItems.map((item) => (
          <Link
            key={item.to}
            className="flex items-center gap-3 px-3 py-2 text-[#24292f] dark:text-text-primary hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            to={item.to}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </Link>
        ))}
      </div>
    </aside>
  );
}
