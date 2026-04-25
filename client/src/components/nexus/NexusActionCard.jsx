import { Link } from 'react-router-dom';

const INTENT_CONFIG = {
  create_note: {
    icon: '📝',
    label: 'Note Created',
    color: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    action: { label: 'View Notes', to: '/notes' },
  },
  create_task: {
    icon: '✅',
    label: 'Task Created',
    color: 'text-green-400 border-green-500/30 bg-green-500/10',
    action: { label: 'View Tasks', to: '/tasks' },
  },
  suggest_mentors: {
    icon: '🎓',
    label: 'Mentors Found',
    color: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    action: { label: 'Browse Mentors', to: '/mentors' },
  },
};

export default function NexusActionCard({ intent, actionTaken }) {
  if (!intent || !actionTaken) return null;
  const config = INTENT_CONFIG[intent];
  if (!config) return null;

  return (
    <div className={`mt-2 flex items-center gap-3 px-3 py-2 rounded-xl border text-xs ${config.color}`}>
      <span className="text-base">{config.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold">{config.label}</p>
        {actionTaken?.title && (
          <p className="opacity-70 truncate">"{actionTaken.title}"</p>
        )}
        {intent === 'suggest_mentors' && actionTaken?.count > 0 && (
          <p className="opacity-70">{actionTaken.count} mentor{actionTaken.count > 1 ? 's' : ''} matched</p>
        )}
      </div>
      <Link
        to={config.action.to}
        className="shrink-0 px-2 py-1 rounded-lg border font-medium hover:opacity-80 transition-opacity"
      >
        {config.action.label} →
      </Link>
    </div>
  );
}
