import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";

export default function VerificationPending() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-background overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-6 sm:px-10 lg:px-20 py-4">
        <div className="flex items-center gap-4 text-text-primary">
          <div className="size-6 text-[#20df60]">
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
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
            CampusConnect
          </h2>
        </div>
        <div className="flex items-center gap-4">
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-surface border border-border text-text-secondary hover:bg-surface border border-border transition-colors">
            <span className="material-symbols-outlined text-xl">
              notifications
            </span>
          </button>
          <Avatar
            src=""
            size="10"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="relative flex w-full max-w-2xl flex-col items-center justify-center text-center">
          {/* Background Icon */}
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <span
              className="material-symbols-outlined text-text-primary/5"
              style={{ fontSize: "20rem" }}
            >
              hourglass_top
            </span>
          </div>

          {/* Content Card */}
          <div className="w-full flex flex-col items-center gap-8 rounded-xl border border-border bg-white/[.02] p-8 shadow-2xl shadow-black/20 backdrop-blur-sm">
            {/* Heading */}
            <div className="flex flex-col gap-3">
              <p className="text-4xl font-black leading-tight tracking-[-0.033em] text-text-primary">
                Verification in Progress
              </p>
              <p className="text-base font-normal leading-normal text-text-secondary max-w-md">
                Your mentor application is under review. We'll notify you once
                it's approved.
              </p>
            </div>

            {/* Info Box and Button */}
            <div className="flex w-full max-w-sm flex-col gap-4">
              <div className="flex items-center gap-4 rounded-lg bg-gray-200/5 border border-border px-4 py-3">
                <div className="flex items-center justify-center text-[#20df60]">
                  <span className="material-symbols-outlined text-2xl">
                    info
                  </span>
                </div>
                <p className="flex-1 text-left text-sm font-normal leading-normal text-text-secondary">
                  Average review time: 1-3 business days
                </p>
              </div>

              <button
                onClick={() => navigate("/student/dashboard")}
                className="flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full transition-transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="truncate">Back to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
