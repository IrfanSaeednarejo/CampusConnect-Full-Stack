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

export default function NoteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const note = useSelector(selectSelectedNote);
  const loading = useSelector(selectNotesLoading);

  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete this note? This action cannot be undone.")) {
      try {
        await dispatch(deleteNoteThunk(id)).unwrap();
        toast.success("Note deleted successfully");
        navigate("/notes");
      } catch (err) {
        toast.error(err || "Failed to delete note");
      }
    }
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
          <div className="w-8 h-8 border-4 border-[#238636] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </AcademicsShell>
    );
  }

  if (!note) {
    return (
      <AcademicsShell>
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center h-[60vh]">
            <h1 className="text-2xl font-bold text-white mb-2">Note not found</h1>
            <p className="text-[#8b949e] mb-6">This note either doesn't exist or you don't have access to it.</p>
            <button 
                onClick={() => navigate("/notes")}
                className="px-6 py-2.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-xl text-white font-medium transition-all"
            >
                Back to Notes
            </button>
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
                <h1 className="text-3xl font-bold text-[#c9d1d9] tracking-tight">
                  {note.title}
                </h1>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-[#8b949e]">
                    Last Updated: {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                    </span>
                    {note.courseId && (
                        <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-widest font-bold bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
                            {note.courseId}
                        </span>
                    )}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#238636] rounded-xl hover:bg-[#2ea043] flex items-center gap-2 shadow-lg shadow-[#238636]/20 transition-all"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit Note
                </button>
                <div className="h-8 w-px bg-[#30363d] hidden sm:block"></div>
                <button
                  onClick={handleDelete}
                  className="w-10 h-10 flex items-center justify-center text-[#f85149] bg-transparent border border-[#f85149]/30 rounded-xl hover:bg-[#f85149]/10 transition-all"
                  title="Delete Note"
                >
                    <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            </header>
            
            <div className="p-8 bg-[#161b22] border border-[#30363d] rounded-2xl shadow-xl min-h-[400px]">
              <div className="prose prose-invert max-w-none text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">
                  {note.content}
              </div>
            </div>
          </div>
        )}

        {/* Edit View */}
        {isEditMode && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-[#161b22] border border-[#30363d] shadow-2xl rounded-2xl p-6 mt-4 flex flex-col h-[75vh]">
            <header className="flex justify-between items-center pb-4 border-b border-[#30363d] flex-shrink-0">
              <div className="flex-1 mr-6">
                <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full bg-transparent border-none text-2xl font-bold text-white focus:outline-none focus:ring-0 placeholder-[#8b949e]"
                    placeholder="Note Title"
                />
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={() => setIsEditMode(false)}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-bold bg-[#0d1117] text-[#c9d1d9] border border-[#30363d] rounded-xl hover:bg-[#21262d] transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 text-sm font-bold text-white bg-[#238636] rounded-xl hover:bg-[#2ea043] disabled:opacity-50 transition-all shadow-lg flex items-center gap-2"
                >
                  {isSaving ? (
                      <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Saving...
                      </>
                  ) : "Save Changes"}
                </button>
              </div>
            </header>
            
            <div className="flex flex-col flex-grow min-h-0 pt-4">
              <div className="pb-4 flex-shrink-0">
                <NoteEditorToolbar
                  buttonClassName="p-2 rounded-lg hover:bg-[#21262d] text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
                  dividerClassName="w-px h-6 bg-[#30363d] mx-2"
                />
              </div>
              <div className="flex-grow bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden p-1">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full h-full p-5 bg-transparent focus:outline-none resize-none text-[#c9d1d9] placeholder-[#8b949e] text-base leading-relaxed"
                  placeholder="Start writing your note..."
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </AcademicsShell>
  );
}
