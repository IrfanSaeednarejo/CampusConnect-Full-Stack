export default function ErrorPageShell({
  icon,
  iconClassName = "",
  code,
  title,
  message,
  actions,
  footer,
  className = "",
}) {
  return (
    <div
      className={`min-h-screen bg-[#0d1117] flex items-center justify-center px-4 ${className}`}
    >
      <div className="text-center max-w-md">
        {icon && (
          <div className="mb-6">
            <span
              className={`material-symbols-outlined text-8xl ${iconClassName}`}
            >
              {icon}
            </span>
          </div>
        )}
        {code && (
          <h1 className="text-5xl font-bold text-[#e6edf3] mb-4">{code}</h1>
        )}
        {title && (
          <h2 className="text-3xl font-bold text-[#e6edf3] mb-4">
            {title}
          </h2>
        )}
        {message && (
          <p className="text-xl text-[#8b949e] mb-8">{message}</p>
        )}
        {actions && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {actions}
          </div>
        )}
        {footer && <div className="mt-8">{footer}</div>}
      </div>
    </div>
  );
}
