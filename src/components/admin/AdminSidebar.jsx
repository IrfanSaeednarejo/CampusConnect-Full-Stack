import React from "react";

export default function AdminSidebar() {
  return (
    <aside className="flex h-screen flex-col bg-background-light dark:bg-background-dark border-r border-transparent dark:border-[#30363d] w-64">
      <div className="flex flex-col grow p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 px-2 py-2">
            <img
              className="rounded-full size-10"
              data-alt="CampusConnect logo placeholder"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYoMgr-AkUBgM8IciTgDqchfR6dqK7pnch3FWVfYUWrKznZPKqXm-ZPye9VPGd-nyoXxl_mVNBCLHu_kH5_tcQiqoWs0_siaU_S-SGY6wco9XPHBCXUqNmdx946-dpUzR4fdiNpQy5ScOhFS_V1nx5awleBS0KfTJXnR3V8AaPGjAp-xpcyrWpyo70tn4d8NTQuFs2wr_WV_BIash1ejxZPlh5T6OM6S43Sa0CzgDq-wUBi303KJiFvklplmxfrXwtwpa39Nxe1qU"
            />
            <div className="flex flex-col">
              <h1 className="text-gray-900 dark:text-[#e6edf3] text-base font-medium leading-normal">
                Admin
              </h1>
              <p className="text-gray-500 dark:text-[#8b949e] text-sm font-normal leading-normal">
                admin@campusconnect.edu
              </p>
            </div>
          </div>
          <nav className="flex flex-col gap-2 mt-4">
            <button className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-[#8b949e] rounded-lg hover:bg-gray-200 dark:hover:bg-[#161b22] transition-colors">
              <span className="material-symbols-outlined text-2xl">
                dashboard
              </span>
              <span className="text-sm font-medium">Dashboard</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-[#8b949e] rounded-lg hover:bg-gray-200 dark:hover:bg-[#161b22] transition-colors">
              <span className="material-symbols-outlined text-2xl">event</span>
              <span className="text-sm font-medium">Events</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-[#8b949e] rounded-lg hover:bg-gray-200 dark:hover:bg-[#161b22] transition-colors">
              <span className="material-symbols-outlined text-2xl">school</span>
              <span className="text-sm font-medium">Mentorship</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-[#8b949e] rounded-lg hover:bg-gray-200 dark:hover:bg-[#161b22] transition-colors">
              <span className="material-symbols-outlined text-2xl">group</span>
              <span className="text-sm font-medium">User Management</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 bg-[#238636]/20 text-[#238636] rounded-lg">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                mail
              </span>
              <span className="text-sm font-medium">Contact Messages</span>
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-[#8b949e] rounded-lg hover:bg-gray-200 dark:hover:bg-[#161b22] transition-colors">
              <span className="material-symbols-outlined text-2xl">
                settings
              </span>
              <span className="text-sm font-medium">Settings</span>
            </button>
          </nav>
        </div>
        <div className="mt-auto flex flex-col gap-1">
          <button className="flex items-center gap-3 px-3 py-2 text-gray-700 dark:text-[#8b949e] rounded-lg hover:bg-gray-200 dark:hover:bg-[#161b22] transition-colors">
            <span className="material-symbols-outlined text-2xl">help</span>
            <p className="text-sm font-medium leading-normal">Help Center</p>
          </button>
        </div>
      </div>
    </aside>
  );
}
