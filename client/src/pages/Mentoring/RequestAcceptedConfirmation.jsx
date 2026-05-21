import { useNavigate } from "react-router-dom";
import useHomeTheme from "@/hooks/useHomeTheme";

export default function RequestAcceptedConfirmation() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();

  return (
    <div
      className={`relative flex h-screen w-full flex-col items-center justify-center p-4 ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      <div className={`absolute inset-0 ${isDark ? "bg-black/60" : "bg-slate-900/5"}`}></div>

      <div
        className={`relative flex w-full max-w-md flex-col items-center gap-4 rounded-lg border p-6 text-center shadow-2xl ${
          isDark ? "border-[#30363d] bg-[#161b22] text-[#e6edf3]" : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        <button
          onClick={() => navigate(-1)}
          className={`absolute top-4 right-4 transition-colors ${isDark ? "text-[#8b949e] hover:text-[#e6edf3]" : "text-slate-400 hover:text-slate-900"}`}
        >
          <span className="material-symbols-outlined !text-2xl">close</span>
        </button>

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#238636]/20">
          <span className="material-symbols-outlined text-[#238636] !text-4xl">check_circle</span>
        </div>

        <div className="flex flex-col gap-2">
          <h1 className={`text-2xl font-bold leading-tight tracking-tight ${isDark ? "text-[#e6edf3]" : "text-slate-900"}`}>
            Request Accepted!
          </h1>
          <p className={`text-base font-normal leading-normal ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
            You have accepted the mentorship request from{" "}
            <span className={`font-semibold ${isDark ? "text-[#e6edf3]" : "text-slate-900"}`}>Alex Johnson</span>.
            The session has been added to your calendar, and the student has been notified.
          </p>
        </div>

        <div className="flex w-full flex-col items-stretch gap-3 pt-4">
          <button
            onClick={() => navigate("/mentor-sessions")}
            className="flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#238636] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2ea043]"
          >
            <span className="truncate">View My Sessions</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className={`flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-lg border px-5 text-sm font-semibold transition-colors ${
              isDark
                ? "border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:border-[#8b949e]"
                : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
            }`}
          >
            <span className="truncate">Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
