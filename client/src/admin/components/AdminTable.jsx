import ActionMenu from "./ActionMenu";

export const AdminTable = ({ columns, data, loading, rowActions, onRowClick, pagination, onPageChange }) => {
    if (loading) {
        return (
            <div style={{ background: "#1e293b", borderRadius: 12, padding: 40, textAlign: "center", color: "#64748b" }}>
                Loading...
            </div>
        );
    }

    return (
        <div>
            <div style={{ background: "#1e293b", borderRadius: 12, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr style={{ borderBottom: "1px solid #334155" }}>
                            {columns.map((col) => (
                                <th key={col.key} style={{ padding: "12px 16px", textAlign: "left", color: "#64748b", fontSize: 12, fontWeight: 600 }}>
                                    {col.label}
                                </th>
                            ))}
                            {rowActions && <th style={{ padding: "12px 16px" }} />}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} style={{ padding: 32, textAlign: "center", color: "#64748b" }}>
                                    No data found
                                </td>
                            </tr>
                        ) : data.map((row, i) => (
                            <tr
                                key={row._id || i}
                                onClick={() => onRowClick?.(row)}
                                style={{
                                    borderBottom: "1px solid #1e293b",
                                    cursor: onRowClick ? "pointer" : "default",
                                    transition: "background 0.1s",
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = "#0f172a"}
                                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                            >
                                {columns.map((col) => (
                                    <td key={col.key} style={{ padding: "12px 16px", color: "#f8fafc", fontSize: 14 }}>
                                        {col.render ? col.render(row) : (row[col.key] ?? "—")}
                                    </td>
                                ))}
                                {rowActions && (
                                    <td style={{ padding: "12px 16px" }} onClick={(e) => e.stopPropagation()}>
                                        <ActionMenu actions={rowActions(row)} />
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ─────────────────────────────── */}
            {pagination?.pages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 16 }}>
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
                        <button
                            key={p}
                            onClick={() => onPageChange?.(p)}
                            style={{
                                width: 32, height: 32, border: "none", borderRadius: 6,
                                background: p === pagination.page ? "#6366f1" : "#1e293b",
                                color: "#f8fafc", cursor: "pointer",
                            }}
                        >
                            {p}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
export default AdminTable;
