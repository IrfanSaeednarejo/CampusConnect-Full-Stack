import React from "react";

export default function NoteHeader() {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 dark:border-white/10 px-4 sm:px-6 lg:px-10 py-3">
      <div className="flex items-center gap-8">
        <div className="flex items-center gap-4 text-white">
          <div className="size-4 text-primary">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            CampusConnect
          </h2>
        </div>
        <div className="hidden md:flex items-center gap-9">
          <button className="text-white/80 hover:text-white text-sm font-medium leading-normal">
            Dashboard
          </button>
          <button className="text-white/80 hover:text-white text-sm font-medium leading-normal">
            Events
          </button>
          <button className="text-white/80 hover:text-white text-sm font-medium leading-normal">
            Mentoring
          </button>
          <button className="text-white text-sm font-medium leading-normal">
            My Notes
          </button>
        </div>
      </div>
      <div className="flex flex-1 justify-end items-center gap-4">
        <button className="flex max-w-120 cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <div
          className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
          data-alt="User profile picture"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAwPkX38cMduqAbM1iPeroWBqll9PvaQ45gvsqnAvIm8CCKVFhLnCV31kqc3Y397nX_XkVgo8qEyNxwSQ3bcyHdfmjlVpMu8r8312oqf6bVj25vOlRUEgN3b6dqBgegxhP8kiKtprVnuFTahYJ1uQgKx_3bWz57SKKNIIs-N4NwYpP1ULvEynsEzNemOKo-ARkReEOpkaeKUdXhwgcI3Xx3Pnrygui3H2E5QONkuKjVGX-THk75HQxtTeDyhCRJhRntbjn901qdjJ8")',
          }}
        ></div>
      </div>
    </header>
  );
}
