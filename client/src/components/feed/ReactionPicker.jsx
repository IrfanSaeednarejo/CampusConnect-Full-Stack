import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThumbsUp, Smile, Zap, Heart, Lightbulb, HelpCircle } from "lucide-react";
import { reactToPost, optimisticReact } from "../../redux/slices/feedSlice";
import useHomeTheme from "@/hooks/useHomeTheme";

const REACTIONS = [
  { type: "like", label: "Like", icon: ThumbsUp, color: "text-info", bg: "bg-info/10", emoji: "👍" },
  { type: "insightful", label: "Insightful", icon: Zap, color: "text-warning", bg: "bg-warning/10", emoji: "🔥" },
  { type: "celebrate", label: "Celebrate", icon: Smile, color: "text-success", bg: "bg-success/10", emoji: "🎉" },
  { type: "support", label: "Support", icon: Heart, color: "text-danger", bg: "bg-danger/10", emoji: "🤝" },
  { type: "brilliant", label: "Brilliant", icon: Lightbulb, color: "text-info", bg: "bg-info/10", emoji: "💡" },
  { type: "curious", label: "Curious", icon: HelpCircle, color: "text-info", bg: "bg-info/10", emoji: "❓" },
];

export { REACTIONS };

export default function ReactionPicker({ postId, currentReaction, className = "" }) {
  const dispatch = useDispatch();
  const userId = useSelector((s) => s.auth.user?._id);
  const isDark = useHomeTheme();
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(null);
  const timerRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), 400);
  };

  const handleMouseLeave = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(false), 300);
  };

  const handleReact = (type) => {
    setOpen(false);
    dispatch(optimisticReact({ postId, reactionType: type, userId }));
    dispatch(reactToPost({ postId, reactionType: type }));
  };

  const active = REACTIONS.find((r) => r.type === currentReaction);

  return (
    <div ref={ref} className={`relative ${className}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      {open && (
        <div
          className={`absolute bottom-full left-0 z-30 mb-2 flex gap-1 rounded-2xl border p-2 shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-150 ${
            isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"
          }`}
        >
          {REACTIONS.map((r) => (
            <button
              key={r.type}
              onClick={() => handleReact(r.type)}
              onMouseEnter={() => setHovered(r.type)}
              onMouseLeave={() => setHovered(null)}
              className={`flex flex-col items-center gap-1 rounded-xl p-2 transition-transform duration-150 hover:-translate-y-0.5 ${r.bg}`}
              title={r.label}
            >
              <span className="text-xl leading-none">{r.emoji}</span>
              {hovered === r.type && (
                <span className={`whitespace-nowrap text-[10px] font-bold ${r.color}`}>{r.label}</span>
              )}
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => {
          if (currentReaction) {
            handleReact(currentReaction);
          } else {
            setOpen((v) => !v);
          }
        }}
        className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ${
          active
            ? `${active.color} ${isDark ? "hover:bg-background-dark" : "hover:bg-surface-muted"}`
            : isDark
              ? "text-text-secondary-dark hover:bg-background-dark hover:text-text-primary-dark"
              : "text-text-secondary-light hover:bg-surface-muted hover:text-text-primary-light"
        }`}
      >
        {active ? (
          <>
            <span>{active.emoji}</span>
            <span className="hidden sm:inline">{active.label}</span>
          </>
        ) : (
          <>
            <ThumbsUp className="h-4 w-4" />
            <span className="hidden sm:inline">React</span>
          </>
        )}
      </button>
    </div>
  );
}
