export default function AuthShell({
  children,
  className = "",
  containerClassName = "layout-container flex h-full grow flex-col",
  style = {},
}) {
  return (
    <div
      className={`relative flex min-h-screen w-full flex-col ${className}`}
      style={{ fontFamily: 'Inter, "Noto Sans", sans-serif', ...style }}
    >
      <div className={containerClassName}>{children}</div>
    </div>
  );
}
