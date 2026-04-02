import AcademicsSidebar from "./AcademicsSidebar";

export default function AcademicsShell({
  children,
  activePath = "/academics/notes",
  mainClassName = "",
}) {
  return (
    <div className="flex min-h-screen bg-[#f6f7f8] dark:bg-background">
      <AcademicsSidebar activePath={activePath} />
      <main className={`flex-1 p-6 lg:p-8 ${mainClassName}`}>{children}</main>
    </div>
  );
}
