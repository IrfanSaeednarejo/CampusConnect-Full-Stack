import MemberCard from "./MemberCard";

export default function MembersSection({ members }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-text-primary mb-4">
        Members ({members.length})
      </h2>
      <div className="space-y-3">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}
