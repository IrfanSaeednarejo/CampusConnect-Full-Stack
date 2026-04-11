const toolbarButtons = [
  "format_bold",
  "format_italic",
  "format_underlined",
  "divider",
  "format_list_bulleted",
  "format_list_numbered",
  "divider",
  "link",
  "image",
];

export default function NoteEditorToolbar({
  containerClassName = "flex items-center gap-1",
  buttonClassName = "p-2 rounded",
  dividerClassName = "w-px h-5 bg-[#C7D2FE] mx-1",
}) {
  return (
    <div className={containerClassName}>
      {toolbarButtons.map((item, index) => {
        if (item === "divider") {
          return <div key={`divider-${index}`} className={dividerClassName}></div>;
        }
        return (
          <button key={item} className={buttonClassName}>
            <span className="material-symbols-outlined text-base">{item}</span>
          </button>
        );
      })}
    </div>
  );
}
