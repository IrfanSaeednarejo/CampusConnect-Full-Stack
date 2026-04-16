import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent, transitionStateThunk, postAnnouncementThunk, publishLeaderboardThunk, updateJudgesThunk } from "../../../redux/slices/eventSlice";
import { fetchAllSubmissionsThunk, selectAllSubmissions } from "../../../redux/slices/submissionSlice";
import { disqualifyTeamThunk } from "../../../redux/slices/teamSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import Button from "../../../components/common/Button";

export default function EventAdminDashboard() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [announcementText, setAnnouncementText] = useState("");
  const [judgeIdInput, setJudgeIdInput] = useState("");
  
  const event = useSelector(selectSelectedEvent);
  const allSubmissions = useSelector(selectAllSubmissions);
  const loading = !event;

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      dispatch(fetchAllSubmissionsThunk(eventId));
    }
  }, [dispatch, eventId]);

  if (loading) return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;

  const handleTransition = async (newState) => {
    if (!window.confirm(`Are you sure you want to transition this event to: ${newState}?`)) return;
    await dispatch(transitionStateThunk({ id: eventId, stateData: { status: newState } }));
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;
    await dispatch(postAnnouncementThunk({ id: eventId, payload: { content: announcementText } }));
    setAnnouncementText("");
  };

  const handlePublishLeaderboard = async () => {
    if (!window.confirm("Publishing the leaderboard makes all scores visible. Continue?")) return;
    await dispatch(publishLeaderboardThunk(eventId));
  };

  const handleAssignJudge = async (e) => {
    e.preventDefault();
    if (!judgeIdInput.trim()) return;
    // For MVP, we pass the current judges + the new one.
    const currentJudges = event.judgingConfig?.judges?.map(j => j._id) || [];
    await dispatch(updateJudgesThunk({ id: eventId, judgeIds: [...currentJudges, judgeIdInput.trim()] }));
    setJudgeIdInput("");
  };

  const handleDisqualify = async (teamId) => {
    if (!window.confirm("Are you sure you want to disqualify this team? This cannot be undone automatically.")) return;
    await dispatch(disqualifyTeamThunk({ eventId, teamId }));
  };

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
                 <Button variant="outline" className="text-xs px-2 py-1" onClick={() => handleTransition("ongoing")}>Execute</Button>
               </li>
               <li className="flex justify-between items-center text-sm">
                 <span className="text-white">Lock Submissions</span>
                 <Button variant="outline" className="text-xs px-2 py-1 border-[#f85149] text-[#f85149] hover:bg-[#f85149] hover:text-white" onClick={() => handleTransition("judging")}>Lock</Button>
               </li>
               <li className="flex justify-between items-center text-sm">
                 <span className="text-white">Publish Leaderboard</span>
                 <Button variant="outline" className="text-xs px-2 py-1" onClick={handlePublishLeaderboard}>Publish</Button>
               </li>
             </ul>
           </div>

           <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
             <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4">Event KPIs</h3>
             <div className="grid grid-cols-2 gap-4">
               <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg text-center">
                 <p className="text-3xl font-black text-[#1f6feb]">{allSubmissions.length || 0}</p>
                 <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mt-1">Submissions</p>
               </div>
               <div className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg text-center">
                 <p className="text-3xl font-black text-[#1dc964]">{0}</p>
                 <p className="text-xs text-[#8b949e] uppercase font-bold tracking-widest mt-1">Checked In</p>
               </div>
             </div>
           </div>

           <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
             <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4">Assign Judges</h3>
             <form onSubmit={handleAssignJudge} className="flex gap-2">
                 <input 
                   type="text" 
                   required
                   value={judgeIdInput}
                   onChange={e => setJudgeIdInput(e.target.value)}
                   placeholder="Enter User ID..." 
                   className="flex-1 bg-[#0d1117] text-white p-2 text-sm rounded border border-[#30363d] focus:border-[#1f6feb] outline-none" 
                 />
                 <Button type="submit" variant="primary" className="text-sm px-3 py-2 whitespace-nowrap">Assign</Button>
             </form>
             <p className="text-xs text-[#8b949e] mt-2">Current Judges: {event.judgingConfig?.judges?.length || 0}</p>
           </div>
           
           <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 text-center">
               <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4 text-left">Master Data</h3>
               <Button variant="outline" className="w-full justify-center gap-2" onClick={() => console.log(allSubmissions)}>
                 <span className="material-symbols-outlined text-sm">download</span> Dump Submissions JSON
               </Button>
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
                 {allSubmissions.length === 0 ? (
                   <tr><td colSpan="4" className="p-4 text-center text-[#8b949e]">No participating teams found.</td></tr>
                 ) : (
                   allSubmissions.map(sub => (
                     <tr key={sub._id} className="hover:bg-[#21262d] transition-colors">
                       <td className="p-3 flex items-center gap-2">
                         <span className="material-symbols-outlined text-[#8b949e] text-lg">integration_instructions</span>
                         <span className="text-white font-medium line-clamp-1">{sub.title || "Untitled"}</span>
                       </td>
                       <td className="p-3 text-[#c9d1d9]">{sub.team?.name || "Unknown"}</td>
                       <td className="p-3"><span className="text-[#e3b341]">{sub.status}</span></td>
                       <td className="p-3">
                         <button onClick={() => handleDisqualify(sub.team?._id)} title="Disqualify Team" className="text-[#8b949e] hover:text-[#f85149] transition-colors"><span className="material-symbols-outlined text-[20px]">person_remove</span></button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>

            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
             <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4">Broadcast Announcement</h3>
             <form className="flex flex-col gap-3" onSubmit={handleBroadcast}>
               <textarea rows="3" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} placeholder="Push a live notification to all participants' screens..." className="w-full bg-[#0d1117] text-white p-3 rounded-lg border border-[#30363d] focus:border-[#1f6feb] outline-none resize-none"></textarea>
               <Button type="submit" variant="primary" className="self-end" disabled={!announcementText.trim()}><span className="material-symbols-outlined mr-2 text-sm">campaign</span> Push Alert via WebSocket</Button>
             </form>
           </div>
        </div>

      </div>
    </div>
  );
}
