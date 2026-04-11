export default function SearchInput({
  placeholder = "Search",
  value = "",
  onChange = () => {},
  className = "",
}) {
  return (
    <label
      className={`hidden sm:flex flex-col min-w-40 !h-10 max-w-64 ${className}`}
    >
      <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
        <div className="text-text-primary/60 flex border-none bg-surface border border-border items-center justify-center pl-3 rounded-l-lg border-r-0">
          <span className="material-symbols-outlined !text-xl">search</span>
        </div>
        <input
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-0 border-none bg-surface border border-border focus:border-none h-full placeholder:text-text-primary/60 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </label>
  );
}
