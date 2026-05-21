import { useEffect, useRef, useState } from "react";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export const ActionMenu = ({ actions }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const isDark = useHomeTheme();

  useEffect(() => {
    const handler = (event) => {
      if (!ref.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative z-20">
      <button
        onClick={() => setOpen((value) => !value)}
        type="button"
        className={getButtonClassName({
          variant: "icon",
          size: "iconSm",
          iconOnly: true,
          className: open ? (isDark ? "border-[#58a6ff]/50" : "border-sky-300") : "",
        })}
        aria-label="Open actions menu"
      >
        <span className="material-symbols-outlined text-[18px] leading-none">more_horiz</span>
      </button>

      {open && (
        <div
          className={`absolute right-0 top-full z-[120] mt-2 min-w-44 overflow-hidden rounded-xl border ${
            isDark
              ? "border-[#30363d] bg-[#0f172a] shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
              : "border-[#dbe4ee] bg-white shadow-[0_18px_40px_rgba(15,23,42,0.10)]"
          }`}
        >
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={() => {
                action.onClick();
                setOpen(false);
              }}
              type="button"
              className={getButtonClassName({
                variant: action.danger ? "danger" : "ghost",
                size: "sm",
                className: "w-full justify-start rounded-none border-0 px-4 shadow-none",
              })}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
