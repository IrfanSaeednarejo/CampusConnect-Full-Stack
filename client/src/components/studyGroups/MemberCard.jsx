export default function MemberCard({ member }) {
  const user = member.memberId || {};
  const profile = user.profile || {};
  const fullName = profile.displayName || `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Anonymous User";
  const avatar = profile.avatar;
  const initials = profile.firstName ? `${profile.firstName[0]}${profile.lastName?.[0] || ""}`.toUpperCase() : "??";
  const role = member.role || "member";

  return (
    <div className="flex items-center justify-between p-4 bg-[#1c2128] border border-[#30363d] rounded-lg hover:border-[#238636]/30 transition-all">
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={fullName} className="w-10 h-10 rounded-full object-cover border border-[#30363d]" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-[#238636] font-bold text-sm">
            {initials}
          </div>
        )}
        <div>
          <div className="text-[#c9d1d9] font-bold text-sm leading-tight">{fullName}</div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-tighter ${
              role === "coordinator" ? "bg-[#238636] text-white" : "bg-[#30363d] text-[#8b949e]"
            }`}>
              {role}
            </span>
            {user.academic?.department && (
              <span className="text-[10px] text-[#8b949e]">{user.academic.department}</span>
            )}
          </div>
        </div>
      </div>
      <button className="text-[11px] font-bold text-[#c9d1d9] hover:text-[#238636] transition-colors uppercase tracking-wider">
        Profile
      </button>
    </div>
  );
}
