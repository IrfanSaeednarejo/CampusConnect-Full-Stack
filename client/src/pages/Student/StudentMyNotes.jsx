import { Link } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import AppSidebar from "../../components/layout/AppSidebar";
import PageTitle from "../../components/common/PageTitle";

export default function StudentMyNotes() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-background">
      <div className="layout-container flex h-full grow flex-col">
        <AppHeader searchPlaceholder="Search my notes..." />
        <div className="flex flex-1">
          <AppSidebar activeLink="/student/my-notes" />
          <main className="flex flex-1 flex-col gap-6 py-8 px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="flex flex-col gap-6">
              <PageTitle
                title="My Notes"
                subtitle="All the notes you've created and saved"
              />
              <div className="flex flex-col gap-4">
                <Link
                  to="/academics/notes/1"
                  className="flex items-center justify-between p-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#17cf60]/50 transition-all group"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <span className="material-symbols-outlined text-[#17cf60] text-3xl">
                      description
                    </span>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg group-hover:text-[#17cf60] transition-colors">
                        Advanced Calculus - Integration Techniques
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        Created on Oct 20, 2025 • Last edited 2 hours ago
                      </p>
                    </div>
                  </div>
                  <span className="text-white/40 text-sm ml-4">→</span>
                </Link>

                <Link
                  to="/academics/notes/2"
                  className="flex items-center justify-between p-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#17cf60]/50 transition-all group"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <span className="material-symbols-outlined text-blue-400 text-3xl">
                      description
                    </span>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg group-hover:text-[#17cf60] transition-colors">
                        Literature Review - Shakespeare's Sonnets
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        Created on Oct 18, 2025 • Last edited 5 days ago
                      </p>
                    </div>
                  </div>
                  <span className="text-white/40 text-sm ml-4">→</span>
                </Link>

                <Link
                  to="/academics/notes/3"
                  className="flex items-center justify-between p-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#17cf60]/50 transition-all group"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <span className="material-symbols-outlined text-purple-400 text-3xl">
                      description
                    </span>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg group-hover:text-[#17cf60] transition-colors">
                        History: World War II Timeline
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        Created on Oct 12, 2025 • Last edited 1 week ago
                      </p>
                    </div>
                  </div>
                  <span className="text-white/40 text-sm ml-4">→</span>
                </Link>

                <Link
                  to="/academics/notes/4"
                  className="flex items-center justify-between p-6 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#17cf60]/50 transition-all group"
                >
                  <div className="flex flex-1 items-center gap-4">
                    <span className="material-symbols-outlined text-green-400 text-3xl">
                      description
                    </span>
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg group-hover:text-[#17cf60] transition-colors">
                        Biology Lab Notes - DNA Sequencing
                      </h3>
                      <p className="text-white/60 text-sm mt-1">
                        Created on Oct 8, 2025 • Last edited 2 weeks ago
                      </p>
                    </div>
                  </div>
                  <span className="text-white/40 text-sm ml-4">→</span>
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
