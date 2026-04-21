import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import { createNoteThunk } from "../../redux/slices/notesSlice";
import AcademicsShell from "../../components/academics/AcademicsShell";
import NoteBreadcrumbs from "../../components/academics/NoteBreadcrumbs";
import NoteEditorToolbar from "../../components/academics/NoteEditorToolbar";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import { useAuth } from "../../hooks/useAuth";

export default function CreateNote() {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [courseId, setCourseId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();

  const handleSave = async () => {
    if (!noteTitle.trim() || !noteContent.trim()) {
      return toast.error("Title and content are required.");
    }
    
    setIsSubmitting(true);
    try {
      await dispatch(createNoteThunk({
        title: noteTitle.trim(),
        content: noteContent.trim(),
        courseId: courseId.trim() || undefined,
        campusId: user?.campusId,
        type: "personal"
      })).unwrap();
      
      toast.success("Note created successfully!");
      navigate("/notes");
    } catch (err) {
      toast.error(err || "Failed to create note");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AcademicsShell>
      <div className="max-w-4xl mx-auto">
        <NoteBreadcrumbs currentLabel="Create New Note" />

        <div className="flex flex-col gap-6">
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-[#c9d1d9] tracking-tight">
                Create New Note
              </h1>
              <p className="text-sm text-[#8b949e]">
                Write your thoughts, lecture notes, or study materials
              </p>
            </div>
            <FormActions
              onCancel={() => navigate("/notes")}
              onSubmit={handleSave}
              cancelText="Cancel"
              submitText="Save Note"
              submitIcon="save"
              submitting={isSubmitting}
              className="flex-row-reverse justify-start"
            />
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField
              label="Note Title *"
              name="noteTitle"
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g., CS101 Lecture 5 Recap"
            />
            <FormField
              label="Course / Subject (Optional)"
              name="courseId"
              type="text"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="e.g., CS101"
            />
          </div>

          {/* Rich Text Editor Simulation */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-2 border-b border-[#30363d]">
              <NoteEditorToolbar
                buttonClassName="p-2 rounded hover:bg-gray-800 text-[#8b949e] hover:text-[#c9d1d9]"
                dividerClassName="w-px h-5 bg-[#30363d] mx-1"
              />
            </div>
            <div className="flex-1 bg-[#0d1117]">
               <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                className="w-full h-full min-h-[350px] p-4 bg-transparent focus:outline-none resize-y text-[#c9d1d9] placeholder:text-[#8b949e] text-base leading-relaxed"
                placeholder="Start writing your note here..."
              />
            </div>
          </div>
        </div>
      </div>
    </AcademicsShell>
  );
}
