import React from 'react';

export default function NoteEditorToolbar({ buttonClassName = "", dividerClassName = "" }) {
  const toolbarButtonClassName =
    buttonClassName ||
    "inline-flex h-8 min-w-8 items-center justify-center rounded-lg border border-border bg-surface px-2 text-xs font-medium text-text-primary transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
  const toolbarDividerClassName = dividerClassName || "mx-1 h-5 w-px bg-border";

  return (
    <div className="flex items-center gap-1 bg-surface-light px-2 py-1 text-text-primary-light select-none dark:bg-surface-dark dark:text-text-primary-dark">
      <button className={toolbarButtonClassName} onClick={(e) => e.preventDefault()}>B</button>
      <button className={toolbarButtonClassName} onClick={(e) => e.preventDefault()}>I</button>
      <button className={toolbarButtonClassName} onClick={(e) => e.preventDefault()}>U</button>
      <div className={toolbarDividerClassName} />
      <button className={toolbarButtonClassName} onClick={(e) => e.preventDefault()}>H1</button>
      <button className={toolbarButtonClassName} onClick={(e) => e.preventDefault()}>H2</button>
      <div className={toolbarDividerClassName} />
      <button className={toolbarButtonClassName} onClick={(e) => e.preventDefault()}>List</button>
    </div>
  );
}
