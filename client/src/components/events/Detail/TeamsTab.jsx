import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedEvent } from "../../../../redux/slices/eventSlice";
import api from "../../../../api/axios";
import CircularProgress from "../../../common/CircularProgress";

export default function TeamsTab() {
  const { id } = useParams();
  const event = useSelector(selectSelectedEvent);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // Directly fetch teams logic locally for read-only view to avoid contaminating teamSlice which targets the active participant logic
  useEffect(() => {
    const fetchEventTeams = async () => {
      try {
        const { data } = await api.get(`/competitions/${id}/teams`);
        setTeams(data.data || []);
      } catch (err) {
        console.error("Failed to load public teams grid", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchEventTeams();
  }, [id]);

  if (loading) return <div className="py-20 flex justify-center"><CircularProgress /></div>;

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex justify-between items-end mb-6 border-b border-[#30363d] pb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="material-symbols-outlined text-[#1f6feb]">group</span> Registered Teams
        </h2>
        <span className="text-sm text-[#8b949e] font-semibold uppercase tracking-widest">{teams.length} Teams</span>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-10 bg-[#0d1117] rounded-lg border border-[#30363d]">
          <p className="text-[#8b949e]">No teams have registered for this event yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((t) => (
             <div key={t._id} className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl flex items-start gap-4">
               <div className="w-12 h-12 rounded-full bg-[#161b22] border-[2px] border-[#30363d] flex items-center justify-center font-bold text-[#8b949e]">
                 {t.name.substring(0,2).toUpperCase()}
               </div>
               <div>
                  <h3 className="font-bold text-white line-clamp-1">{t.name}</h3>
                  <p className="text-xs text-[#8b949e] mt-1">{t.members?.length || 0} Members</p>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
