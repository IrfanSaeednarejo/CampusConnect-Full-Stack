import React from "react";

export default function NotFound() {
  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-text-light dark:text-text-dark h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="flex max-w-lg flex-col items-center text-center">
        {/* Page Heading */}
        <div className="w-full">
          <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-tight text-text-light dark:text-text-dark">
            Page Not Found (404)
          </h1>
          <p className="mt-3 text-base leading-normal text-slate-500 dark:text-slate-400">
            Oops! The page you’re looking for doesn’t exist or has been moved.
          </p>
        </div>

        {/* Button Group */}
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
          <a
            href="#"
            className="flex h-10 cursor-pointer items-center justify-center rounded-lg bg-primary px-4 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-background-dark"
          >
            Go to Dashboard
          </a>
          <a
            href="#"
            className="flex h-10 cursor-pointer items-center justify-center rounded-lg border border-gray-300 dark:border-border-dark bg-transparent px-4 text-sm font-medium text-text-light dark:text-text-dark transition-colors hover:bg-gray-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-background-dark"
          >
            Return Home
          </a>
        </div>

        {/* Meta Text */}
        <div className="mt-8 w-full">
          <p className="text-sm leading-normal text-slate-500 dark:text-slate-400">
            Check your link or{" "}
            <a href="#" className="underline hover:text-primary">
              contact support
            </a>{" "}
            if you’re lost.
          </p>
        </div>
      </div>
    </div>
  );
}
