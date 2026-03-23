import { useNavigate } from "react-router-dom";

export default function RequestAcceptedConfirmation() {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center p-4 bg-[#0d1117]"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Modal Container */}
      <div className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-[#30363d] bg-[#161b22] p-6 text-center text-[#e6edf3] shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-[#8b949e] transition-colors hover:text-[#e6edf3]"
        >
          <span className="material-symbols-outlined !text-2xl">close</span>
        </button>

        {/* Success Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#238636]/20">
          <span className="material-symbols-outlined text-[#238636] !text-4xl">
            check_circle
          </span>
        </div>

        {/* Typography */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-[#e6edf3]">
            Request Accepted!
          </h1>
          <p className="text-base font-normal leading-normal text-[#8b949e]">
            You have accepted the mentorship request from{" "}
            <span className="font-semibold text-[#e6edf3]">Alex Johnson</span>.
            The session has been added to your calendar, and the student has
            been notified.
          </p>
        </div>

        {/* Button Group */}
        <div className="flex w-full flex-col items-stretch gap-3 pt-4">
          <button
            onClick={() => navigate("/mentor-sessions")}
            className="flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#238636] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#2ea043]"
          >
            <span className="truncate">View My Sessions</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-[#30363d] bg-[#21262d] px-5 text-sm font-semibold text-[#e6edf3] transition-colors hover:border-[#8b949e]"
          >
            <span className="truncate">Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
