import MemberCard from "./MemberCard";

export default function MembersSection({ members }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
      <h2 className="text-xl font-bold text-[#c9d1d9] mb-4">
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
