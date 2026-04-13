import { useNavigate } from "react-router-dom";

export default function GroupCard({ group }) {
  const navigate = useNavigate();
  const groupId = group._id || group.id;
  const memberCount = group.memberCount ?? group.members?.length ?? 0;

  return (
    <div className="bg-surface border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
      <div className="mb-4">
        <h3 className="text-text-primary text-lg font-bold mb-2">{group.name}</h3>
        <p className="text-text-secondary text-sm mb-3">{group.description}</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary/20 text-primary border border-primary/30">
          {group.course || group.subject || 'General'}
        </span>
        <div className="flex items-center gap-1 text-text-secondary">
          <span className="material-symbols-outlined text-sm">group</span>
          <span className="text-xs font-medium">{memberCount} Members</span>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate(`/study-groups/${groupId}`)}
          className="flex-1 px-4 py-2 rounded-lg bg-surface-hover text-text-primary text-sm font-semibold border border-border hover:bg-[#C7D2FE] transition-colors"
        >
          View Group
        </button>
        <button
          onClick={() => navigate(`/study-groups/${groupId}/join`)}
          className="flex-1 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-hover transition-colors"
        >
          Join Group
        </button>
      </div>
    </div>
  );
}
