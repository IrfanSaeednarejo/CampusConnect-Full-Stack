import { Link, useLocation } from "react-router-dom";

export default function AppSidebar({ activeLink = "" }) {
  const location = useLocation();

  const isActive = (path) => location.pathname === path || activeLink === path;

  const sidebarLinks = [
    { path: "/student/dashboard", label: "Dashboard", icon: "dashboard" },
    {
      path: "/student/personal-notes",
      label: "Personal Notes",
      icon: "note_stack",
    },
    { path: "/student/my-notes", label: "My Notes", icon: "description" },
  ];

  return (
    <aside className="flex w-64 flex-col gap-6 border-r border-white/10 p-5 hidden md:flex">
      <nav className="flex flex-col gap-2">
        {sidebarLinks.map((link) => (
          <Link
            key={link.path}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              isActive(link.path)
                ? "bg-white/5 text-white"
                : "text-white/60 hover:bg-white/5 hover:text-white"
            }`}
            to={link.path}
          >
            <span className="material-symbols-outlined !text-base">
              {link.icon}
            </span>
            <span className="truncate">{link.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
