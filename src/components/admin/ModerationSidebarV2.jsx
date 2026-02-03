import React from "react";

export default function ModerationSidebarV2() {
  return (
    <aside className="flex w-64 flex-col border-r border-zinc-200/50 dark:border-zinc-800 bg-background-light dark:bg-background-dark p-4">
      <div className="flex h-full flex-col justify-between">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="size-6 text-primary">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold">CampusConnect</h2>
          </div>
          <nav className="flex flex-col gap-2">
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <span className="material-symbols-outlined">dashboard</span>
              Dashboard
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <span className="material-symbols-outlined">calendar_today</span>
              Events
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <span className="material-symbols-outlined">group</span>
              Mentorship
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <span className="material-symbols-outlined">groups</span>
              Societies
            </button>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary/10 text-primary dark:text-primary">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                shield
              </span>
              Content Moderation
            </button>
          </nav>
        </div>
        <div className="flex flex-col gap-2">
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <span className="material-symbols-outlined">settings</span>
            Settings
          </button>
          <button className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <span className="material-symbols-outlined">logout</span>
            Log out
          </button>
        </div>
      </div>
    </aside>
  );
}
