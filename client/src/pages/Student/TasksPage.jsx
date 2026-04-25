import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTasksThunk,
  createTaskThunk,
  completeTaskThunk,
  deleteTaskThunk,
  selectAllTasks,
  selectTaskLoading,
  selectTaskSubmitting,
  selectTaskError,
  clearTaskError,
} from '../../redux/slices/taskSlice';

const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-blue-400 border-blue-500/30 bg-blue-500/5' },
  medium: { label: 'Medium', color: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/5' },
  high:   { label: 'High',   color: 'text-orange-400 border-orange-500/30 bg-orange-500/5' },
  urgent: { label: 'Urgent', color: 'text-red-400 border-red-500/30 bg-red-500/5' },
};

const STATUS_TABS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

function getDueBadge(dueDate, status) {
  if (!dueDate || status === 'completed') return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diffH = (due - now) / 3600000;
  if (diffH < 0) return { label: 'Overdue', color: 'text-red-400 bg-red-500/10' };
  if (diffH < 24) return { label: 'Due today', color: 'text-orange-400 bg-orange-500/10' };
  if (diffH < 72) return { label: 'Due soon', color: 'text-yellow-400 bg-yellow-500/10' };
  return { label: due.toLocaleDateString([], { month: 'short', day: 'numeric' }), color: 'text-[#8b949e] bg-[#21262d]' };
}

function TaskCard({ task, onComplete, onDelete }) {
  const pc = PRIORITY_CONFIG[task.priority] || PRIORITY_CONFIG.medium;
  const due = getDueBadge(task.dueDate, task.status);

  return (
    <div className={`group bg-[#161b22] border border-[#30363d] rounded-xl p-4 hover:border-[#3fb950]/40 transition-all
      ${task.status === 'completed' ? 'opacity-60' : ''}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={() => onComplete(task._id)}
          disabled={task.status === 'completed'}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-all
            ${task.status === 'completed'
              ? 'bg-[#3fb950] border-[#3fb950]'
              : 'border-[#30363d] hover:border-[#3fb950]'}`}
          title="Mark complete"
        >
          {task.status === 'completed' && (
            <svg className="w-3 h-3 text-white mx-auto" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${task.status === 'completed' ? 'line-through text-[#8b949e]' : 'text-[#e6edf3]'}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-xs text-[#8b949e] mt-1 line-clamp-2">{task.description}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${pc.color}`}>
              {pc.label}
            </span>
            {due && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${due.color}`}>
                📅 {due.label}
              </span>
            )}
            {task.source === 'ai' && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#3fb950]/10 text-[#3fb950] border border-[#3fb950]/20">
                ✨ AI
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(task._id)}
          className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-[#8b949e] hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
          title="Delete task"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

function CreateTaskModal({ onClose, onSubmit, submitting }) {
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d]">
          <h3 className="text-base font-semibold text-[#e6edf3]">New Task</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Title *</label>
            <input
              type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="What needs to be done?" required
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3]
                placeholder-[#8b949e] outline-none focus:border-[#3fb950] transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#8b949e] mb-1">Description</label>
            <textarea
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} placeholder="Optional details…"
              className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3]
                placeholder-[#8b949e] outline-none focus:border-[#3fb950] resize-none transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Due Date</label>
              <input
                type="datetime-local" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3]
                  outline-none focus:border-[#3fb950] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#8b949e] mb-1">Priority</label>
              <select
                value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3]
                  outline-none focus:border-[#3fb950] transition-colors"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-xl border border-[#30363d] text-sm text-[#8b949e] hover:text-white hover:border-[#8b949e] transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting || !form.title.trim()}
              className="flex-1 py-2 rounded-xl bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white text-sm font-medium transition-colors">
              {submitting ? 'Creating…' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TasksPage() {
  const dispatch = useDispatch();
  const tasks = useSelector(selectAllTasks);
  const loading = useSelector(selectTaskLoading);
  const submitting = useSelector(selectTaskSubmitting);
  const error = useSelector(selectTaskError);
  const [activeTab, setActiveTab] = useState('');
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
    if (window.confirm('Delete this task?')) dispatch(deleteTaskThunk(id));
  };

  const pending = tasks.filter((t) => t.status === 'pending').length;
  const aiTasks = tasks.filter((t) => t.source === 'ai').length;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-[#e6edf3]">My Tasks</h1>
            <p className="text-sm text-[#8b949e] mt-1">
              {pending} pending · {aiTasks} created by Nexus
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            id="create-task-btn"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors shadow-lg shadow-green-500/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Add Task
          </button>
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1 mb-6 p-1 bg-[#161b22] border border-[#30363d] rounded-xl">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all
                ${activeTab === tab.value
                  ? 'bg-[#238636] text-white'
                  : 'text-[#8b949e] hover:text-[#e6edf3]'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Tasks list */}
        {loading ? (
          <div className="flex justify-center py-16">
            <svg className="w-8 h-8 animate-spin text-[#3fb950]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-[#161b22] border border-[#30363d] flex items-center justify-center text-2xl mb-4">✅</div>
            <p className="text-[#8b949e] text-sm">No tasks here.</p>
            <p className="text-[#8b949e] text-xs mt-1">Create one manually or ask Nexus to create tasks for you!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onComplete={handleComplete} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <CreateTaskModal onClose={() => setShowModal(false)} onSubmit={handleCreate} submitting={submitting} />
      )}
    </div>
  );
}
