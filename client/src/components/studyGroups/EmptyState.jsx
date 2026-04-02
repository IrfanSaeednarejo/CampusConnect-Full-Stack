export default function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <span className="material-symbols-outlined text-5xl text-text-secondary mb-4">
          {icon}
        </span>
      )}
      <h2 className="text-lg font-semibold text-text-primary mb-2">{title}</h2>
      {description && <p className="text-sm text-text-secondary">{description}</p>}
    </div>
  );
}
