import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AcademicsShell from "../../components/academics/AcademicsShell";
import NoteBreadcrumbs from "../../components/academics/NoteBreadcrumbs";
import NoteEditorToolbar from "../../components/academics/NoteEditorToolbar";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";

export default function CreateNote() {
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const navigate = useNavigate();

  const handleSave = () => {
    // Handle save logic here
    navigate("/academics/notes");
  };

  return (
    <AcademicsShell>
      <div className="max-w-4xl mx-auto">
        <NoteBreadcrumbs currentLabel="Create New Note" />

        <div className="flex flex-col gap-6">
          <header className="flex justify-between items-center">
            <div className="flex flex-col gap-1">
              <h1 className="text-3xl font-bold text-[#24292f] dark:text-text-primary tracking-tight">
                Create New Note
              </h1>
              <p className="text-sm text-[#57606a] dark:text-text-secondary">
                Write your thoughts, lecture notes, or study materials
              </p>
            </div>
            <FormActions
              onCancel={() => navigate("/academics/notes")}
              onSubmit={handleSave}
              cancelText="Cancel"
              submitText="Save Note"
              submitIcon="save"
              className="flex-row-reverse justify-start"
            />
          </header>

          {/* Note Title Input */}
          <FormField
            label="Note Title"
            name="noteTitle"
            type="text"
            value={noteTitle}
            onChange={(e) => setNoteTitle(e.target.value)}
            placeholder="e.g., CS101 Lecture 5 Recap"
          />

          {/* Rich Text Editor */}
          <div className="bg-white dark:bg-surface border border-[#d0d7de] dark:border-border rounded-lg overflow-hidden">
            <div className="p-2 border-b border-[#d0d7de] dark:border-border">
              <NoteEditorToolbar
                buttonClassName="p-2 rounded hover:bg-gray-100 dark:hover:bg-surface hover:bg-surface-hover border border-border"
                dividerClassName="w-px h-5 bg-[#d0d7de] dark:bg-[#C7D2FE] mx-1"
              />
            </div>
            <textarea
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full h-96 p-4 bg-transparent focus:outline-none resize-y text-[#24292f] dark:text-text-primary placeholder:text-[#57606a] dark:placeholder:text-text-secondary"
              placeholder="Start writing your note..."
            />
          </div>
        </div>
      </div>
    </AcademicsShell>
  );
}
