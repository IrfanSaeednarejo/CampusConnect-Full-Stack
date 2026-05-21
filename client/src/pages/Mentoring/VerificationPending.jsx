import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import useHomeTheme from "../../hooks/useHomeTheme";
import Button from "../../components/common/Button";

export default function VerificationPending() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();

  return (
    <div
      className={`relative flex min-h-screen w-full flex-col overflow-x-hidden ${
        isDark ? "bg-background-dark" : "bg-background-light"
      }`}
    >
      <header
        className={`flex items-center justify-between whitespace-nowrap border-b px-6 py-4 sm:px-10 lg:px-20 ${
          isDark ? "border-white/10" : "border-slate-200 bg-white"
        }`}
      >
        <div className={`flex items-center gap-4 ${isDark ? "text-white" : "text-slate-900"}`}>
          <div className="size-6 text-primary">
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
            </svg>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">CampusNexus</h2>
        </div>

        <div className="flex items-center gap-4">
          <button
            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
              isDark ? "bg-white/5 text-gray-400 hover:bg-white/10" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            <span className="material-symbols-outlined text-xl">notifications</span>
          </button>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBsCR8JCZrNjBxIUHrbCh_RrUARldx_KD0SIQiEdoaiAxuyxNyE3mx4Neni-aXlQ-wvOwPEQsoZ-D-D41BS1evU_dcTmM7qg4xIoo0K0V4yNA7IrELWYvPdARuJu-FbUH3m307szO1nHrb-Y91i9U4arNskQNwi0jGpNOfVTpNwozGYL-bUjVGX7FXUUPexyCSw129bKqGOvw6kf8xbbrzgGC-EoAUR5mRfjX4mnIrNLbe2fzHHkzyyNg9Szw8eWgw0z5pECU0Ao6c"
            size="10"
          />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="relative flex w-full max-w-2xl flex-col items-center justify-center text-center">
          <div className="absolute inset-0 -z-10 flex items-center justify-center">
            <span
              className={`material-symbols-outlined ${isDark ? "text-white/5" : "text-slate-200"}`}
              style={{ fontSize: "20rem" }}
            >
              hourglass_top
            </span>
          </div>

          <div
            className={`flex w-full flex-col items-center gap-8 rounded-xl border p-8 backdrop-blur-sm ${
              isDark
                ? "border-white/10 bg-white/[.02] shadow-2xl shadow-black/20"
                : "border-slate-200 bg-white shadow-[0_24px_60px_rgba(15,23,42,0.10)]"
            }`}
          >
            <div className="flex flex-col gap-3">
              <p className={`text-4xl font-black leading-tight tracking-[-0.033em] ${isDark ? "text-white" : "text-slate-900"}`}>
                Verification in Progress
              </p>
              <p
                className={`max-w-md text-base font-normal leading-normal ${
                  isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
                }`}
              >
                Your mentor application is under review. We'll notify you once it's approved.
              </p>
            </div>

            <div className="flex w-full max-w-sm flex-col gap-4">
              <div
                className={`flex items-center gap-4 rounded-lg border px-4 py-3 ${
                  isDark ? "border-info/20 bg-info/10" : "border-info/20 bg-info/5"
                }`}
              >
                <div className="flex items-center justify-center text-info">
                  <span className="material-symbols-outlined text-2xl">info</span>
                </div>
                <p className={`flex-1 text-left text-sm font-normal leading-normal ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                  Average review time: 1-3 business days
                </p>
              </div>

              <Button onClick={() => navigate("/student/dashboard")} variant="primary" size="lg" className="w-full">
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
