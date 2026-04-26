import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ThumbsUp, Smile, Zap, Heart, Lightbulb, HelpCircle } from "lucide-react";
import { reactToPost, optimisticReact } from "../../redux/slices/feedSlice";

const REACTIONS = [
    { type: "like",        label: "Like",       icon: ThumbsUp,   color: "text-blue-400",   bg: "bg-blue-500/10",  emoji: "👍" },
    { type: "insightful",  label: "Insightful", icon: Zap,        color: "text-amber-400",  bg: "bg-amber-500/10", emoji: "🔥" },
    { type: "celebrate",   label: "Celebrate",  icon: Smile,      color: "text-emerald-400",bg: "bg-emerald-500/10",emoji: "🎉" },
    { type: "support",     label: "Support",    icon: Heart,      color: "text-rose-400",   bg: "bg-rose-500/10",  emoji: "🤝" },
    { type: "brilliant",   label: "Brilliant",  icon: Lightbulb,  color: "text-purple-400", bg: "bg-purple-500/10",emoji: "💡" },
    { type: "curious",     label: "Curious",    icon: HelpCircle, color: "text-cyan-400",   bg: "bg-cyan-500/10",  emoji: "❓" },
];

export { REACTIONS };

export default function ReactionPicker({ postId, currentReaction, className = "" }) {
    const dispatch    = useDispatch();
    const userId      = useSelector((s) => s.auth.user?._id);
    const [open, setOpen] = useState(false);
    const [hovered, setHovered] = useState(null);
    const timerRef   = useRef(null);
    const ref        = useRef(null);

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
        // Optimistic update for instant UI feedback
        dispatch(optimisticReact({ postId, reactionType: type, userId }));
        dispatch(reactToPost({ postId, reactionType: type }));
    };

    const active = REACTIONS.find((r) => r.type === currentReaction);

    return (
        <div ref={ref} className={`relative ${className}`} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>

            {/* Picker popover */}
            {open && (
                <div className="absolute bottom-full left-0 mb-2 flex gap-1 bg-slate-900 border border-slate-700 rounded-2xl p-2 shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    {REACTIONS.map((r) => (
                        <button
                            key={r.type}
                            onClick={() => handleReact(r.type)}
                            onMouseEnter={() => setHovered(r.type)}
                            onMouseLeave={() => setHovered(null)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all hover:scale-125 ${r.bg}`}
                            title={r.label}
                        >
                            <span className="text-xl leading-none">{r.emoji}</span>
                            {hovered === r.type && (
                                <span className={`text-[10px] font-bold ${r.color} whitespace-nowrap`}>{r.label}</span>
                            )}
                        </button>
                    ))}
                </div>
            )}

            {/* Trigger button */}
            <button
                onClick={() => {
                    if (currentReaction) {
                        // Click to toggle off existing reaction
                        handleReact(currentReaction);
                    } else {
                        setOpen((v) => !v);
                    }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:bg-slate-800 ${
                    active ? `${active.color}` : "text-slate-400 hover:text-slate-200"
                }`}
            >
                {active ? (
                    <><span>{active.emoji}</span> <span className="hidden sm:inline">{active.label}</span></>
                ) : (
                    <><ThumbsUp className="w-4 h-4" /> <span className="hidden sm:inline">React</span></>
                )}
            </button>
        </div>
    );
}
