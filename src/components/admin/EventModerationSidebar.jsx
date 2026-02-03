import React from "react";

/**
 * EventModerationSidebar
 * Sidebar navigation for event moderation admin
 */
const EventModerationSidebar = () => (
  <aside className="flex flex-col w-64 bg-[#1c2620]/50 border-r border-[#3c5345]">
    <div className="flex flex-col grow p-4 gap-4">
      <div className="flex items-center gap-3 px-2">
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          data-alt="CampusConnect logo"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDy3ev-mP4qJ7V0eORfqQzfQq9qHB1v24cuL7nYBSsyl_-Dd1iFexyJfUibv1H2_xKcB5tzcZyO5aRKNcnzopu5mnBnlG-5DIEE4okpa9ADwHG8MPMhqwGjDhGh2sQs_itcutnAXQ2wTMBJ-j9U4CRgYptipY1VByEtfMzxvHU-lYh4esWpkN-99sMNMzg4Ea1e22Fat70dfSRgbRqkniV5xxZN7e-XCI5Q4I3HWm58PnR1STe5zK4U3_m_lSRzEuZ5rtdvYfZPXqo")',
          }}
        ></div>
        <div className="flex flex-col">
          <h1 className="text-white text-base font-medium leading-normal">
            Admin
          </h1>
          <p className="text-[#9db8a8] text-sm font-normal leading-normal">
            CampusConnect
          </p>
        </div>
      </div>
      <nav className="flex flex-col gap-2 mt-4">
        <button className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#29382f] rounded-lg">
          <span className="material-symbols-outlined">dashboard</span>
          <p className="text-sm font-medium leading-normal">Dashboard</p>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#17cf60]/20 text-white">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            calendar_today
          </span>
          <p className="text-sm font-medium leading-normal">Events</p>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#29382f] rounded-lg">
          <span className="material-symbols-outlined">group</span>
          <p className="text-sm font-medium leading-normal">Mentorship</p>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#29382f] rounded-lg">
          <span className="material-symbols-outlined">groups</span>
          <p className="text-sm font-medium leading-normal">Societies</p>
        </button>
        <button className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#29382f] rounded-lg">
          <span className="material-symbols-outlined">person</span>
          <p className="text-sm font-medium leading-normal">Profile</p>
        </button>
      </nav>
    </div>
    <div className="flex flex-col gap-1 p-4 border-t border-[#3c5345]">
      <button className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#29382f] rounded-lg">
        <span className="material-symbols-outlined">settings</span>
        <p className="text-sm font-medium leading-normal">Settings</p>
      </button>
      <button className="flex items-center gap-3 px-3 py-2 text-white/70 hover:text-white hover:bg-[#29382f] rounded-lg">
        <span className="material-symbols-outlined">logout</span>
        <p className="text-sm font-medium leading-normal">Log out</p>
      </button>
    </div>
  </aside>
);

export default EventModerationSidebar;
