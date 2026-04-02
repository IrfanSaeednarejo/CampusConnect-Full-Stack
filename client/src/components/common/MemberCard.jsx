import Badge from "./Badge";
import Button from "./Button";

export default function MemberCard({
  name,
  role,
  interests = [],
  joinDate,
  followers,
  onConnect,
  connectionStatus = 'none',
  connectLoading = false,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-4 p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors ${className}`}
    >
      <div>
        <h2 className="text-[#e6edf3] text-lg font-bold leading-tight">
          {name}
        </h2>
        <p className="text-text-secondary text-sm mt-1">{role}</p>
      </div>

      <div>
        <p className="text-text-secondary text-xs mb-2">Interests:</p>
        <div className="flex flex-wrap gap-2">
          {interests.map((interest, idx) => (
            <Badge key={idx} variant="primary">
              {interest}
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1 text-sm text-text-secondary border-t border-border pt-3">
        <p>📅 Joined: {joinDate}</p>
        <p>👥 {followers} followers</p>
      </div>

      <Button
        variant={connectionStatus === 'none' ? "primary" : "secondary"}
        className={`h-8 px-3 text-xs w-full flex items-center justify-center gap-2 ${
          connectionStatus === 'pending'
            ? 'bg-[#30363d] text-white border-transparent cursor-default hover:bg-[#30363d]'
            : connectionStatus === 'connected'
            ? 'bg-primary text-white hover:bg-primary-hover border-transparent'
            : ''
        }`}
        disabled={connectLoading || connectionStatus === 'pending'}
        onClick={connectionStatus === 'none' ? onConnect : undefined}
      >
        {connectLoading ? (
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ) : connectionStatus === 'pending' ? (
          <>
            <span className="material-symbols-outlined text-[14px]">schedule</span> Pending
          </>
        ) : connectionStatus === 'connected' ? (
          <>
            <span className="material-symbols-outlined text-[14px]">how_to_reg</span> Connected
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[14px]">person_add</span> Connect
          </>
        )}
      </Button>
    </div>
  );
}
