// Loading.jsx
import React from "react";

const Loading = () => {
  return (
    <div className="relative flex h-screen w-full flex-col bg-background-dark dark:group/design-root overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <div className="flex flex-1 items-center justify-center p-4">
          <div className="layout-content-container flex flex-col max-w-md w-full items-center justify-center text-center">
            <h1 className="text-[#c9d1d9] tracking-tight text-3xl font-bold leading-tight px-4 pb-4">
              Loading CampusConnect...
            </h1>
            <div className="py-4">
              <svg
                className="animate-spin h-10 w-10 text-[#238636]"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <div className="flex flex-col gap-3 p-4 w-full">
              <div className="flex justify-center">
                <p className="text-[#c9d1d9] text-base font-medium leading-normal">
                  Bringing campus life to your screen!
                </p>
              </div>
            </div>
            <p className="text-[#8b949e] text-sm font-normal leading-normal pt-1 px-4 text-center absolute bottom-8">
              This should only take a moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Loading;
