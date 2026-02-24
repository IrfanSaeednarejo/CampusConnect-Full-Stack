import { Link } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import AppSidebar from "../../components/layout/AppSidebar";
import PageTitle from "../../components/common/PageTitle";

export default function NotesList() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#0d1117]">
      <div className="layout-container flex h-full grow flex-col">
        <AppHeader searchPlaceholder="Search notes" />
        <div className="flex flex-1">
          <AppSidebar activeLink="/student/personal-notes" />
          <main className="flex flex-1 flex-col gap-6 py-8 px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="flex flex-col gap-6">
              <PageTitle
                title="My Notes & Documents"
                subtitle="Keep your notes and class docs organized—all in one place."
              />
              <div className="flex flex-col gap-4 py-8 px-4 rounded-lg bg-white/5 items-center justify-center text-center">
                <div className="text-[#17cf60]/70">
                  <svg
                    className="lucide lucide-file-text"
                    fill="none"
                    height="96"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1"
                    viewBox="0 0 24 24"
                    width="96"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
                    <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
                    <path d="M10 9H8"></path>
                    <path d="M16 13H8"></path>
                    <path d="M16 17H8"></path>
                  </svg>
                </div>
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                    No notes yet
                  </p>
                  <p className="text-white/60 text-sm font-normal leading-normal">
                    Start by creating a note or uploading a file.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-3 mt-4">
                  <Link
                    to="/academics/notes/create"
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#17cf60] text-[#112117] text-sm font-bold leading-normal tracking-[0.015em] gap-2"
                  >
                    <span className="material-symbols-outlined">add</span>
                    <span className="truncate">Add New Note</span>
                  </Link>
                  <button
                    onClick={() => {
                      const input = document.createElement("input");
                      input.type = "file";
                      input.accept = ".pdf,.doc,.docx,.txt,.jpg,.png";
                      input.onchange = (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // File upload logic here
                          alert(`File "${file.name}" uploaded successfully!`);
                        }
                      };
                      input.click();
                    }}
                    className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2"
                  >
                    <span className="material-symbols-outlined">
                      upload_file
                    </span>
                    <span className="truncate">Upload Document</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
