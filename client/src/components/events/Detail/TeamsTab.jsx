import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectSelectedEvent } from "../../../redux/slices/eventSlice";
import api from "../../../api/axios";
import CircularProgress from "../../common/CircularProgress";

export default function TeamsTab() {
  const { id } = useParams();
  const event = useSelector(selectSelectedEvent);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  const isIndividual = event?.participationType === 'individual';

  useEffect(() => {
    const fetchEventTeams = async () => {
      try {
        if (isIndividual) {
          // For individual events, we use the approved registrations from the event object
          // or fetch them if they aren't fully populated.
          // For now, let's assume approved participants are what we show.
          const approvedParticipants = event?.registrations
            ?.filter(r => r.status === 'approved' || r.status === 'registered')
            ?.map(r => ({
              _id: r._id,
              teamName: r.userId?.profile?.displayName || 'Participant',
              avatar: r.userId?.profile?.avatar,
              isIndividual: true,
              members: [r.userId]
            })) || [];
          setTeams(approvedParticipants);
          setLoading(false);
        } else {
          const { data } = await api.get(`/competitions/${id}/teams`);
          const items = data.data?.docs || data.data?.items || (Array.isArray(data.data) ? data.data : []);
          setTeams(items);
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load public participants grid", err);
        setLoading(false);
      }
    };
    if (id) fetchEventTeams();
  }, [id, isIndividual, event?.registrations]);

  if (loading) return <div className="py-20 flex justify-center"><CircularProgress /></div>;

  const title = isIndividual ? "Registered Participants" : "Registered Teams";
  const countLabel = isIndividual ? "Participants" : "Teams";

  return (
    <div className="p-6 md:p-8 animate-fade-in">
      <div className="flex justify-between items-end mb-6 border-b border-[#30363d] pb-2">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
           <span className="material-symbols-outlined text-[#1f6feb]">{isIndividual ? 'person' : 'group'}</span> {title}
        </h2>
        <span className="text-sm text-[#8b949e] font-semibold uppercase tracking-widest">{teams.length} {countLabel}</span>
      </div>

      {teams.length === 0 ? (
        <div className="text-center py-10 bg-[#0d1117] rounded-lg border border-[#30363d]">
          <p className="text-[#8b949e]">No {countLabel.toLowerCase()} have registered for this event yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {teams.map((t) => (
             <div key={t._id} className="bg-[#0d1117] border border-[#30363d] p-4 rounded-xl flex items-start gap-4 hover:border-[#8b949e] transition-colors">
               {t.avatar ? (
                 <img src={t.avatar} className="w-12 h-12 rounded-full border-[2px] border-[#30363d]" alt={t.teamName} />
               ) : (
                 <div className="w-12 h-12 rounded-full bg-[#161b22] border-[2px] border-[#30363d] flex items-center justify-center font-bold text-[#8b949e]">
                   {(t.teamName || 'U').substring(0,2).toUpperCase()}
                 </div>
               )}
               <div>
                  <h3 className="font-bold text-white line-clamp-1">{t.teamName || 'Unnamed'}</h3>
                  <p className="text-xs text-[#8b949e] mt-1">
                    {t.isIndividual ? 'Individual Entry' : `${t.members?.length || 0} Members`}
                  </p>
               </div>
             </div>
          ))}
        </div>
      )}
    </div>
  );
}
