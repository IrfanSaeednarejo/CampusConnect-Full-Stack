import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AcademicsShell from "../../components/academics/AcademicsShell";
import NoteBreadcrumbs from "../../components/academics/NoteBreadcrumbs";
import NoteEditorToolbar from "../../components/academics/NoteEditorToolbar";

export default function NoteDetail() {
  const [isEditMode, setIsEditMode] = useState(false);
  const [noteContent, setNoteContent] = useState(
    `This lecture covered the fundamentals of data structures, including arrays, linked lists, and stacks. Key topics included Big O notation for analyzing algorithm efficiency and the practical applications of each data structure.\n\nKey takeaway: understanding the trade-offs between different structures is crucial for writing efficient code. The professor also assigned a new project due next Friday.`,
  );
  const navigate = useNavigate();

  return (
    <AcademicsShell>
      <div className="max-w-4xl mx-auto">
        <NoteBreadcrumbs currentLabel="CS101 Lecture 5 Recap" />

        {/* View Mode */}
        {!isEditMode && (
          <div id="view-mode">
            <header className="flex flex-wrap justify-between items-start gap-4 mb-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold text-[#24292f] dark:text-text-primary tracking-tight">
                  Note Details
                </h1>
                <h2 className="text-xl font-semibold text-[#57606a] dark:text-text-secondary">
                  CS101 Lecture 5 Recap
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative group">
                  <span className="material-symbols-outlined text-[#57606a] dark:text-text-secondary cursor-pointer">
                    share
                  </span>
                  <div className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-2 text-xs font-medium text-text-primary bg-surface border border-border rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-opacity dark:bg-surface hover:bg-surface-hover border border-border whitespace-nowrap">
                    You can share this note in your study group.
                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 dark:border-t-gray-700"></div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    alert("Downloading note: CS101 Lecture 5 Recap");
                    // Download logic here
                  }}
                  className="px-4 py-2 text-sm font-medium bg-gray-100 dark:bg-surface border border-[#d0d7de] dark:border-border rounded-lg hover:bg-gray-200 dark:hover:bg-surface hover:bg-surface-hover border border-border flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    download
                  </span>
                  Download
                </button>
                <button
                  onClick={() => {
                    if (confirm("Are you sure you want to delete this note?")) {
                      // Delete logic here
                      navigate("/academics/notes");
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-danger bg-danger/10 border border-[#EF4444]/20 rounded-lg hover:bg-danger/20"
                >
                  Delete
                </button>
                <button
                  onClick={() => setIsEditMode(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-opacity-90 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">
                    edit
                  </span>
                  Edit
                </button>
              </div>
            </header>
            <p className="text-sm text-[#57606a] dark:text-text-secondary mb-6">
              Last Edited: 2 days ago
            </p>
            <div className="p-6 bg-white dark:bg-surface border border-[#d0d7de] dark:border-border rounded-lg">
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-[#24292f] dark:text-text-primary">
                <p>
                  This lecture covered the fundamentals of data structures,
                  including arrays, linked lists, and stacks. Key topics
                  included Big O notation for analyzing algorithm efficiency
                  and the practical applications of each data structure.
                </p>
                <p>
                  Key takeaway: understanding the trade-offs between different
                  structures is crucial for writing efficient code. The
                  professor also assigned a new project due next Friday.
                </p>
                <ul>
                  <li>Arrays: Fast access, fixed size.</li>
                  <li>Linked Lists: Dynamic size, slower access.</li>
                  <li>Stacks: LIFO (Last-In, First-Out) principle.</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditMode && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4"
          id="edit-modal"
        >
          <div className="w-full max-w-4xl h-[90vh] bg-background border border-border rounded-xl flex flex-col shadow-2xl">
            <header className="flex justify-between items-center p-4 border-b border-border flex-shrink-0">
              <div className="flex flex-col">
                <h2 className="text-lg font-semibold text-text-primary">
                  Edit Note
                </h2>
                <p className="text-sm text-text-secondary">CS101 Lecture 5 Recap</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 text-sm font-medium bg-surface border border-border rounded-lg hover:bg-surface border border-border"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setIsEditMode(false)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-opacity-90"
                >
                  Save Changes
                </button>
              </div>
            </header>
            <div className="flex flex-col flex-grow min-h-0">
              <div className="p-2 border-b border-border flex-shrink-0">
                <NoteEditorToolbar
                  buttonClassName="p-2 rounded hover:bg-surface border border-border"
                  dividerClassName="w-px h-5 bg-[#C7D2FE] mx-1"
                />
              </div>
              <div className="flex-grow overflow-y-auto">
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full h-full p-6 bg-transparent focus:outline-none resize-none text-text-primary placeholder:text-text-secondary text-base leading-relaxed"
                  placeholder="Start writing your note..."
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </AcademicsShell>
  );
}
