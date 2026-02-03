import React from "react";

export default function ContactTabs({ activeTab, setActiveTab }) {
  return (
    <div className="flex border-b border-gray-200 dark:border-[#30363d] gap-2 sm:gap-4 flex-wrap">
      <button
        onClick={() => setActiveTab("all")}
        className={`flex flex-col items-center justify-center border-b-[3px] ${activeTab === "all" ? "border-b-[#238636]" : "border-b-transparent"} px-2 pb-2 pt-2`}
      >
        <p
          className={`text-sm font-semibold ${activeTab === "all" ? "text-[#238636]" : "text-gray-600 dark:text-[#8b949e]"}`}
        >
          All
        </p>
      </button>
      <button
        onClick={() => setActiveTab("new")}
        className={`flex flex-col items-center justify-center border-b-[3px] ${activeTab === "new" ? "border-b-[#238636]" : "border-b-transparent"} px-2 pb-2 pt-2`}
      >
        <p
          className={`text-sm font-semibold ${activeTab === "new" ? "text-[#238636]" : "text-gray-600 dark:text-[#8b949e] hover:text-gray-800 dark:hover:text-[#e6edf3]"}`}
        >
          New
        </p>
      </button>
      <button
        onClick={() => setActiveTab("in-progress")}
        className={`flex flex-col items-center justify-center border-b-[3px] ${activeTab === "in-progress" ? "border-b-[#238636]" : "border-b-transparent"} px-2 pb-2 pt-2`}
      >
        <p
          className={`text-sm font-semibold ${activeTab === "in-progress" ? "text-[#238636]" : "text-gray-600 dark:text-[#8b949e] hover:text-gray-800 dark:hover:text-[#e6edf3]"}`}
        >
          In Progress
        </p>
      </button>
      <button
        onClick={() => setActiveTab("resolved")}
        className={`flex flex-col items-center justify-center border-b-[3px] ${activeTab === "resolved" ? "border-b-[#238636]" : "border-b-transparent"} px-2 pb-2 pt-2`}
      >
        <p
          className={`text-sm font-semibold ${activeTab === "resolved" ? "text-[#238636]" : "text-gray-600 dark:text-[#8b949e] hover:text-gray-800 dark:hover:text-[#e6edf3]"}`}
        >
          Resolved
        </p>
      </button>
    </div>
  );
}
