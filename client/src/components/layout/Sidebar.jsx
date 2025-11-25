import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// --- Sidebar Link ---
export function SidebarLink({ icon, label, badge, to, active }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => to && navigate(to)}
      className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
        active
          ? "bg-[#238636]/30 border-l-2 border-[#238636]"
          : "hover:bg-[#21262d]"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`material-symbols-outlined text-xl ${
            active ? "text-[#238636]" : "text-[#8b949e]"
          }`}
        >
          {icon}
        </span>
        <span className={`text-sm font-medium ${active ? "text-white" : ""}`}>
          {label}
        </span>
      </div>
      {badge !== undefined && (
        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-[#238636] rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

// --- Collapsible Section ---
export function CollapsibleSection({ icon, label, items }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Expand automatically if child route is active
  useEffect(() => {
    const isChildActive = items.some(
      (item) =>
        location.pathname === `/events/${item.toLowerCase().replace(/\s/g, "")}`
    );
    if (isChildActive) setOpen(true);
  }, [location.pathname, items]);

  return (
    <div className="flex flex-col">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left ${
          open ? "bg-[#21262d]" : "hover:bg-[#21262d]"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-lg text-[#8b949e]">
            {icon}
          </span>
          <span>{label}</span>
        </div>
        <span className="material-symbols-outlined text-base text-[#8b949e]">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="flex flex-col mt-1 pl-4 border-l border-[#21262d] ml-4">
          {items.map((item) => {
            const path = `/events/${item.toLowerCase().replace(/\s/g, "")}`;
            return (
              <SidebarLink
                key={item}
                icon="-"
                label={item}
                to={path}
                active={location.pathname === path}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

// --- Sidebar ---
export default function SocietySidebar() {
  const location = useLocation();

  return (
    <aside className="w-64 h-240  bg-[#0d1117] flex flex-col justify-between p-4 text-[#c9d1d9]">
      {/* Top Branding */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2 px-2 pt-2">
          <div
            className="bg-center aspect-square bg-cover rounded-full size-8"
            style={{
              backgroundImage:
                'url("https://lh3.googleusercontent.com/aida-public/AB6AXuByHDKs6VLKKg0tivmOOz9TQ-8vono2ty3KY16w06RsABgFGlPaZBbajp_j7DnJ8M2TWVe9YUs_ziqa5E1inc09THc6UAqVQpNASwI1BAPi-du_2FupZ21f-RAAHcnZdVlgytCuoAILhOCB7Op93usaVvDKvYhPdJDKDxMdnVNYB7gSi_c6jZuNe67pgvBT9L6vc4htdTQ6s4lXm7w6g3jooaDixQvdx8VJwcO2ZUQ0ILQly30bWli-W6oMNM_8tzX6_8haj1KXJUk")',
            }}
          />
          <h1 className="text-white text-lg font-semibold">CampusConnect</h1>
        </div>

        {/* Top Links */}
        <nav className="flex flex-col gap-2">
          <SidebarLink
            icon="calendar_month"
            label="Events"
            to="/events"
            active={location.pathname === "/events/registerevent"}
          />
          <SidebarLink
            icon="notifications"
            label="Notifications"
            badge={3}
            to="/notifications"
            active={location.pathname === "/notifications"}
          />
          <SidebarLink
            icon="groups"
            label="Mentors"
            to="/mentors"
            active={location.pathname === "/mentors"}
          />
          <SidebarLink
            icon="diversity_3"
            label="Societies"
            to="/societies"
            active={location.pathname === "/societies"}
          />
        </nav>
      </div>

      {/* Middle Section */}
      <div className="flex-grow">
        <hr className="border-t border-[#21262d] my-4" />
        <div className="flex flex-col gap-1">
          <h2 className="px-3 text-xs font-semibold uppercase text-[#8b949e] tracking-wider mb-1">
            Society HQ
          </h2>
          <SidebarLink
            icon="dashboard"
            label="Dashboard"
            to="/dashboard"
            active={location.pathname === "/dashboard"}
          />
          <div className="flex flex-col mt-1 pl-4 border-l border-[#21262d] ml-4">
            <SidebarLink
              icon="article"
              label="Content Management"
              to="/content"
              active={location.pathname === "/content"}
            />
            <CollapsibleSection
              icon="group"
              label="Manage Members"
              items={["Chess Club", "Debate Team", "Coding Society"]}
            />
            <CollapsibleSection
              icon="how_to_reg"
              label="Event Registrations"
              items={["Chess Club", "Debate Team"]}
              active={location.pathname.startsWith("/events/registerevent")}
            />
          </div>
        </div>
      </div>

      {/* Bottom Links */}
      <nav className="flex flex-col gap-1">
        <SidebarLink
          icon="settings"
          label="Settings"
          to="/settings"
          active={location.pathname === "/settings"}
        />
        <SidebarLink
          icon="logout"
          label="Logout"
          to="/logout"
          active={location.pathname === "/logout"}
        />
      </nav>
    </aside>
  );
}
