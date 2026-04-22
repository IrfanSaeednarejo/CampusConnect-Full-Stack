import React from "react";
import Button from "../../common/Button";
import TeamRoleBadge from "./TeamRoleBadge";

export default function MyTeamDashboard({ team, user, onLeave, loading }) {
  if (!team) return null;

  const isLeader = team.members.some(m => (m.user?._id === user._id || m.userId === user._id) && m.role === 'leader');

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden mt-6 shadow-xl">
      <div className="p-6 border-b border-[#30363d] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#21262d]/50">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            {team.name}
            {team.requiresPassword && <span className="material-symbols-outlined text-[#8b949e] text-[18px]" title="Password Protected">lock</span>}
          </h2>
          <p className="text-[#8b949e] text-sm mt-1">
            Capacity: {team.members.length} / {team.maxSize || 5}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="danger" disabled={loading} onClick={onLeave}>
             {isLeader ? "Disband / Leave Team" : "Leave Team"}
           </Button>
        </div>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between border-b border-[#30363d] pb-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#8b949e]">Active Roster</h3>
            <span className="text-[10px] font-bold text-[#1f6feb] bg-[#1f6feb]/10 px-2 py-1 rounded">
              Invite Code: {team.inviteCode}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {team.members.map(m => {
              const profile = m.userId?.profile || m.user; // Support both populated and fallback
              const isMe = (m.userId?._id || m.userId) === user._id;
              
              return (
                <div key={m.userId?._id || m.userId} className={`p-4 rounded-2xl border transition-all ${isMe ? 'bg-[#1f6feb]/5 border-[#1f6feb]/30 shadow-[0_0_20px_rgba(31,111,235,0.05)]' : 'bg-[#0d1117] border-[#30363d] hover:border-[#1f6feb]/50'}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative group/avatar">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#161b22] shadow-inner bg-[#161b22] flex items-center justify-center">
                        {profile?.avatar ? (
                          <img src={profile.avatar} alt={profile.displayName} className="w-full h-full object-cover"/>
                        ) : (
                          <span className="material-symbols-outlined text-[#30363d] text-2xl">person</span>
                        )}
                      </div>
                      <div className="absolute -bottom-1 -right-1">
                        <TeamRoleBadge role={m.role} />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-white truncate flex items-center gap-2">
                        {profile?.displayName || "Anonymous Researcher"}
                        {isMe && <span className="w-1.5 h-1.5 rounded-full bg-[#1f6feb] animate-pulse"></span>}
                      </p>
                      <p className="text-[10px] text-[#8b949e] font-medium uppercase tracking-wider truncate">
                         {m.userId?.academic?.department || "Campus Member"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
