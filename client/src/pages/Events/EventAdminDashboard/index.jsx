import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent } from "../../../redux/slices/eventSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import Button from "../../../components/common/Button";

export default function EventAdminDashboard() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const event = useSelector(selectSelectedEvent);
  const loading = !event;

  useEffect(() => {
    if (eventId) dispatch(fetchEventById(eventId));
  }, [dispatch, eventId]);

  if (loading) return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] pb-20">
      
      {/* Header */}
      <div className="bg-[#161b22] border-b border-[#30363d] py-6 px-4 sm:px-10 lg:px-20">
        <button onClick={() => navigate(`/events/${eventId}`)} className="flex items-center text-[#8b949e] hover:text-white transition-colors mb-4">
          <span className="material-symbols-outlined mr-2">arrow_back</span> Back to Event
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1f6feb] text-4xl">admin_panel_settings</span>
              Organizer HQ
            </h1>
            <p className="text-[#8b949e] mt-1">{event.title}</p>
          </div>
          <Button variant="primary" onClick={() => navigate(`/events/${eventId}/check-in`)}>
            <span className="material-symbols-outlined mr-2">qr_code_scanner</span> Launch Scanner
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-6xl mx-auto px-4 mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Lifecycle & KPIs */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 relative overflow-hidden">
             <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4 flex justify-between">
               Lifecycle controls
               <span className={`text-xs px-2 py-0.5 rounded uppercase font-bold tracking-wider ${event.status === 'registration' ? 'bg-[#1dc964]/10 text-[#1dc964]' : 'bg-[#30363d] text-[#8b949e]'}`}>{event.status}</span>
             </h3>
             <ul className="space-y-4">
               <li className="flex justify-between items-center text-sm">
                 <span className="text-white">Push to Ongoing</span>
                 <Button variant="outline" className="text-xs px-2 py-1">Execute</Button>
               </li>
               <li className="flex justify-between items-center text-sm">
                 <span className="text-white">Lock Submissions</span>
                 <Button variant="outline" className="text-xs px-2 py-1 border-[#f85149] text-[#f85149] hover:bg-[#f85149] hover:text-white">Lock</Button>
               </li>
               <li className="flex justify-between items-center text-sm">
                 <span className="text-white">Publish Leaderboard</span>
                 <Button variant="outline" className="text-xs px-2 py-1">Publish</Button>
               </li>
             </ul>
           </div>

           <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
             <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4">Event KPIs</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg text-center">
                 <p className="text-3xl font-black text-[#1f6feb]">{event.registrationCount || 0}</p>
                 <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mt-1">Registrations</p>
               </div>
               <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg text-center">
                 <p className="text-3xl font-black text-[#1dc964]">{0}</p>
                 <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mt-1">Checked In</p>
               </div>
             </div>
           </div>
        </div>

        {/* Right Col: Admin tables & Tools */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 overflow-x-auto">
             <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4">Participant Roster</h3>
             <table className="w-full text-left text-sm">
               <thead className="text-[#8b949e] border-b border-[#30363d] bg-[#0d1117]">
                 <tr>
                   <th className="p-3 font-semibold">User</th>
                   <th className="p-3 font-semibold">Team</th>
                   <th className="p-3 font-semibold">Status</th>
                   <th className="p-3 font-semibold">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-[#30363d]">
                 {/* Dummy row mapped until backend provides participant hydration */}
                 <tr className="hover:bg-[#21262d] transition-colors">
                   <td className="p-3 flex items-center gap-2">
                     <span className="material-symbols-outlined text-[#8b949e] text-lg">person</span>
                     <span className="text-white font-medium">Jane Doe</span>
                   </td>
                   <td className="p-3 text-[#c9d1d9]">The Innovators</td>
                   <td className="p-3"><span className="text-[#e3b341]">Pending Check-In</span></td>
                   <td className="p-3">
                     <button className="text-[#8b949e] hover:text-[#f85149] transition-colors"><span className="material-symbols-outlined text-[20px]">person_remove</span></button>
                   </td>
                 </tr>
               </tbody>
             </table>
           </div>

           <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
             <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4">Broadcast Announcement</h3>
             <form className="flex flex-col gap-3">
               <textarea rows="3" placeholder="Push a live notification to all participants' screens..." className="w-full bg-[#0d1117] text-white p-3 rounded-lg border border-[#30363d] focus:border-[#1f6feb] outline-none resize-none"></textarea>
               <Button variant="primary" className="self-end"><span className="material-symbols-outlined mr-2 text-sm">campaign</span> Push Alert via WebSocket</Button>
             </form>
           </div>
        </div>

      </div>
    </div>
  );
}
