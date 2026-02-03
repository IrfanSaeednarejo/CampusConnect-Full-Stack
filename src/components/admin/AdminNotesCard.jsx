import React from "react";
import Button from "../../common/Button";

export default function AdminNotesCard({ notes = [], onAddNote }) {
  return (
    <div className="bg-card-dark border border-border-dark rounded-lg p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Admin Notes</h3>
      <div className="space-y-4">
        {notes.map((note, idx) => (
          <div key={idx} className="border-l-2 border-border-dark pl-4">
            <p className="text-sm text-text-primary-dark">{note.text}</p>
            <p className="text-xs text-text-secondary-dark mt-1">
              {note.author} - {note.date}
            </p>
          </div>
        ))}
      </div>
      <textarea
        className="mt-4 w-full bg-background-dark border border-border-dark rounded-md p-2 text-sm placeholder:text-text-secondary-dark focus:ring-1 focus:ring-link-dark focus:border-link-dark"
        placeholder="Add a new note..."
        rows={3}
      />
      <Button
        className="mt-2 w-full text-center text-sm"
        variant="secondary"
        onClick={onAddNote}
      >
        Add Note
      </Button>
    </div>
  );
}
