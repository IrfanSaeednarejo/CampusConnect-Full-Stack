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

      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8b949e] border-b border-[#30363d] pb-2">Roster</h3>
          <ul className="space-y-3">
            {team.members.map(m => {
              const isMe = m.user?._id === user._id || m.userId === user._id;
              return (
                <li key={m.user?._id || m.userId} className={`flex justify-between items-center bg-[#0d1117] border ${isMe ? 'border-[#1f6feb]' : 'border-[#30363d]'} p-3 rounded-lg`}>
                  <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-[#161b22] flex items-center justify-center text-[#8b949e] border border-[#30363d]">
                       {m.user?.avatar ? <img src={m.user.avatar} alt="avatar" className="w-full h-full rounded-full object-cover"/> : <span className="material-symbols-outlined">person</span>}
                     </div>
                     <div>
                       <p className="font-semibold text-white flex items-center gap-2">
                         {m.user?.displayName || "Anonymous User"}
                         {isMe && <span className="text-[10px] bg-[#1f6feb]/20 text-[#58a6ff] px-1.5 py-0.5 rounded ml-1">YOU</span>}
                       </p>
                       <p className="text-xs text-[#8b949e]">{m.user?.email || "Email hidden"}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TeamRoleBadge role={m.role} />
                    {/* Assuming kicking functionality can be wired up via a prop passed later, omit for simple layout */}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#8b949e] border-b border-[#30363d] pb-2">Actions</h3>
          <div className="bg-[#0d1117] p-4 border border-[#30363d] rounded-lg text-center">
            <span className="material-symbols-outlined text-4xl text-[#30363d] mb-2">share</span>
            <p className="text-sm text-white font-semibold mb-1">Invite Members</p>
            <p className="text-xs text-[#8b949e] mb-4">Share your team name {team.requiresPassword && "and password"} with others.</p>
            {team.requiresPassword && (
              <div className="bg-[#161b22] px-3 py-2 rounded text-[#e3b341] border border-[#d29922]/30 text-xs text-left mb-3">
                <strong>Password required:</strong> Authorized users will need it to join.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
