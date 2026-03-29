import React from 'react';

export default function NoteEditorToolbar({ buttonClassName = "", dividerClassName = "" }) {
  return (
    <div className="flex gap-1 items-center bg-[#f6f8fa] dark:bg-[#161b22] px-2 py-1 select-none">
      <button className={buttonClassName} onClick={(e) => e.preventDefault()}>B</button>
      <button className={buttonClassName} onClick={(e) => e.preventDefault()}>I</button>
      <button className={buttonClassName} onClick={(e) => e.preventDefault()}>U</button>
      <div className={dividerClassName} />
      <button className={buttonClassName} onClick={(e) => e.preventDefault()}>H1</button>
      <button className={buttonClassName} onClick={(e) => e.preventDefault()}>H2</button>
      <div className={dividerClassName} />
      <button className={buttonClassName} onClick={(e) => e.preventDefault()}>List</button>
    </div>
  );
}
