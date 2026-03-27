export default function StepItem({ number, title, description }) {
  return (
    <div className="flex items-start gap-3 mt-4 first:mt-0">
      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-[#238636] text-sm font-semibold">
        {number}
      </div>
      <div className="flex flex-col gap-0.5">
        <h2 className="text-[#e6edf3] text-sm font-bold leading-tight">
          {title}
        </h2>
        <p className="text-[#8b949e] text-xs font-normal leading-normal">
          {description}
        </p>
      </div>
    </div>
  );
}
