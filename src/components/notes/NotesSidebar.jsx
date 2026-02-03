import React from "react";

export default function NotesSidebar({ activeTab, setActiveTab }) {
  return (
    <aside className="w-64 flex-col gap-6 border-r border-white/10 p-5 md:flex">
      <nav className="flex flex-col gap-2">
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "personal"
              ? "bg-white/5 text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-base!">
            description
          </span>
          <span className="truncate">Personal Notes</span>
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === "files"
              ? "bg-white/5 text-white"
              : "text-white/60 hover:bg-white/5 hover:text-white"
          }`}
        >
          <span className="material-symbols-outlined text-base!">
            folder_open
          </span>
          <span className="truncate">Uploaded Files</span>
        </button>
      </nav>
    </aside>
  );
}
