export default function GroupInfoSection({ group }) {
  return (
    <div className="space-y-6">
      {/* Group Info */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c9d1d9] mb-4">
          About This Group
        </h2>
        <p className="text-[#8b949e] mb-6">{group.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#238636] text-2xl">
              group
            </span>
            <div>
              <div className="text-sm text-[#8b949e]">Members</div>
              <div className="text-[#c9d1d9] font-semibold">
                {group.members} / {group.maxMembers || "Unlimited"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#238636] text-2xl">
              schedule
            </span>
            <div>
              <div className="text-sm text-[#8b949e]">Meeting Schedule</div>
              <div className="text-[#c9d1d9] font-semibold">
                {group.meetingSchedule}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#238636] text-2xl">
              person
            </span>
            <div>
              <div className="text-sm text-[#8b949e]">Created By</div>
              <div className="text-[#c9d1d9] font-semibold">
                {group.createdBy}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#238636] text-2xl">
              calendar_today
            </span>
            <div>
              <div className="text-sm text-[#8b949e]">Created</div>
              <div className="text-[#c9d1d9] font-semibold">
                {group.createdDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
