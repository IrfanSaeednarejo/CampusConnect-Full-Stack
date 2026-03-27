import { Link } from "react-router-dom";

export default function PageHeader({
  title,
  subtitle,
  icon,
  backPath,
  action,
}) {
  return (
    <header className="border-b border-[#30363d] bg-[#0d1117] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {backPath && (
              <Link
                to={backPath}
                className="text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
              >
                <span className="material-symbols-outlined text-2xl">
                  arrow_back
                </span>
              </Link>
            )}
            {icon && (
              <span className="material-symbols-outlined text-3xl text-[#238636]">
                {icon}
              </span>
            )}
            <div>
              <h1 className="text-2xl font-bold text-[#c9d1d9]">{title}</h1>
              {subtitle && (
                <p className="text-sm text-[#8b949e] mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      </div>
    </header>
  );
}
