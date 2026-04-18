export default function GroupInfoSection({ group }) {
  const coordinator = group.coordinatorId?.profile?.displayName || group.coordinatorId?.profile?.firstName || "Unknown";
  const createdDate = group.createdAt ? new Date(group.createdAt).toLocaleDateString() : "Recently";

  return (
    <div className="space-y-6">
      {/* Group Info */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c9d1d9] mb-4">
          About This Group
        </h2>
        <p className="text-[#8b949e] mb-6 leading-relaxed">{group.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#238636] text-2xl">
              school
            </span>
            <div>
              <div className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Course / Subject</div>
              <div className="text-[#c9d1d9] font-semibold">
                {group.course || group.subject || "General"}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#238636] text-2xl">
              group
            </span>
            <div>
              <div className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Capacity</div>
              <div className="text-[#c9d1d9] font-semibold">
                {group.memberCount ?? 0} / {group.maxMembers || "20"} Members
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#238636] text-2xl">
              person
            </span>
            <div>
              <div className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Coordinator</div>
              <div className="text-[#c9d1d9] font-semibold">
                {coordinator}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#238636] text-2xl">
              calendar_today
            </span>
            <div>
              <div className="text-xs text-[#8b949e] uppercase tracking-wider font-semibold">Group Created</div>
              <div className="text-[#c9d1d9] font-semibold">
                {createdDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
