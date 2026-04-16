export default function TeamRoleBadge({ role }) {
  if (role === "leader") {
    return (
      <span className="inline-flex items-center gap-1 bg-[#d29922]/10 text-[#e3b341] border border-[#d29922]/30 px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
        <span className="material-symbols-outlined text-[12px]">military_tech</span> Leader
      </span>
    );
  }

  return (
    <span className="inline-flex items-center bg-[#30363d]/50 text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider">
      Member
    </span>
  );
}
