import { useNavigate } from "react-router-dom";

export default function RequestAcceptedConfirmation() {
  const navigate = useNavigate();

  return (
    <div
      className="relative flex h-screen w-full flex-col items-center justify-center p-4 bg-background"
      style={{ fontFamily: 'Lexend, "Noto Sans", sans-serif' }}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-background/60"></div>

      {/* Modal Container */}
      <div className="relative flex w-full max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-surface p-6 text-center text-text-primary shadow-2xl">
        {/* Close Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 text-text-secondary transition-colors hover:text-text-primary"
        >
          <span className="material-symbols-outlined !text-2xl">close</span>
        </button>

        {/* Success Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/20">
          <span className="material-symbols-outlined text-primary !text-4xl">
            check_circle
          </span>
        </div>

        {/* Typography */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-bold leading-tight tracking-tight text-text-primary">
            Request Accepted!
          </h1>
          <p className="text-base font-normal leading-normal text-text-secondary">
            You have accepted the mentorship request from{" "}
            <span className="font-semibold text-text-primary">Alex Johnson</span>.
            The session has been added to your calendar, and the student has
            been notified.
          </p>
        </div>

        {/* Button Group */}
        <div className="flex w-full flex-col items-stretch gap-3 pt-4">
          <button
            onClick={() => navigate("/mentor-sessions")}
            className="flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
          >
            <span className="truncate">View My Sessions</span>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex h-11 cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border bg-surface-hover px-5 text-sm font-semibold text-text-primary transition-colors hover:border-[#475569]"
          >
            <span className="truncate">Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
