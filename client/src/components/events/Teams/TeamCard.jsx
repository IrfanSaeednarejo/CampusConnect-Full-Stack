import React, { useState } from "react";
import Button from "../../common/Button";

export default function TeamCard({ team, onJoinClick, userHasTeam }) {
  const isFull = team.members.length >= (team.maxSize || 5); // Fallback to 5 if undefined

  return (
    <div className="bg-[#161b22] border border-[#30363d] hover:border-[#8b949e] rounded-xl p-5 transition-colors flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-white line-clamp-1">{team.name}</h3>
          {team.requiresPassword && (
             <span className="material-symbols-outlined text-[#8b949e] text-sm" title="Password Required">lock</span>
          )}
        </div>
        
        <div className="mb-4">
          <p className="text-xs text-[#8b949e] uppercase font-semibold tracking-wider mb-2">Members ({team.members.length}/{team.maxSize || 5})</p>
          <div className="flex flex-wrap gap-2 text-sm text-[#c9d1d9]">
            {team.members.map((m) => (
                <span key={m.userId?._id || m.userId} className="bg-[#0d1117] border border-[#30363d] px-2 py-1 rounded text-[11px] font-medium text-[#8b949e] flex items-center gap-1.5 max-w-full">
                  <span className="truncate">{m.userId?.profile?.displayName || m.user?.displayName || "Anonymous Participant"}</span>
                  {m.role === 'leader' && <span className="text-[#e3b341]">👑</span>}
                </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-[#30363d] mt-2">
        <Button 
          variant={isFull ? "danger" : "outline"} 
          className="w-full justify-center py-2"
          disabled={isFull || userHasTeam}
          onClick={() => onJoinClick(team)}
        >
          {isFull ? "Team Full" : (userHasTeam ? "Leave Current Team to Join" : "Request to Join")}
        </Button>
      </div>
    </div>
  );
}
