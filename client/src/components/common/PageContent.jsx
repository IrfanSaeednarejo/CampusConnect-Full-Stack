export default function PageContent({
  children,
  maxWidth = "max-w-3xl",
  className = "",
}) {
  return (
    <main
      className={`flex-1 ${maxWidth} mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
      {children}
    </main>
  );
}
