import { Link } from "react-router-dom";
import AppHeader from "../../components/layout/AppHeader";
import AppSidebar from "../../components/layout/AppSidebar";
import PageTitle from "../../components/common/PageTitle";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getStudentTheme } from "./studentTheme";

const NOTES = [
  {
    to: "/academics/notes/1",
    title: "Advanced Calculus - Integration Techniques",
    meta: "Created on Oct 20, 2025 - Last edited 2 hours ago",
  },
  {
    to: "/academics/notes/2",
    title: "Literature Review - Shakespeare's Sonnets",
    meta: "Created on Oct 18, 2025 - Last edited 5 days ago",
  },
  {
    to: "/academics/notes/3",
    title: "History: World War II Timeline",
    meta: "Created on Oct 12, 2025 - Last edited 1 week ago",
  },
  {
    to: "/academics/notes/4",
    title: "Biology Lab Notes - DNA Sequencing",
    meta: "Created on Oct 8, 2025 - Last edited 2 weeks ago",
  },
];

export default function StudentMyNotes() {
  const isDark = useHomeTheme();
  const theme = getStudentTheme(isDark);

  return (
    <div className={cn("relative flex min-h-screen w-full flex-col overflow-x-hidden", theme.page)}>
      <div className="layout-container flex h-full grow flex-col">
        <AppHeader searchPlaceholder="Search my notes..." />
        <div className="flex flex-1">
          <AppSidebar activeLink="/student/my-notes" />
          <main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-8 md:px-12 lg:px-20">
            <section className={cn("flex flex-col gap-6 rounded-[28px] border p-6 sm:p-8", theme.hero)}>
              <PageTitle
                title="My Notes"
                subtitle="All the notes you've created and saved"
                isDark={isDark}
              />

              <div className="flex flex-col gap-4">
                {NOTES.map((note) => (
                  <Link
                    key={note.to}
                    to={note.to}
                    className={cn(
                      "group flex items-center justify-between rounded-[24px] border p-6 transition-all",
                      theme.card
                    )}
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <span
                        className={cn(
                          "material-symbols-outlined text-3xl",
                          isDark ? "text-[#17cf60]" : "text-slate-500"
                        )}
                      >
                        description
                      </span>
                      <div className="flex-1">
                        <h3 className={cn("text-lg font-medium", theme.text)}>{note.title}</h3>
                        <p className={cn("mt-1 text-sm", theme.muted)}>{note.meta}</p>
                      </div>
                    </div>
                    <span className={cn("material-symbols-outlined text-xl", theme.muted)}>arrow_forward</span>
                  </Link>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
