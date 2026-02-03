import React from "react";

export default function NoteActions({
  isEditing,
  onEdit,
  onDelete,
  onSave,
  onCancel,
}) {
  return (
    <div className="flex items-center gap-2">
      {isEditing ? (
        <>
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90"
          >
            Save
          </button>
        </>
      ) : (
        <>
          <button
            onClick={onEdit}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10"
          >
            <span className="material-symbols-outlined">delete</span>
          </button>
        </>
      )}
    </div>
  );
}
