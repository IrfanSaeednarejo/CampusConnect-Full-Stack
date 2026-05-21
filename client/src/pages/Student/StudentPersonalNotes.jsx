import AppHeader from "../../components/layout/AppHeader";
import AppSidebar from "../../components/layout/AppSidebar";
import PageTitle from "../../components/common/PageTitle";
import NoteCard from "../../components/common/NoteCard";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getStudentTheme } from "./studentTheme";

export default function StudentPersonalNotes() {
  const isDark = useHomeTheme();
  const theme = getStudentTheme(isDark);

  return (
    <div className={cn("relative flex min-h-screen w-full flex-col overflow-x-hidden", theme.page)}>
      <div className="layout-container flex h-full grow flex-col">
        <AppHeader searchPlaceholder="Search notes..." />
        <div className="flex flex-1">
          <AppSidebar activeLink="/student/personal-notes" />
          <main className="flex flex-1 flex-col gap-6 px-4 py-8 sm:px-8 md:px-12 lg:px-20">
            <section className={cn("flex flex-col gap-6 rounded-[28px] border p-6 sm:p-8", theme.hero)}>
              <PageTitle
                title="Personal Notes"
                subtitle="Your private collection of notes and academic materials"
                isDark={isDark}
              />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <NoteCard
                  id="1"
                  title="Biology: Cell Structure"
                  description="Comprehensive notes on prokaryotic and eukaryotic cells including organelle functions..."
                  date="2025-10-15"
                  course="Biology"
                  to="/academics/notes/1"
                  isDark={isDark}
                />
                <NoteCard
                  id="2"
                  title="Chemistry: Bonding Types"
                  description="Detailed explanation of ionic, covalent, and metallic bonds with visual diagrams..."
                  date="2025-10-10"
                  course="Chemistry"
                  to="/academics/notes/2"
                  isDark={isDark}
                />
                <NoteCard
                  id="3"
                  title="Physics: Newton's Laws"
                  description="Explanation of Newton's three laws of motion with real-world applications..."
                  date="2025-10-05"
                  course="Physics"
                  to="/academics/notes/3"
                  isDark={isDark}
                />
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
