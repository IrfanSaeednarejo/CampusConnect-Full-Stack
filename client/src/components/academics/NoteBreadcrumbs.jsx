import { Link } from "react-router-dom";

export default function NoteBreadcrumbs({
  currentLabel,
  baseLabel = "Notes",
  baseTo = "/academics/notes",
}) {
  return (
    <nav className="flex items-center text-sm mb-6">
      <Link
        className="text-[#57606a] dark:text-text-secondary hover:underline"
        to={baseTo}
      >
        {baseLabel}
      </Link>
      <span className="mx-2 text-[#57606a] dark:text-text-secondary">/</span>
      <span className="text-[#24292f] dark:text-text-primary font-medium">
        {currentLabel}
      </span>
    </nav>
  );
}
