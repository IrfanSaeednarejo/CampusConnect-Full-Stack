import { useState, useRef, useEffect } from "react";

export const ActionMenu = ({ actions }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    useEffect(() => {
        const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button onClick={() => setOpen((v) => !v)}
                style={{ background: "transparent", border: "1px solid #334155", color: "#94a3b8", borderRadius: 6, padding: "4px 10px", cursor: "pointer" }}>
                ⋯
            </button>
            {open && (
                <div style={{
                    position: "absolute", right: 0, top: "100%", marginTop: 4,
                    background: "#0f172a", border: "1px solid #334155", borderRadius: 8,
                    minWidth: 160, zIndex: 50, overflow: "hidden",
                }}>
                    {actions.map((a, i) => (
                        <button key={i} onClick={() => { a.onClick(); setOpen(false); }}
                            style={{
                                display: "block", width: "100%", padding: "10px 16px",
                                background: "transparent", border: "none", textAlign: "left",
                                color: a.danger ? "#ef4444" : "#f8fafc", cursor: "pointer", fontSize: 13,
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#1e293b"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
export default ActionMenu;
