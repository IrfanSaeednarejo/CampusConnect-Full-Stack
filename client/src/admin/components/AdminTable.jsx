import ActionMenu from "./ActionMenu";

const Skeleton = () => (
  <div style={{ background: "#0f172a", borderRadius: 16, overflow: "hidden" }}>
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} style={{ display: "flex", gap: 16, padding: "16px 20px", borderBottom: "1px solid #1e293b" }}>
        {Array.from({ length: 4 }).map((_, j) => (
          <div key={j} style={{ flex: 1, height: 14, background: "rgba(255,255,255,0.04)", borderRadius: 6 }} />
        ))}
      </div>
    ))}
  </div>
);

export const AdminTable = ({ columns, data, loading, rowActions, onRowClick, pagination, onPageChange }) => {
  if (loading) return <Skeleton />;

  return (
    <div>
      <div style={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: 16, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)", borderBottom: "1px solid #1e293b" }}>
              {columns.map((col) => (
                <th key={col.key} style={{ padding: "14px 20px", textAlign: "left", color: "#475569", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", whiteSpace: "nowrap" }}>
                  {col.label}
                </th>
              ))}
              {rowActions && <th style={{ padding: "14px 20px", width: 48 }} />}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} style={{ padding: "60px 20px", textAlign: "center", color: "#334155" }}>
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                  <div style={{ color: "#475569", fontSize: 14, fontWeight: 600 }}>No records found</div>
                </td>
              </tr>
            ) : data.map((row, i) => (
              <tr
                key={row._id || i}
                onClick={() => onRowClick?.(row)}
                style={{ borderBottom: "1px solid #0f172a", cursor: onRowClick ? "pointer" : "default", transition: "background 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={{ padding: "14px 20px", color: "#e2e8f0", fontSize: 13, verticalAlign: "middle" }}>
                    {col.render ? col.render(row) : (row[col.key] ?? "—")}
                  </td>
                ))}
                {rowActions && (
                  <td style={{ padding: "14px 20px" }} onClick={(e) => e.stopPropagation()}>
                    <ActionMenu actions={rowActions(row)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination?.pages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 20 }}>
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange?.(p)}
              style={{ width: 36, height: 36, border: "none", borderRadius: 8, background: p === pagination.page ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "#1e293b", color: "#f8fafc", cursor: "pointer", fontWeight: 700, fontSize: 13, transition: "all 0.15s" }}
            >
              {p}
            </button>
          ))}
          <span style={{ color: "#475569", fontSize: 12, marginLeft: 8 }}>of {pagination.total} records</span>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
