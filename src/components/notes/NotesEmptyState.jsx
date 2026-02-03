import React from "react";

export default function NotesEmptyState({ onCreate }) {
  return (
    <div className="flex flex-col gap-4 py-8 px-4 rounded-lg bg-white/5 items-center justify-center text-center">
      <div className="text-primary/70">
        <svg
          className="lucide lucide-file-text"
          fill="none"
          height="96"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1"
          viewBox="0 0 24 24"
          width="96"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path>
          <path d="M14 2v4a2 2 0 0 0 2 2h4"></path>
          <path d="M10 9H8"></path>
          <path d="M16 13H8"></path>
          <path d="M16 17H8"></path>
        </svg>
      </div>
      <p className="text-white text-lg font-bold">No notes yet</p>
      <p className="text-white/60 text-sm">
        Create your first note to get started!
      </p>
      <button
        onClick={onCreate}
        className="mt-4 flex min-w-21 max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
      >
        <span className="material-symbols-outlined mr-2">add</span>
        <span className="truncate">Create Note</span>
      </button>
    </div>
  );
}
