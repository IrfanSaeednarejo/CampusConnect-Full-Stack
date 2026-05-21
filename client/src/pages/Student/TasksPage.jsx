import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasksThunk,
  createTaskThunk,
  completeTaskThunk,
  deleteTaskThunk,
  selectAllTasks,
  selectTaskLoading,
  selectTaskSubmitting,
  selectTaskError,
} from "../../redux/slices/taskSlice";
import useHomeTheme from "../../hooks/useHomeTheme";
import IconButton from "../../components/common/IconButton";
import { getButtonClassName } from "../../components/common/Button";
import { useLanguage } from "../../hooks/useLanguage";

const PRIORITY_CONFIG = {
  low: {
    dark: "text-info border-info/25 bg-info/10",
    light: "text-info border-info/20 bg-info/5",
  },
  medium: {
    dark: "text-warning border-warning/25 bg-warning/10",
    light: "text-warning border-warning/20 bg-warning/5",
  },
  high: {
    dark: "text-warning border-warning/25 bg-warning/10",
    light: "text-warning border-warning/20 bg-warning/5",
  },
  urgent: {
    dark: "text-danger border-danger/25 bg-danger/10",
    light: "text-danger border-danger/20 bg-danger/5",
  },
};

const STATUS_TABS = [
  { value: "", labelKey: "tasks.status.all" },
  { value: "pending", labelKey: "tasks.status.pending" },
  { value: "in_progress", labelKey: "tasks.status.inProgress" },
  { value: "completed", labelKey: "tasks.status.completed" },
];

function getDueBadge(dueDate, status, isDark, t, locale) {
  if (!dueDate || status === "completed") return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffH = (due - now) / 3600000;
  if (diffH < 0) {
    return {
      label: t("tasks.due.overdue"),
      color: isDark ? "text-danger bg-danger/10" : "text-danger bg-danger/5",
    };
  }
  if (diffH < 24) {
    return {
      label: t("tasks.due.today"),
      color: isDark ? "text-warning bg-warning/10" : "text-warning bg-warning/5",
    };
  }
  if (diffH < 72) {
    return {
      label: t("tasks.due.soon"),
      color: isDark ? "text-warning bg-warning/10" : "text-warning bg-warning/5",
    };
  }
  return {
    label: due.toLocaleDateString(locale, { month: "short", day: "numeric" }),
    color: "bg-surface-muted text-text-secondary",
  };
}

function TaskCard({ task, onComplete, onDelete, isDark, t, locale }) {
  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const due = getDueBadge(task.dueDate, task.status, isDark, t, locale);
  const priorityLabels = {
    low: t("tasks.priority.low"),
    medium: t("tasks.priority.medium"),
    high: t("tasks.priority.high"),
    urgent: t("tasks.priority.urgent"),
  };

  return (
    <div
      className={`group rounded-xl border p-4 transition-colors ${
        isDark
          ? "border-border bg-surface hover:border-primary/40"
          : "border-border bg-surface hover:border-primary/30"
      } ${task.status === "completed" ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <IconButton
          onClick={() => onComplete(task._id)}
          disabled={task.status === "completed"}
          title={t("tasks.markComplete")}
          variant={task.status === "completed" ? "success" : "secondary"}
          size="icon-sm"
          className="mt-0.5"
          icon={
            task.status === "completed" ? (
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.2}
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="8" />
              </svg>
            )
          }
        />

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-medium ${
              task.status === "completed" ? "text-text-secondary line-through" : "text-text-primary"
            }`}
          >
            {task.title}
          </p>
          {task.description && (
            <p className="theme-muted mt-1 line-clamp-2 text-xs">{task.description}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                isDark ? pc.dark : pc.light
              }`}
            >
              {priorityLabels[task.priority] || priorityLabels.medium}
            </span>
            {due && (
              <span className={`rounded-full px-2 py-0.5 text-[10px] ${due.color}`}>
                {due.label}
              </span>
            )}
            {task.source === "ai" && (
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] ${
                  isDark
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-success/20 bg-success/5 text-success"
                }`}
              >
                AI
              </span>
            )}
          </div>
        </div>

        <IconButton
          onClick={() => onDelete(task._id)}
          title={t("tasks.deleteTask")}
          variant="danger"
          size="icon-sm"
          className="opacity-0 group-hover:opacity-100"
          icon={
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          }
        />
      </div>
    </div>
  );
}

function CreateTaskModal({ onClose, onSubmit, submitting, t }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "medium",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="theme-surface w-full max-w-md rounded-2xl">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h3 className="text-base font-semibold text-text-primary">{t("tasks.newTask")}</h3>
          <IconButton
            onClick={onClose}
            title={t("tasks.close")}
            variant="ghost"
            size="icon-sm"
            icon={
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
          />
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">
          <div>
            <label className="theme-muted mb-1 block text-xs font-medium">{t("tasks.field.title")}</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder={t("tasks.field.titlePlaceholder")}
              required
              className="theme-field w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="theme-muted mb-1 block text-xs font-medium">{t("tasks.field.description")}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              placeholder={t("tasks.field.descriptionPlaceholder")}
              className="theme-field w-full resize-none rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="theme-muted mb-1 block text-xs font-medium">{t("tasks.field.dueDate")}</label>
              <input
                type="datetime-local"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="theme-field w-full rounded-lg px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="theme-muted mb-1 block text-xs font-medium">{t("tasks.field.priority")}</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="theme-field w-full rounded-lg px-3 py-2 text-sm"
              >
                <option value="low">{t("tasks.priority.low")}</option>
                <option value="medium">{t("tasks.priority.medium")}</option>
                <option value="high">{t("tasks.priority.high")}</option>
                <option value="urgent">{t("tasks.priority.urgent")}</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className={getButtonClassName({ variant: "secondary", size: "md", className: "flex-1" })}
            >
              {t("common.cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || !form.title.trim()}
              className={getButtonClassName({ variant: "primary", size: "md", className: "flex-1" })}
            >
              {submitting ? t("common.creating") : t("tasks.createTask")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const { t, locale } = useLanguage();
  const tasks = useSelector(selectAllTasks);
  const loading = useSelector(selectTaskLoading);
  const submitting = useSelector(selectTaskSubmitting);
  const error = useSelector(selectTaskError);
  const [activeTab, setActiveTab] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    dispatch(fetchTasksThunk(activeTab ? { status: activeTab } : {}));
  }, [dispatch, activeTab]);

  const handleCreate = (formData) => {
    dispatch(createTaskThunk(formData)).then((res) => {
      if (!res.error) setShowModal(false);
    });
  };
  const handleComplete = (id) => dispatch(completeTaskThunk(id));
  const handleDelete = (id) => {
    if (window.confirm(t("tasks.confirmDelete"))) dispatch(deleteTaskThunk(id));
  };

  const pending = tasks.filter((task) => task.status === "pending").length;
  const aiTasks = tasks.filter((task) => task.source === "ai").length;

  return (
    <div className="theme-page min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-text-primary">{t("tasks.title")}</h1>
            <p className="theme-muted mt-1 text-sm">{t("tasks.summary", { pending, aiTasks })}</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            id="create-task-btn"
            className={getButtonClassName({ variant: "primary", size: "md" })}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            {t("tasks.addTask")}
          </button>
        </div>

        <div className="theme-surface mb-6 flex gap-1 rounded-xl p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={getButtonClassName({
                variant: activeTab === tab.value ? "primary" : "ghost",
                size: "sm",
                className: "min-w-0 flex-1",
              })}
            >
              {t(tab.labelKey)}
            </button>
          ))}
        </div>

        {error && (
          <div className="theme-error-surface mb-4 rounded-xl border px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="theme-surface mb-4 flex h-14 w-14 items-center justify-center rounded-full text-2xl">
              ✓
            </div>
            <p className="theme-muted text-sm">{t("tasks.noTasks")}</p>
            <p className="theme-muted mt-1 text-xs">{t("tasks.noTasksHelp")}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onComplete={handleComplete}
                onDelete={handleDelete}
                isDark={isDark}
                t={t}
                locale={locale}
              />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreate}
          submitting={submitting}
          t={t}
        />
      )}
    </div>
  );
}
