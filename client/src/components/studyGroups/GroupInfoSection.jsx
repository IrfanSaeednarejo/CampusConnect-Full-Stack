export default function GroupInfoSection({ group }) {
  return (
    <div className="space-y-6">
      {/* Group Info */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h2 className="text-xl font-bold text-text-primary mb-4">
          About This Group
        </h2>
        <p className="text-text-secondary mb-6">{group.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              group
            </span>
            <div>
              <div className="text-sm text-text-secondary">Members</div>
              <div className="text-text-primary font-semibold">
                {group.members} / {group.maxMembers || "Unlimited"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              schedule
            </span>
            <div>
              <div className="text-sm text-text-secondary">Meeting Schedule</div>
              <div className="text-text-primary font-semibold">
                {group.meetingSchedule}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              person
            </span>
            <div>
              <div className="text-sm text-text-secondary">Created By</div>
              <div className="text-text-primary font-semibold">
                {group.createdBy}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary text-2xl">
              calendar_today
            </span>
            <div>
              <div className="text-sm text-text-secondary">Created</div>
              <div className="text-text-primary font-semibold">
                {group.createdDate}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
