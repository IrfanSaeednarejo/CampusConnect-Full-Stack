import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchNotes, selectAllNotes, selectNotesLoading } from "../../redux/slices/notesSlice";
import PageTitle from "../../components/common/PageTitle";

export default function NotesList() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const notes = useSelector(selectAllNotes);
  const loading = useSelector(selectNotesLoading);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  return (
    <div className="flex flex-col min-h-screen bg-[#0d1117] p-8">
      <div className="flex items-center justify-between mb-8">
        <PageTitle
          title="My Notes & Documents"
          subtitle="Keep your notes and class docs organized—all in one place."
        />
        <Link
            to="/notes/create"
            className="flex items-center justify-center rounded-xl h-10 px-5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-bold transition-all shadow-lg shadow-[#238636]/20 gap-2"
        >
            <span className="material-symbols-outlined text-sm">add</span>
            New Note
        </Link>
      </div>

      {loading && notes.length === 0 ? (
        <div className="flex justify-center items-center h-64">
             <div className="w-8 h-8 border-4 border-[#238636] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : notes.length === 0 ? (
        <div className="flex flex-col gap-4 py-16 px-4 rounded-xl bg-[#161b22] border border-[#30363d] items-center justify-center text-center">
            <div className="text-[#238636]/70 mb-4">
                <span className="material-symbols-outlined text-[96px]">note_add</span>
            </div>
            
            <div className="flex max-w-[480px] flex-col items-center gap-2">
            <p className="text-white text-xl font-bold leading-tight tracking-tight">
                No notes found
            </p>
            <p className="text-[#8b949e] text-sm font-normal leading-normal">
                Start by creating your first note or uploading study materials.
            </p>
            </div>
            
            <div className="flex justify-center mt-6">
                <Link
                    to="/notes/create"
                    className="flex cursor-pointer items-center justify-center rounded-xl h-10 px-6 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-bold transition-all gap-2 shadow-lg"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Create First Note
                </Link>
            </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
                <div 
                    key={note._id}
                    onClick={() => navigate(`/notes/${note._id}`)}
                    className="bg-[#161b22] border border-[#30363d] hover:border-[#238636]/50 rounded-2xl p-6 cursor-pointer hover:bg-[#1c2128] transition-all duration-300 group shadow-sm flex flex-col h-full"
                >
                    <div className="flex items-start justify-between mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#238636]/10 flex items-center justify-center text-[#238636] group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">description</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#8b949e]">
                            {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                        </span>
                    </div>

                    <h3 className="text-[#c9d1d9] text-lg font-bold mb-2 group-hover:text-white transition-colors line-clamp-1">
                        {note.title}
                    </h3>

                    <p className="text-[#8b949e] text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
                        {note.content.substring(0, 150)}{note.content.length > 150 ? "..." : ""}
                    </p>

                    {note.courseId && (
                        <div className="mt-auto">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#21262d] text-[#c9d1d9] border border-[#30363d]">
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
