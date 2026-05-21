import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { BookOpen, FileText, NotebookPen, Sparkles } from "lucide-react";
import { createNoteThunk } from "../../redux/slices/notesSlice";
import AcademicsShell from "../../components/academics/AcademicsShell";
import NoteBreadcrumbs from "../../components/academics/NoteBreadcrumbs";
import NoteEditorToolbar from "../../components/academics/NoteEditorToolbar";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";

const noteTips = [
  "Capture lecture highlights while details are still fresh.",
  "Use the optional course field to keep revision material organized.",
  "Keep titles specific so your notes stay easy to scan later.",
];

export default function CreateNote() {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const handleSave = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      return toast.error("Title and content are required.");
    }

    setIsSubmitting(true);
    try {
      await dispatch(
        createNoteThunk({
          title: noteTitle.trim(),
          content: noteContent.trim(),
          courseId: courseId.trim() || undefined,
          campusId: user?.campusId,
          type: "personal",
        })
      ).unwrap();

      toast.success("Note created successfully!");
      navigate("/notes");
    } catch (err) {
      toast.error(err || "Failed to create note");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageClassName = isDark
    ? "bg-[#0d1117] text-[#e6edf3]"
    : "bg-[#f8fafc] text-[#0f172a]";
  const surfaceClassName = isDark
    ? "border-[#30363d] bg-[#161b22] shadow-[0_20px_60px_rgba(0,0,0,0.28)]"
    : "border-[#dbe4ee] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]";
  const mutedTextClassName = isDark ? "text-[#8b949e]" : "text-[#64748b]";
  const titleClassName = isDark ? "text-[#e6edf3]" : "text-[#0f172a]";
  const subtleSurfaceClassName = isDark
    ? "border-[#30363d] bg-[#0d1117]"
    : "border-[#e2e8f0] bg-[#f8fafc]";
  const accentBadgeClassName = isDark
    ? "border-[#30363d] bg-[#0d1117] text-[#58a6ff]"
    : "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]";
  const toolbarButtonClassName = isDark
    ? "flex h-9 min-w-9 items-center justify-center rounded-lg border border-transparent px-2 text-sm font-medium text-[#8b949e] transition-colors hover:border-[#30363d] hover:bg-[#21262d] hover:text-[#e6edf3]"
    : "flex h-9 min-w-9 items-center justify-center rounded-lg border border-transparent px-2 text-sm font-medium text-[#64748b] transition-colors hover:border-[#dbe4ee] hover:bg-white hover:text-[#0f172a]";
  const toolbarDividerClassName = isDark
    ? "mx-1 h-5 w-px bg-[#30363d]"
    : "mx-1 h-5 w-px bg-[#dbe4ee]";
  const textAreaClassName = isDark
    ? "text-[#e6edf3] placeholder:text-[#8b949e]"
    : "text-[#0f172a] placeholder:text-[#94a3b8]";

  return (
    <AcademicsShell className={`${pageClassName} transition-colors duration-300`}>
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:gap-8">
        <NoteBreadcrumbs currentLabel="Create New Note" />

        <section
          className={`rounded-[28px] border p-6 transition-colors duration-300 sm:p-8 ${surfaceClassName}`}
        >
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] ${accentBadgeClassName}`}
                >
                  <NotebookPen className="h-3.5 w-3.5" />
                  NOTE WORKSPACE
                </span>
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${subtleSurfaceClassName} ${mutedTextClassName}`}
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  Personal note
                </span>
              </div>

              <div className="space-y-3">
                <h1 className={`text-3xl font-bold tracking-tight ${titleClassName}`}>
                  Create New Note
                </h1>
                <p className={`max-w-2xl text-sm leading-6 sm:text-base ${mutedTextClassName}`}>
                  Write lecture notes, revision points, or quick ideas in one clean
                  workspace designed for focused academic drafting.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className={`rounded-2xl border p-4 ${subtleSurfaceClassName}`}>
                  <p className={`text-xs font-medium uppercase tracking-[0.12em] ${mutedTextClassName}`}>
                    Draft Type
                  </p>
                  <p className={`mt-2 text-lg font-medium ${titleClassName}`}>Personal</p>
                </div>
                <div className={`rounded-2xl border p-4 ${subtleSurfaceClassName}`}>
                  <p className={`text-xs font-medium uppercase tracking-[0.12em] ${mutedTextClassName}`}>
                    Campus Scope
                  </p>
                  <p className={`mt-2 text-lg font-medium ${titleClassName}`}>Linked</p>
                </div>
                <div className={`rounded-2xl border p-4 ${subtleSurfaceClassName}`}>
                  <p className={`text-xs font-medium uppercase tracking-[0.12em] ${mutedTextClassName}`}>
                    Save Flow
                  </p>
                  <p className={`mt-2 text-lg font-medium ${titleClassName}`}>One-click</p>
                </div>
              </div>
            </div>

            <div className="w-full xl:max-w-sm">
              <div className={`rounded-2xl border p-4 sm:p-5 ${subtleSurfaceClassName}`}>
                <div className="mb-4 flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                      isDark ? "bg-[#21262d] text-[#58a6ff]" : "bg-[#eff6ff] text-[#1d4ed8]"
                    }`}
                  >
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <p className={`text-lg font-medium ${titleClassName}`}>Writing guide</p>
                    <p className={`text-sm ${mutedTextClassName}`}>Keep your notes clear and searchable.</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {noteTips.map((tip) => (
                    <div
                      key={tip}
                      className={`rounded-xl border px-4 py-3 text-sm leading-6 ${subtleSurfaceClassName} ${mutedTextClassName}`}
                    >
                      {tip}
                    </div>
                  ))}
                </div>

                <FormActions
                  onCancel={() => navigate("/notes")}
                  onSubmit={handleSave}
                  cancelText="Cancel"
                  submitText="Save Note"
                  submitIcon="save"
                  submitting={isSubmitting}
                  isDark={isDark}
                  className="mt-5 flex-col sm:flex-row xl:flex-col"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className={`rounded-[28px] border p-5 sm:p-6 ${surfaceClassName}`}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  label="Note Title *"
                  name="noteTitle"
                  type="text"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g., CS101 Lecture 5 Recap"
                  isDark={isDark}
                />
                <FormField
                  label="Course / Subject (Optional)"
                  name="courseId"
                  type="text"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  placeholder="e.g., CS101"
                  isDark={isDark}
                />
              </div>

              <div className={`overflow-hidden rounded-[24px] border ${subtleSurfaceClassName}`}>
                <div
                  className={`flex flex-col gap-4 border-b px-4 py-4 sm:flex-row sm:items-center sm:justify-between ${subtleSurfaceClassName}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                        isDark ? "bg-[#21262d] text-[#58a6ff]" : "bg-[#eff6ff] text-[#1d4ed8]"
                      }`}
                    >
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className={`text-xl font-semibold ${titleClassName}`}>Note Content</h2>
                      <p className={`text-sm ${mutedTextClassName}`}>
                        Draft your note below. Formatting controls remain available at the top.
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-xs font-medium ${accentBadgeClassName}`}
                  >
                    Editor ready
                  </span>
                </div>

                <div className={`border-b px-3 py-2 ${subtleSurfaceClassName}`}>
                  <NoteEditorToolbar
                    buttonClassName={toolbarButtonClassName}
                    dividerClassName={toolbarDividerClassName}
                  />
                </div>

                <div className={isDark ? "bg-[#0d1117]" : "bg-white"}>
                  <textarea
                    value={noteContent}
                    onChange={(e) => setNoteContent(e.target.value)}
                    className={`min-h-[360px] w-full resize-y bg-transparent p-4 text-base leading-7 focus:outline-none sm:min-h-[420px] sm:p-5 ${textAreaClassName}`}
                    placeholder="Start writing your note here..."
                  />
                </div>
              </div>
            </div>
          </div>

          <aside className="flex flex-col gap-6">
            <div className={`rounded-[28px] border p-5 sm:p-6 ${surfaceClassName}`}>
              <h2 className={`text-xl font-semibold ${titleClassName}`}>Note checklist</h2>
              <p className={`mt-2 text-sm leading-6 ${mutedTextClassName}`}>
                Before saving, make sure your title is clear and your content is ready to revisit later.
              </p>

              <div className="mt-5 space-y-3">
                {[
                  "Add a descriptive title",
                  "Include course code if needed",
                  "Review spelling and structure",
                ].map((item) => (
                  <div
                    key={item}
                    className={`rounded-xl border px-4 py-3 text-sm ${subtleSurfaceClassName} ${mutedTextClassName}`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            <div className={`rounded-[28px] border p-5 sm:p-6 ${surfaceClassName}`}>
              <h2 className={`text-xl font-semibold ${titleClassName}`}>Quick context</h2>
              <div className="mt-5 grid grid-cols-1 gap-3">
                <div className={`rounded-xl border p-4 ${subtleSurfaceClassName}`}>
                  <p className={`text-sm font-medium ${titleClassName}`}>Title field</p>
                  <p className={`mt-1 text-sm leading-6 ${mutedTextClassName}`}>
                    Required for saving your note successfully.
                  </p>
                </div>
                <div className={`rounded-xl border p-4 ${subtleSurfaceClassName}`}>
                  <p className={`text-sm font-medium ${titleClassName}`}>Course field</p>
                  <p className={`mt-1 text-sm leading-6 ${mutedTextClassName}`}>
                    Optional, but useful when filtering study material later.
                  </p>
                </div>
                <div className={`rounded-xl border p-4 ${subtleSurfaceClassName}`}>
                  <p className={`text-sm font-medium ${titleClassName}`}>Editor area</p>
                  <p className={`mt-1 text-sm leading-6 ${mutedTextClassName}`}>
                    Large drafting space with the same save behavior you already have.
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </section>
      </div>
    </AcademicsShell>
  );
}
