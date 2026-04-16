export default function TeamStatusHeader({ status, teamName }) {
  if (status === "enrolled") {
    return (
      <div className="bg-[#1dc964]/10 border border-[#1dc964]/20 p-4 rounded-xl flex items-center gap-4">
        <span className="material-symbols-outlined text-[#1dc964] text-3xl">verified_user</span>
        <div>
          <h2 className="text-[#1dc964] font-bold text-lg">Enrolled in {teamName}</h2>
          <p className="text-[#8b949e] text-sm">You are officially part of this team for the event.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1f6feb]/10 border border-[#1f6feb]/20 p-4 rounded-xl flex items-center gap-4">
      <span className="material-symbols-outlined text-[#1f6feb] text-3xl">group_add</span>
      <div>
        <h2 className="text-[#58a6ff] font-bold text-lg">Independent Participant</h2>
        <p className="text-[#8b949e] text-sm">You are currently looking for a team. Join an open team below or create your own.</p>
      </div>
    </div>
  );
}
