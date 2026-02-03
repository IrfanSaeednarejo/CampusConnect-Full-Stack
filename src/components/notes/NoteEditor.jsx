import React from "react";

export default function NoteEditor({ isEditing, noteContent, onChange }) {
  return (
    <div className="flex-1 rounded-lg bg-white/5 border border-white/10 p-6">
      {isEditing ? (
        <textarea
          className="w-full h-full min-h-125 bg-transparent text-white placeholder:text-white/40 resize-none focus:outline-none"
          value={noteContent}
          onChange={onChange}
          placeholder="Start writing your note..."
        />
      ) : (
        <div className="prose prose-invert max-w-none">
          <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
            {noteContent}
          </pre>
        </div>
      )}
    </div>
  );
}
