import useHomeTheme from "../../hooks/useHomeTheme";

export default function SearchInput({
  placeholder = "Search",
  value = "",
  onChange = () => {},
  className = "",
}) {
  const isDark = useHomeTheme();
  const iconShellClass = isDark
    ? "bg-white/5 text-white/60"
    : "bg-slate-100 text-slate-400";
  const inputClass = isDark
    ? "bg-white/5 text-white placeholder:text-white/60"
    : "bg-slate-100 text-slate-900 placeholder:text-slate-400";

  return (
    <label
      className={`hidden sm:flex flex-col min-w-40 !h-10 max-w-64 ${className}`}
    >
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
        <div className={`flex items-center justify-center rounded-l-lg border-r-0 border-none pl-3 ${iconShellClass}`}>
          <span className="material-symbols-outlined !text-xl">search</span>
        </div>
        <input
          className={`form-input flex h-full w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-l-none border-none border-l-0 px-4 pl-2 text-base font-normal leading-normal focus:border-none focus:outline-0 focus:ring-0 ${inputClass}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </label>
  );
}
