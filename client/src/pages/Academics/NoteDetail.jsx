import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { 
  getNoteByIdThunk, 
  updateNoteThunk, 
  deleteNoteThunk, 
  selectSelectedNote, 
  selectNotesLoading 
} from "../../redux/slices/notesSlice";
import AcademicsShell from "../../components/academics/AcademicsShell";
import NoteBreadcrumbs from "../../components/academics/NoteBreadcrumbs";
import NoteEditorToolbar from "../../components/academics/NoteEditorToolbar";
import Button from "../../components/common/Button";
import ConfirmModal from "../../components/common/ConfirmModal";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const note = useSelector(selectSelectedNote);
  const loading = useSelector(selectNotesLoading);
  const isDark = useHomeTheme();

  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [confirmState, setConfirmState] = useState({ isOpen: false });

  useEffect(() => {
    if (id) {
      dispatch(getNoteByIdThunk(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (note && isEditMode) {
      setEditTitle(note.title);
      setEditContent(note.content);
    }
  }, [note, isEditMode]);

  const handleDelete = () => {
    setConfirmState({
      isOpen: true,
      title: "Delete Note",
      message: `Are you sure you want to delete "${note.title}"? This action is permanent and cannot be undone.`,
      confirmText: "Delete Note",
      variant: "danger",
      onConfirm: async () => {
        try {
          await dispatch(deleteNoteThunk(id)).unwrap();
          toast.success("Note deleted successfully");
          navigate("/notes");
        } catch (err) {
          toast.error(err || "Failed to delete note");
        } finally {
          setConfirmState({ isOpen: false });
        }
      }
    });
  };

  const handleSave = async () => {
    if (!editTitle.trim() || !editContent.trim()) {
      return toast.error("Title and content cannot be empty.");
    }
    
    setIsSaving(true);
    try {
      await dispatch(updateNoteThunk({
        id,
        data: {
          title: editTitle.trim(),
          content: editContent.trim()
        }
      })).unwrap();
      toast.success("Note updated successfully");
      setIsEditMode(false);
    } catch (err) {
      toast.error(err || "Failed to update note");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading && !note) {
    return (
      <AcademicsShell>
        <div className="flex justify-center items-center h-[60vh]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AcademicsShell>
    );
  }

  if (!note) {
    return (
      <AcademicsShell>
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh]">
            <h1 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Note not found</h1>
            <p className={`mb-6 ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>This note either doesn't exist or you don't have access to it.</p>
            <Button onClick={() => navigate("/notes")} variant="secondary">
                Back to Notes
            </Button>
        </div>
      </AcademicsShell>
    );
  }

  return (
    <AcademicsShell>
      <div className="max-w-4xl mx-auto pb-12">
        <NoteBreadcrumbs currentLabel={note.title} />

        {/* View Mode */}
        {!isEditMode && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 mt-2">
              <div className="flex flex-col gap-2">
                <h1 className={`text-3xl font-bold tracking-tight ${isDark ? "text-text-primary-dark" : "text-slate-900"}`}>
                  {note.title}
                </h1>
                <div className="flex items-center gap-3">
                    <span className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>
                    Last Updated: {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                    </span>
                    {note.courseId && (
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold ${isDark ? "bg-surface-dark text-text-primary-dark border border-border-dark" : "bg-slate-100 text-slate-700 border border-slate-200"}`}>
                            {note.courseId}
                        </span>
                    )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button onClick={() => setIsEditMode(true)} variant="primary" className="shadow-lg shadow-green-900/20">
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Note
                </Button>
                <div className={`h-8 w-px hidden sm:block ${isDark ? "bg-border-dark" : "bg-slate-200"}`}></div>
                <Button onClick={handleDelete} variant="danger" size="icon-md" title="Delete Note">
                    <span className="material-symbols-outlined text-xl">delete</span>
                </Button>
              </div>
            </header>
            
            <div className={`p-8 rounded-2xl shadow-xl min-h-[400px] ${isDark ? "bg-surface-dark border border-border-dark" : "bg-white border border-slate-200"}`}>
              <div className={`prose max-w-none whitespace-pre-wrap leading-relaxed ${isDark ? "prose-invert text-text-primary-dark" : "text-slate-700"}`}>
                  {note.content}
              </div>
            </div>
          </div>
        )}

        {/* Edit View */}
        {isEditMode && (
          <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-2xl rounded-2xl p-6 mt-4 flex flex-col h-[75vh] ${isDark ? "bg-surface-dark border border-border-dark" : "bg-white border border-slate-200"}`}>
            <header className={`flex justify-between items-center pb-4 border-b flex-shrink-0 ${isDark ? "border-border-dark" : "border-slate-200"}`}>
              <div className="flex-1 mr-6">
                <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className={`w-full bg-transparent border-none text-2xl font-bold focus:outline-none focus:ring-0 ${isDark ? "text-white placeholder:text-text-secondary-dark" : "text-slate-900 placeholder:text-slate-400"}`}
                    placeholder="Note Title"
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Button onClick={() => setIsEditMode(false)} disabled={isSaving} variant="secondary">
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} variant="primary" className="shadow-lg flex items-center gap-2">
                  {isSaving ? (
                      <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                      </>
                  ) : "Save Changes"}
                </Button>
              </div>
            </header>
            
            <div className="flex flex-col flex-grow min-h-0 pt-4">
              <div className="pb-4 flex-shrink-0">
                <NoteEditorToolbar
                  buttonClassName={`p-2 rounded-lg transition-colors ${isDark ? "hover:bg-[#21262d] text-text-secondary-dark hover:text-text-primary-dark" : "hover:bg-slate-100 text-slate-500 hover:text-slate-900"}`}
                  dividerClassName={`w-px h-6 mx-2 ${isDark ? "bg-border-dark" : "bg-slate-200"}`}
                />
              </div>
              <div className={`flex-grow rounded-xl overflow-hidden p-1 ${isDark ? "bg-background-dark border border-border-dark" : "bg-slate-50 border border-slate-200"}`}>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={`w-full h-full p-5 bg-transparent focus:outline-none resize-none text-base leading-relaxed ${isDark ? "text-text-primary-dark placeholder:text-text-secondary-dark" : "text-slate-700 placeholder:text-slate-400"}`}
                  placeholder="Start writing your note..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState({ isOpen: false })} 
      />
    </AcademicsShell>
  );
}
