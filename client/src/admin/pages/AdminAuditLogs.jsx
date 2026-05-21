import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { getAuditLogs } from "../../api/adminApi";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

const ACTION_STYLES = {
  USER_SUSPENDED: {
    bar: "border-danger/40",
    badge: "border-danger/20 bg-danger/5 text-danger dark:border-danger/25 dark:bg-danger/10",
    text: "text-danger",
  },
  USER_BANNED: {
    bar: "border-danger/40",
    badge: "border-danger/20 bg-danger/5 text-danger dark:border-danger/25 dark:bg-danger/10",
    text: "text-danger",
  },
  MENTOR_APPROVED: {
    bar: "border-success/40",
    badge: "border-success/20 bg-success/5 text-success dark:border-success/25 dark:bg-success/10",
    text: "text-success",
  },
  SOCIETY_APPROVED: {
    bar: "border-success/40",
    badge: "border-success/20 bg-success/5 text-success dark:border-success/25 dark:bg-success/10",
    text: "text-success",
  },
  NOTIFICATION_BROADCAST: {
    bar: "border-primary/40",
    badge: "border-primary/20 bg-primary/5 text-primary dark:border-primary/25 dark:bg-primary/10",
    text: "text-primary",
  },
  SYSTEM_MAINTENANCE_TOGGLED: {
    bar: "border-warning/40",
    badge: "border-warning/20 bg-warning/5 text-warning dark:border-warning/25 dark:bg-warning/10",
    text: "text-warning",
  },
};

const getActionStyle = (action) =>
  ACTION_STYLES[action] || {
    bar: "border-slate-300 dark:border-slate-700",
    badge: "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300",
    text: "text-text-primary-light dark:text-text-primary-dark",
  };

export const AdminAuditLogs = () => {
  const isDark = useHomeTheme();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({});
  const [filters, setFilters] = useState({ page: 1, limit: 20 });
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getAuditLogs(filters)
      .then(({ data }) => {
        setLogs(data.data?.docs || []);
        setPagination(data.data?.pagination || {});
      })
      .catch(console.error);
  }, [filters]);

  const panelClass = isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light";
  const insetClass = isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-slate-50";
  const textClass = isDark ? "text-text-primary-dark" : "text-text-primary-light";
  const mutedClass = isDark ? "text-text-secondary-dark" : "text-text-secondary-light";
  const fieldClass = isDark
    ? "border-border-dark bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark"
    : "border-border-light bg-surface-light text-text-primary-light placeholder:text-text-secondary-light";

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className={`text-3xl font-bold ${textClass}`}>Governance Audit Trail</h1>
        <p className={`text-sm ${mutedClass}`}>
          Irreversible record of all administrative interactions, system changes, and policy enforcements.
        </p>
      </div>

      <div className={`flex flex-wrap items-center gap-4 rounded-2xl border p-5 ${panelClass}`}>
        <div className="relative min-w-[240px] flex-1">
          <Search className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 ${mutedClass}`} />
          <input
            placeholder="Filter by action signature..."
            onChange={(e) => setFilters((f) => ({ ...f, action: e.target.value, page: 1 }))}
            className={`w-full rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${fieldClass}`}
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <label className="space-y-1">
            <span className={`block text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>From</span>
            <input
              type="date"
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
              className={`rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${fieldClass}`}
            />
          </label>
          <label className="space-y-1">
            <span className={`block text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>To</span>
            <input
              type="date"
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
              className={`rounded-xl border px-3 py-2.5 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${fieldClass}`}
            />
          </label>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {logs.length === 0 ? (
          <div className={`rounded-2xl border px-6 py-16 text-center ${panelClass}`}>
            <p className={`text-sm ${mutedClass}`}>No governance records match the current filter parameters.</p>
          </div>
        ) : (
          logs.map((log) => {
            const actionStyle = getActionStyle(log.action);
            return (
              <button
                key={log._id}
                type="button"
                onClick={() => setSelected(log)}
                className={`flex w-full items-center justify-between gap-4 rounded-2xl border border-l-4 px-5 py-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50 dark:hover:border-slate-600 dark:hover:bg-slate-800/70 ${panelClass} ${actionStyle.bar}`}
              >
                <div className="flex min-w-0 flex-1 flex-col gap-3 md:flex-row md:items-center">
                  <span className={`inline-flex w-fit rounded-lg border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${actionStyle.badge}`}>
                    {log.action.replace(/_/g, " ")}
                  </span>
                  <div className="min-w-0">
                    <p className={`truncate text-sm font-semibold ${textClass}`}>
                      {log.adminId?.profile?.displayName || "SYSTEM_DAEMON"}
                    </p>
                    <div className={`mt-1 flex flex-wrap items-center gap-2 text-xs ${mutedClass}`}>
                      {log.targetModel && (
                        <span className={`rounded-md border px-2 py-0.5 ${insetClass}`}>{log.targetModel}</span>
                      )}
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <span className={`hidden text-xs font-medium md:block ${mutedClass}`}>Inspect</span>
              </button>
            );
          })
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-[200] bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="ml-auto flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border-light bg-surface-light shadow-2xl dark:border-border-dark dark:bg-surface-dark">
            <div className="flex items-center justify-between border-b border-border-light px-6 py-5 dark:border-border-dark">
              <div>
                <h3 className={`text-xl font-semibold ${textClass}`}>Log Inspector</h3>
                <p className={`mt-1 text-sm ${mutedClass}`}>Detailed event payload and origin metadata.</p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className={getButtonClassName({
                  variant: "ghost",
                  size: "icon-sm",
                  isDark,
                  iconOnly: true,
                  className: "rounded-lg",
                })}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <section className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Action Signature</p>
                <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${panelClass} ${getActionStyle(selected.action).text}`}>
                  {selected.action}
                </div>
              </section>

              <section className="space-y-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${mutedClass}`}>Payload Schematic</p>
                <pre className={`overflow-x-auto rounded-2xl border p-4 text-xs leading-6 ${insetClass} ${mutedClass}`}>
                  {JSON.stringify(selected.payload, null, 2)}
                </pre>
              </section>

              <section className={`rounded-2xl border p-4 ${isDark ? "border-info/20 bg-info/10" : "border-info/20 bg-info/5"}`}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-info">Metadata</p>
                <div className={`space-y-1 text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                  <p>ID: {selected._id}</p>
                  <p>Origin: {selected.ipAddress || "INTERNAL"}</p>
                  <p>Page: {pagination.page || filters.page}</p>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
