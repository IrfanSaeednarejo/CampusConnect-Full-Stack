import React from "react";
// Lucide Icons (only for UI presentation)
import { Bell, MessageSquare, Search, SearchX } from "lucide-react";

// Note: All functionality (state, hooks, event handlers, Firebase, modals) has been removed.
// This component is purely presentational, displaying the static UI.

export default function NoResults() {
  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark px-4 sm:px-6 lg:px-10 py-3 bg-surface-dark/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3 text-text-primary-dark">
              <div className="size-6 text-primary">
                {/* Logo SVG */}
                <svg
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v4h-2zm0 6h2v2h-2z" />
                </svg>
              </div>
              <h2 className="text-text-primary-dark text-lg font-bold leading-tight tracking-[-0.015em]">
                CampusConnect
              </h2>
            </div>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-6">
              <a
                className="text-text-secondary-dark hover:text-text-primary-dark text-sm font-medium leading-normal transition-colors"
                href="#"
              >
                Dashboard
              </a>
              <a
                className="text-text-secondary-dark hover:text-text-primary-dark text-sm font-medium leading-normal transition-colors"
                href="#"
              >
                Mentors
              </a>
              <a
                className="text-text-secondary-dark hover:text-text-primary-dark text-sm font-medium leading-normal transition-colors"
                href="#"
              >
                Societies
              </a>
              <a
                className="text-text-secondary-dark hover:text-text-primary-dark text-sm font-medium leading-normal transition-colors"
                href="#"
              >
                Events
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search Input (Now purely static) */}
            <label className="hidden lg:flex flex-col min-w-40 h-9 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-DEFAULT h-full">
                <div className="text-text-secondary-dark flex border border-border-dark bg-background-dark items-center justify-center pl-3 rounded-l-DEFAULT border-r-0">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  aria-label="Search"
                  placeholder="Search..."
                  // Removed value/onChange/onKeyDown handlers
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-DEFAULT text-text-primary-dark focus:outline-0 focus:ring-1 focus:ring-primary/50 border border-border-dark bg-background-dark focus:border-primary/50 h-full placeholder:text-text-secondary-dark px-2.5 rounded-l-none border-l-0 text-sm font-normal leading-normal"
                />
              </div>
            </label>

            {/* Notifications and Messages */}
            <div className="flex gap-2">
              <button
                aria-label="Notifications"
                // Removed onClick handler
                className="flex cursor-pointer items-center justify-center rounded-DEFAULT h-9 w-9 bg-transparent hover:bg-white/10 text-text-secondary-dark hover:text-text-primary-dark transition-colors"
              >
                <Bell className="w-5 h-5" />
              </button>

              <button
                aria-label="Messages"
                // Removed onClick handler
                className="flex cursor-pointer items-center justify-center rounded-DEFAULT h-9 w-9 bg-transparent hover:bg-white/10 text-text-secondary-dark hover:text-text-primary-dark transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>

            {/* User Avatar */}
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-9 border-2 border-border-dark"
              style={{
                backgroundImage:
                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBfVup9g5rmWdpVyfuvPwTTI_JC7oeB-i8HjZarr6C823lMpht-RQHqPOtFWcjnOnyXzLsHlWD7UzjPhCOHuOFGadU6UcTStjZDjx5YP_tzV4D1y6CFrWRgKKqs3HuWCBGcd_ajcLYPCpULxpDDby0l75upRQvFh4kgArLMEepxNRiNOv8Uh1k1IEQZ40FsKAaxDVmHJfO73HQPXjQEEfW35z4JhZAUWGD-0dzG5vyTAEBo3GfkyUJQF3F-u7m0eWpB5jh5GS79ZgY")',
              }}
              role="img"
              aria-label="User avatar"
            />
          </div>
        </header>

        {/* Main Content: No Results Message */}
        <main className="flex flex-1 justify-center items-center py-10 px-4 sm:px-6 lg:px-8">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-col px-4 py-6 text-center">
              <div className="flex flex-col items-center gap-6">
                {/* Icon: Search Off */}
                <div className="flex items-center justify-center size-16 rounded-full bg-surface-dark border border-border-dark">
                  <SearchX className="w-8 h-8 text-text-secondary-dark" />
                </div>

                {/* Text */}
                <div className="flex max-w-[480px] flex-col items-center gap-2">
                  <h1 className="text-text-primary-dark text-2xl sm:text-3xl font-bold leading-tight tracking-tight">
                    No Results Found
                  </h1>
                  <p className="text-text-secondary-dark text-base font-normal leading-normal max-w-[480px] text-center">
                    We couldn’t find anything matching your search. Try
                    adjusting your filters or using different keywords.
                  </p>
                </div>

                {/* Actions (buttons are static links/placeholders now) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-4">
                  <button
                    // Removed onClick handler
                    className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-5 bg-border-dark hover:bg-text-secondary-dark/80 text-text-primary-dark text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
                  >
                    <span className="truncate">Clear Filters</span>
                  </button>

                  <button
                    // Removed onClick handler
                    className="flex w-full sm:w-auto min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-5 bg-green-500 hover:bg-primary/90 text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors"
                  >
                    <span className="truncate">Try a New Search</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex flex-col gap-6 px-5 py-10 text-center border-t border-solid border-border-dark mt-auto">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
            <a
              className="text-text-secondary-dark hover:text-text-primary-dark text-sm font-normal leading-normal transition-colors"
              href="#"
            >
              About
            </a>
            <a
              className="text-text-secondary-dark hover:text-text-primary-dark text-sm font-normal leading-normal transition-colors"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-text-secondary-dark hover:text-text-primary-dark text-sm font-normal leading-normal transition-colors"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-text-secondary-dark hover:text-text-primary-dark text-sm font-normal leading-normal transition-colors"
              href="#"
            >
              Contact
            </a>
          </div>

          <div className="flex flex-wrap justify-center gap-5">
            {/* Social Icons (Twitter, LinkedIn, Facebook SVGs) */}
            <a
              className="text-text-secondary-dark hover:text-text-primary-dark transition-colors"
              href="#"
              aria-label="Twitter"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
            <a
              className="text-text-secondary-dark hover:text-text-primary-dark transition-colors"
              href="#"
              aria-label="LinkedIn"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  clip-rule="evenodd"
                  d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.206v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.225-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-3.096 0 1.548 1.548 0 013.096 0zM6.55 8.165H3.456v8.59h3.094v-8.59zM17.668 1H6.332C3.935 1 2 2.932 2 5.332v13.336C2 21.068 3.935 23 6.332 23h11.336C20.065 23 22 21.068 22 18.668V5.332C22 2.932 20.065 1 17.668 1z"
                  fill-rule="evenodd"
                />
              </svg>
            </a>
            <a
              className="text-text-secondary-dark hover:text-text-primary-dark transition-colors"
              href="#"
              aria-label="Facebook"
            >
              <svg
                aria-hidden="true"
                className="h-5 w-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  clip-rule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  fill-rule="evenodd"
                />
              </svg>
            </a>
          </div>

          <p className="text-text-secondary-dark text-xs font-normal leading-normal">
            © 2024 CampusConnect. All rights reserved.
          </p>
        </footer>
      </div>

      {/* The MessageModal component and its usage have been removed */}
    </div>
  );
}
