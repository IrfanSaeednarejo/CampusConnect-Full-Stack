import useHomeTheme from "@/hooks/useHomeTheme";
import ActionMenu from "./ActionMenu";

const Skeleton = ({ isDark }) => (
  <div
    style={{
      background: isDark ? "rgb(var(--color-container-dark))" : "rgb(var(--color-surface-light))",
      borderRadius: 16,
      overflow: "hidden",
      border: isDark ? "1px solid rgb(var(--color-border-dark))" : "1px solid rgb(var(--color-border-light))",
      boxShadow: isDark ? "none" : "0 18px 40px rgba(15,23,42,0.06)",
    }}
  >
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        style={{
          display: "flex",
          gap: 16,
          padding: "16px 20px",
          borderBottom: isDark ? "1px solid #1e293b" : "1px solid #e2e8f0",
        }}
      >
        {Array.from({ length: 4 }).map((_, j) => (
          <div
            key={j}
            style={{
              flex: 1,
              height: 14,
              background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
              borderRadius: 6,
            }}
          />
        ))}
      </div>
    ))}
  </div>
);

export const AdminTable = ({
  columns,
  data,
  loading,
  rowActions,
  onRowClick,
  pagination,
  onPageChange,
}) => {
  const isDark = useHomeTheme();

  if (loading) return <Skeleton isDark={isDark} />;

  return (
    <div>
      <div
        style={{
          background: isDark ? "#0f172a" : "#ffffff",
          border: isDark ? "1px solid #1e293b" : "1px solid #dbe4ee",
          borderRadius: 16,
          overflow: "visible",
          boxShadow: isDark ? "none" : "0 18px 40px rgba(15,23,42,0.06)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
              background: isDark ? "rgba(255,255,255,0.02)" : "rgb(var(--color-background-light))",
                borderBottom: isDark ? "1px solid rgb(var(--color-border-dark))" : "1px solid rgb(var(--color-border-light))",
              }}
            >
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: "14px 20px",
                    textAlign: "left",
                    color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </th>
              ))}
              {rowActions && <th style={{ padding: "14px 20px", width: 48 }} />}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{
                    padding: "60px 20px",
                    textAlign: "center",
                    color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
                  }}
                >
                  <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
                  <div
                    style={{
                      color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
                      fontSize: 14,
                      fontWeight: 600,
                    }}
                  >
                    No records found
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={row._id || i}
                  onClick={() => onRowClick?.(row)}
                  style={{
                    borderBottom: isDark ? "1px solid rgb(var(--color-background-dark))" : "1px solid rgb(var(--color-border-light))",
                    cursor: onRowClick ? "pointer" : "default",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isDark
                      ? "rgba(255,255,255,0.025)"
                      : "#f8fafc";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "14px 20px",
                        color: isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
                        fontSize: 13,
                        verticalAlign: "middle",
                      }}
                    >
                      {col.render ? col.render(row) : row[col.key] ?? "—"}
                    </td>
                  ))}
                  {rowActions && (
                    <td
                      style={{ padding: "14px 20px" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ActionMenu actions={rowActions(row)} />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination?.pages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            marginTop: 20,
          }}
        >
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange?.(p)}
              style={{
                width: 36,
                height: 36,
                border: "none",
                borderRadius: 8,
                background:
                  p === pagination.page
                    ? "rgb(var(--color-info))"
                    : isDark
                      ? "rgb(var(--color-container-dark))"
                      : "rgb(var(--color-background-light))",
                color: p === pagination.page ? "#f8fafc" : isDark ? "rgb(var(--color-text-primary-dark))" : "rgb(var(--color-text-primary-light))",
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                transition: "all 0.15s",
              }}
            >
              {p}
            </button>
          ))}
          <span
            style={{
              color: isDark ? "rgb(var(--color-text-secondary-dark))" : "rgb(var(--color-text-secondary-light))",
              fontSize: 12,
              marginLeft: 8,
            }}
          >
            of {pagination.total} records
          </span>
        </div>
      )}
    </div>
  );
};

export default AdminTable;
