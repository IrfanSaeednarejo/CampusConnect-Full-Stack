import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";

const REJECTION_REASONS = [
  {
    title: "Incomplete profile information.",
    description:
      "Please ensure all required fields in your profile are filled out completely, including your bio and areas of expertise.",
  },
  {
    title: "Provided credentials could not be verified.",
    description:
      "We were unable to verify the academic or professional credentials you provided. Please double-check and re-upload them.",
  },
  {
    title: "Other feedback",
    description:
      "Your application statement lacked specific details about your mentoring approach. Please elaborate on how you plan to guide students.",
  },
];

export default function ApplicationRejected() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background overflow-x-hidden">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-border px-4 sm:px-6 lg:px-10 py-3 font-display">
        <div className="flex items-center gap-4 text-text-primary">
          <div className="size-6 text-[#19e65e]">
            <svg
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z"></path>
            </svg>
          </div>
          <h2 className="text-text-primary text-lg font-bold leading-tight tracking-[-0.015em]">
            CampusConnect
          </h2>
        </div>

        <div className="hidden md:flex flex-1 justify-center gap-8">
          <a
            href="/student/dashboard"
            className="text-text-primary/80 hover:text-text-primary text-sm font-medium leading-normal"
          >
            Dashboard
          </a>
          <a
            href="/events"
            className="text-text-primary/80 hover:text-text-primary text-sm font-medium leading-normal"
          >
            Events
          </a>
          <a
            href="#"
            className="text-text-primary/80 hover:text-text-primary text-sm font-medium leading-normal"
          >
            Mentors
          </a>
          <a
            href="#"
            className="text-text-primary/80 hover:text-text-primary text-sm font-medium leading-normal"
          >
            Networking
          </a>
        </div>

        <div className="flex items-center gap-4">
          <button className="flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
            <span className="truncate">Notifications</span>
          </button>
          <Avatar
            src=""
            size="10"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 justify-center py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col w-full max-w-2xl">
          <div className="flex flex-col items-center justify-center gap-6 rounded-xl border border-border bg-surface border border-border p-6 sm:p-8 md:p-12 text-center">
            {/* Rejection Icon */}
            <div className="flex items-center justify-center size-16 rounded-full bg-red-500/10 text-red-500">
              <span className="material-symbols-outlined text-4xl">cancel</span>
            </div>

            {/* Heading */}
            <div className="flex flex-col gap-2">
              <h1 className="text-text-primary tracking-tight text-3xl sm:text-4xl font-bold leading-tight">
                Application Rejected
              </h1>
              <p className="text-text-primary/70 text-base font-normal leading-normal max-w-md">
                Your application to become a mentor could not be approved at
                this time. Please review the reasons below:
              </p>
            </div>

            {/* Rejection Reasons */}
            <div className="w-full text-left bg-surface border border-border border border-border rounded-lg p-4 mt-2">
              <ul className="space-y-4">
                {REJECTION_REASONS.map((reason, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="text-[#19e65e] flex items-center justify-center shrink-0 size-8 mt-1">
                      <span className="material-symbols-outlined">error</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-text-primary text-base font-medium leading-normal">
                        {reason.title}
                      </p>
                      <p className="text-text-primary/60 text-sm">
                        {reason.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-6 w-full">
              <button
                onClick={() => navigate("/mentor-registration")}
                className="flex w-full sm:w-auto min-w-[5rem] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
              >
                <span className="truncate">Update Application</span>
              </button>
              <button
                onClick={() => navigate("/contact-us")}
                className="flex w-full sm:w-auto min-w-[5rem] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-transparent text-text-primary border border-white/30 text-base font-bold leading-normal tracking-[0.015em] hover:bg-surface border border-border transition-colors"
              >
                <span className="truncate">Contact Support</span>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
