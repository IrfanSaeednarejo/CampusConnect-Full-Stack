export default function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      {icon && (
        <span className="material-symbols-outlined text-5xl text-[#8b949e] mb-4">
          {icon}
        </span>
      )}
      <h2 className="text-lg font-semibold text-[#c9d1d9] mb-2">{title}</h2>
      {description && <p className="text-sm text-[#8b949e]">{description}</p>}
    </div>
  );
}
