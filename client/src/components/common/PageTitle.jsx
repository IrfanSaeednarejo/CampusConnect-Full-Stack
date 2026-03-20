export default function PageTitle({ title, subtitle }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
        {title}
      </p>
      {subtitle && (
        <p className="text-white/60 text-base font-normal leading-normal">
          {subtitle}
        </p>
      )}
    </div>
  );
}
