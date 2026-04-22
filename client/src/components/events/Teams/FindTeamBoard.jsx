import React, { useState } from "react";
import Button from "../../common/Button";
import TeamCard from "./TeamCard";

export default function FindTeamBoard({ teams, onJoinClick, onCreateClick, loading }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredTeams = Array.isArray(teams) 
    ? teams.filter(t => {
        const teamName = t.name || t.teamName || "";
        return teamName.toLowerCase().includes(searchTerm.toLowerCase());
      })
    : [];

  return (
    <div className="mt-8 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#161b22] border border-[#30363d] p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <span className="material-symbols-outlined flex items-center absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">search</span>
          <input 
            type="text" 
            placeholder="Search teams by name..." 
            className="w-full bg-[#0d1117] text-sm text-white px-10 py-2 rounded-md border border-[#30363d] focus:border-[#1f6feb] outline-none placeholder:text-[#8b949e]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <Button variant="primary" onClick={onCreateClick} disabled={loading}>
             Create New Team
          </Button>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 border-b border-[#30363d] pb-2">Open Teams ({filteredTeams.length})</h3>
        {filteredTeams.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-[#30363d] rounded-xl text-[#8b949e]">
            {searchTerm ? "No teams match your search." : "No teams have been formed yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <TeamCard key={team._id} team={team} onJoinClick={onJoinClick} userHasTeam={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
