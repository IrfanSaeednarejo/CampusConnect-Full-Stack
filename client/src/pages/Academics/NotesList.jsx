import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotes, selectAllNotes, selectNotesLoading } from "../../redux/slices/notesSlice";
import { getButtonClassName } from "../../components/common/Button";
import PageTitle from "../../components/common/PageTitle";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function NotesList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notes = useSelector(selectAllNotes);
  const loading = useSelector(selectNotesLoading);
  const isDark = useHomeTheme();

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const pageClass = isDark
    ? "bg-background-dark text-text-primary-dark"
    : "bg-background-light text-text-primary-light";
  const surfaceClass = isDark
    ? "border-border-dark bg-surface-dark"
    : "border-border-light bg-surface-light shadow-[0_16px_40px_rgba(15,23,42,0.06)]";
  const hoverSurfaceClass = isDark
    ? "hover:border-primary/30 hover:bg-[rgb(var(--color-surface-muted-dark)/1)]"
    : "hover:border-slate-300 hover:bg-[rgb(var(--color-surface-muted-light)/1)]";
  const titleClass = isDark ? "text-text-primary-dark" : "text-text-primary-light";
  const mutedClass = isDark ? "text-text-secondary-dark" : "text-text-secondary-light";
  const courseBadgeClass = isDark
    ? "border-border-dark bg-background-dark text-text-primary-dark"
    : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)] text-text-primary-light";

  return (
    <div className={`flex min-h-full flex-col p-8 ${pageClass}`}>
      <div className="mb-8 flex items-center justify-between">
        <PageTitle
          title="My Notes & Documents"
          subtitle="Keep your notes and class docs organized—all in one place."
          isDark={isDark}
        />
        <Link
          to="/notes/create"
          className={getButtonClassName({
            variant: "primary",
            size: "md",
            className: "gap-2",
          })}
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Note
        </Link>
      </div>

      {loading && notes.length === 0 ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : notes.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center gap-4 rounded-xl border px-4 py-16 text-center ${surfaceClass}`}
        >
          <div className="mb-4 text-primary/70">
            <span className="material-symbols-outlined text-[96px]">note_add</span>
          </div>

          <div className="flex max-w-[480px] flex-col items-center gap-2">
            <p className={`text-xl font-bold leading-tight tracking-tight ${titleClass}`}>
              No notes found
            </p>
            <p className={`text-sm font-normal leading-normal ${mutedClass}`}>
              Start by creating your first note or uploading study materials.
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <Link
              to="/notes/create"
              className={getButtonClassName({
                variant: "primary",
                size: "md",
                className: "gap-2",
              })}
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Create First Note
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <div
              key={note._id}
              onClick={() => navigate(`/notes/${note._id}`)}
              className={`group flex h-full cursor-pointer flex-col rounded-2xl border p-6 transition-all duration-300 ${surfaceClass} ${hoverSurfaceClass}`}
            >
              <div className="mb-4 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined">description</span>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${mutedClass}`}>
                  {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className={`mb-2 line-clamp-1 text-lg font-bold transition-colors ${titleClass}`}>
                {note.title}
              </h3>

              <p className={`mb-6 flex-grow line-clamp-3 text-sm leading-relaxed ${mutedClass}`}>
                {note.content.substring(0, 150)}
                {note.content.length > 150 ? "..." : ""}
              </p>

              {note.courseId && (
                <div className="mt-auto">
                  <span
                    className={`inline-flex items-center rounded-md border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${courseBadgeClass}`}
                  >
                    {note.courseId}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
