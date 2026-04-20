import Badge from "./Badge";
import ConnectionButton from "../network/ConnectionButton";

export default function MemberCard({
  userId,
  name,
  role,
  interests = [],
  joinDate,
  followers,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-4 p-4 rounded-lg border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] transition-colors ${className}`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h2 className="text-[#e6edf3] text-lg font-bold leading-tight">
            {name}
          </h2>
          <p className="text-[#8b949e] text-sm mt-1">{role || "Member"}</p>
        </div>
      </div>

      <div>
        <p className="text-[#8b949e] text-xs mb-2">Interests:</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, idx) => (
            <Badge key={idx} variant="primary">
              {interest}
            </Badge>
          ))}
          {interests.length === 0 && <span className="text-xs text-slate-500 italic">No interests specified</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-[#8b949e] border-t border-[#30363d] pt-3">
        {joinDate && <p>📅 Joined: {joinDate}</p>}
      </div>

      <div className="mt-auto pt-2">
        <ConnectionButton targetUserId={userId} />
      </div>
    </div>
  );
}
