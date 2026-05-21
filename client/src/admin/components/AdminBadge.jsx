import useHomeTheme from "@/hooks/useHomeTheme";

const STATUS_MAP = {
  active: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  suspended: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  deleted: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  deactivated: { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.3)" },
  approved: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  pending: { bg: "rgba(245,158,11,0.12)", color: "#fbbf24", border: "rgba(245,158,11,0.3)" },
  rejected: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
  archived: { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.3)" },
  verified: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  bronze: { bg: "rgba(146,64,14,0.15)", color: "#d97706", border: "rgba(180,83,9,0.35)" },
  silver: { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.3)" },
  gold: { bg: "rgba(217,119,6,0.15)", color: "#fbbf24", border: "rgba(217,119,6,0.35)" },
  super_admin: { bg: "rgba(99,102,241,0.15)", color: "#818cf8", border: "rgba(99,102,241,0.3)" },
  campus_admin: { bg: "rgba(6,182,212,0.12)", color: "#22d3ee", border: "rgba(6,182,212,0.3)" },
  read_only_admin: { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.3)" },
  admin: { bg: "rgba(139,92,246,0.12)", color: "#c084fc", border: "rgba(139,92,246,0.3)" },
  student: { bg: "rgba(51,65,85,0.5)", color: "#94a3b8", border: "#334155" },
  mentor: { bg: "rgba(2,132,199,0.12)", color: "#38bdf8", border: "rgba(2,132,199,0.3)" },
  society_head: { bg: "rgba(124,58,237,0.12)", color: "#a78bfa", border: "rgba(124,58,237,0.3)" },
  draft: { bg: "rgba(245,158,11,0.1)", color: "#fbbf24", border: "rgba(245,158,11,0.25)" },
  published: { bg: "rgba(99,102,241,0.12)", color: "#818cf8", border: "rgba(99,102,241,0.3)" },
  registration: { bg: "rgba(6,182,212,0.12)", color: "#22d3ee", border: "rgba(6,182,212,0.3)" },
  ongoing: { bg: "rgba(16,185,129,0.12)", color: "#34d399", border: "rgba(16,185,129,0.3)" },
  submission_locked: { bg: "rgba(249,115,22,0.12)", color: "#fb923c", border: "rgba(249,115,22,0.3)" },
  judging: { bg: "rgba(168,85,247,0.12)", color: "#c084fc", border: "rgba(168,85,247,0.3)" },
  completed: { bg: "rgba(100,116,139,0.1)", color: "#94a3b8", border: "rgba(100,116,139,0.3)" },
  cancelled: { bg: "rgba(239,68,68,0.1)", color: "#f87171", border: "rgba(239,68,68,0.3)" },
};

const toLightStyles = (cfg) => {
  if (cfg.color === "#f87171") return { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" };
  if (cfg.color === "#34d399") return { bg: "#ecfdf5", color: "#047857", border: "#bbf7d0" };
  if (cfg.color === "#fbbf24" || cfg.color === "#d97706" || cfg.color === "#fb923c") {
    return { bg: "#fffbeb", color: "#b45309", border: "#fde68a" };
  }
  if (cfg.color === "#818cf8" || cfg.color === "#c084fc" || cfg.color === "#a78bfa") {
    return { bg: "#eef2ff", color: "#5b21b6", border: "#c7d2fe" };
  }
  if (cfg.color === "#22d3ee" || cfg.color === "#38bdf8") {
    return { bg: "#ecfeff", color: "#0f766e", border: "#a5f3fc" };
  }
  return { bg: "#f8fafc", color: "#475569", border: "#dbe4ee" };
};

export const AdminBadge = ({ value }) => {
  const isDark = useHomeTheme();
  const cfg = STATUS_MAP[value] || { bg: "rgba(51,65,85,0.5)", color: "#94a3b8", border: "#334155" };
  const styles = isDark ? cfg : toLightStyles(cfg);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        borderRadius: 20,
        background: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.04em",
        whiteSpace: "nowrap",
      }}
    >
      {String(value || "—").replace(/_/g, " ")}
    </span>
  );
};

export default AdminBadge;
