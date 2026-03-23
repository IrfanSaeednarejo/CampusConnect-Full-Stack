export default function FeatureCard({ icon, title, description }) {
  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="text-[#238636] text-3xl">{icon}</div>
      <h2 className="text-[#e6edf3] text-sm font-bold leading-tight">
        {title}
      </h2>
      <p className="text-[#8b949e] text-xs font-normal leading-normal">
        {description}
      </p>
    </div>
  );
}
