export default function MemberCard({ member }) {
  return (
    <div className="flex items-center justify-between p-4 bg-background border border-border rounded-lg">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold">
          {member.avatar}
        </div>
        <div>
          <div className="text-text-primary font-semibold">{member.name}</div>
          <div className="text-sm text-text-secondary">{member.role}</div>
        </div>
      </div>
      <button className="px-4 py-2 rounded-lg bg-surface-hover text-text-primary text-sm font-medium border border-border hover:bg-[#C7D2FE] transition-colors">
        View Profile
      </button>
    </div>
  );
}
