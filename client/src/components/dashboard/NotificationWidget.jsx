import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../common/Button";

const iconMap = {
  campaign: "📢",
  event_available: "📅",
  chat: "💬",
};

export default function NotificationWidget({
  title = "Notifications",
  linkLabel = "See All",
  linkHref,
  notifications = [],
}) {
  const isDark = useHomeTheme();

  return (
    <section
      className={`rounded-[28px] border p-2 transition-all duration-300 sm:p-3 ${
        isDark
          ? "border-border-dark bg-surface-dark shadow-lg"
          : "border-border-light bg-surface-light shadow-md"
      }`}
    >
      <div className={`mb-2 flex items-center justify-between gap-3 px-3 py-2 sm:px-4 ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
        <h2 className="text-xl font-semibold">{title}</h2>
        {linkHref && (
          <a
            href={linkHref}
            className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2" })}
          >
            {linkLabel}
          </a>
        )}
      </div>
      <ul className={`divide-y rounded-2xl ${isDark ? "divide-border-dark" : "divide-border-light"}`}>
        {notifications.map((notif) => (
          <li
            key={notif.id}
            className={`rounded-2xl p-4 transition-colors ${isDark ? "hover:bg-background-dark" : "hover:bg-surface-muted"}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`mt-1 rounded-full p-2 text-lg ${
                  isDark ? "bg-success/15 text-success" : "bg-success/10 text-success"
                }`}
              >
                {iconMap[notif.icon] || "🔔"}
              </div>
              <div>
                <p className={isDark ? "text-sm text-text-primary-dark" : "text-sm text-text-primary-light"}>{notif.title}</p>
                <p className={isDark ? "mt-1 text-xs text-text-secondary-dark" : "mt-1 text-xs text-text-secondary-light"}>{notif.time}</p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
