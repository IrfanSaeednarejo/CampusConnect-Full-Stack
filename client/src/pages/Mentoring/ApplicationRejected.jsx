import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import useHomeTheme from "../../hooks/useHomeTheme";
import Button from "../../components/common/Button";

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
  const isDark = useHomeTheme();

  return (
    <div
      className={`relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden ${
        isDark ? "bg-background-dark" : "bg-background-light"
      }`}
    >
      <header
        className={`flex items-center justify-between whitespace-nowrap border-b px-4 py-3 font-display sm:px-6 lg:px-10 ${
          isDark ? "border-white/10" : "border-slate-200 bg-white/95 backdrop-blur-sm"
        }`}
      >
        <div className={`flex items-center gap-4 ${isDark ? "text-white" : "text-slate-900"}`}>
          <div className="size-6 text-primary">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z"></path>
            </svg>
          </div>
          <h2 className={`text-lg font-bold leading-tight tracking-[-0.015em] ${isDark ? "text-white" : "text-slate-900"}`}>
            CampusNexus
          </h2>
        </div>

        <div className="hidden flex-1 justify-center gap-8 md:flex">
          {[
            { href: "/student/dashboard", label: "Dashboard" },
            { href: "/events", label: "Events" },
            { href: "#", label: "Mentors" },
            { href: "#", label: "Networking" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`text-sm font-medium leading-normal ${
                isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="secondary" size="md">Notifications</Button>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBZ0xXDFXtK5-QPPiQWxP-xnoqOozNa_yW0FI8x_aQtiZTiWyAbWNZk1elZzIHT4RUfEywlJdDH-U__0NkT2XDO_YlwgoGgET8nFCQc3lVoY2sAqmHaIteSps-SkGqYql1m5tdt_2WhatrxomxFFKOc9DpWtyu55bll7_1zb6SkySVuYbyxFsOAZ9qxblXbfC2J5K5OmAU1VMv2Q0tU-j2zyhUlxtlosmKNxcQF9yyYa7_g5uvoTS9htnNkoo1ttuZWK2WI47zfxDo"
            size="10"
          />
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-2xl flex-col">
          <div
            className={`flex flex-col items-center justify-center gap-6 rounded-xl border p-6 text-center sm:p-8 md:p-12 ${
              isDark
                ? "border-white/10 bg-white/5"
                : "border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
            }`}
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-danger/10 text-danger">
              <span className="material-symbols-outlined text-4xl">cancel</span>
            </div>

            <div className="flex flex-col gap-2">
              <h1 className={`text-3xl font-bold leading-tight tracking-tight sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>
                Application Rejected
              </h1>
              <p className={`max-w-md text-base font-normal leading-normal ${isDark ? "text-white/70" : "text-slate-600"}`}>
                Your application to become a mentor could not be approved at this time. Please review the reasons below:
              </p>
            </div>

            <div
              className={`mt-2 w-full rounded-lg border p-4 text-left ${
                isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
              }`}
            >
              <ul className="space-y-4">
                {REJECTION_REASONS.map((reason, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <div className="mt-1 flex size-8 shrink-0 items-center justify-center text-danger">
                      <span className="material-symbols-outlined">error</span>
                    </div>
                    <div className="flex-1">
                      <p className={`text-base font-medium leading-normal ${isDark ? "text-white" : "text-slate-900"}`}>
                        {reason.title}
                      </p>
                      <p className={`text-sm ${isDark ? "text-white/60" : "text-slate-500"}`}>
                        {reason.description}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
              <Button onClick={() => navigate("/mentor-registration")} variant="primary" size="lg" className="w-full sm:w-auto">
                Update Application
              </Button>
              <Button onClick={() => navigate("/contact-us")} variant="secondary" size="lg" className="w-full sm:w-auto">
                Contact Support
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
