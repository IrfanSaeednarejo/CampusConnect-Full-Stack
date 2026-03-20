import AppHeader from "../../components/layout/AppHeader";
import AppSidebar from "../../components/layout/AppSidebar";
import PageTitle from "../../components/common/PageTitle";
import NoteCard from "../../components/common/NoteCard";

export default function StudentPersonalNotes() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#0d1117]">
      <div className="layout-container flex h-full grow flex-col">
        <AppHeader searchPlaceholder="Search notes..." />
        <div className="flex flex-1">
          <AppSidebar activeLink="/student/personal-notes" />
          <main className="flex flex-1 flex-col gap-6 py-8 px-4 sm:px-8 md:px-12 lg:px-20">
            <div className="flex flex-col gap-6">
              <PageTitle
                title="Personal Notes"
                subtitle="Your private collection of notes and academic materials"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <NoteCard
                  id="1"
                  title="Biology: Cell Structure"
                  description="Comprehensive notes on prokaryotic and eukaryotic cells including organelle functions..."
                  date="2025-10-15"
                  course="Biology"
                  to="/academics/notes/1"
                />
                <NoteCard
                  id="2"
                  title="Chemistry: Bonding Types"
                  description="Detailed explanation of ionic, covalent, and metallic bonds with visual diagrams..."
                  date="2025-10-10"
                  course="Chemistry"
                  to="/academics/notes/2"
                />
                <NoteCard
                  id="3"
                  title="Physics: Newton's Laws"
                  description="Explanation of Newton's three laws of motion with real-world applications..."
                  date="2025-10-05"
                  course="Physics"
                  to="/academics/notes/3"
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
