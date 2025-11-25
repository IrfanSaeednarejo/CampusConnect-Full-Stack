import React from "react";
import SocietySidebar from "../../components/layout/Sidebar"; // <- correct relative path

export default function GenralDashboard() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display flex h-screen">
      <SocietySidebar />
      <main className="flex-1 p-8">
        <div className="w-240 h-200 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">Main Content Area</p>
        </div>
      </main>
    </div>
  );
}
