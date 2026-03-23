import Badge from "./Badge";
import Button from "./Button";

export default function MemberCard({
  name,
  role,
  interests = [],
  joinDate,
  followers,
  onConnect,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-4 p-4 rounded-lg border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] transition-colors ${className}`}
    >
      <div>
        <h2 className="text-[#e6edf3] text-lg font-bold leading-tight">
          {name}
        </h2>
        <p className="text-[#8b949e] text-sm mt-1">{role}</p>
      </div>

      <div>
        <p className="text-[#8b949e] text-xs mb-2">Interests:</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, idx) => (
            <Badge key={idx} variant="primary">
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-[#8b949e] border-t border-[#30363d] pt-3">
        <p>📅 Joined: {joinDate}</p>
        <p>👥 {followers} followers</p>
      </div>

      <Button
        variant="primary"
        className="h-8 px-3 text-xs w-full"
        onClick={onConnect}
      >
        Connect
      </Button>
    </div>
  );
}
