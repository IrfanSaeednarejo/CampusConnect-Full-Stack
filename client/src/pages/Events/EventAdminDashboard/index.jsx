import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchEventById, selectSelectedEvent, transitionStateThunk, postAnnouncementThunk, 
  publishLeaderboardThunk, updateJudgesThunk, fetchRegistrationsThunk, 
  selectRegistrations, approveRegistrationThunk, rejectRegistrationThunk,
  deleteEventThunk
} from "../../../redux/slices/eventSlice";
import { fetchAllSubmissionsThunk, selectAllSubmissions } from "../../../redux/slices/submissionSlice";
import { fetchTeams, selectTeams, disqualifyTeamThunk, kickMemberThunk } from "../../../redux/slices/teamSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import Button from "../../../components/common/Button";
import { toast } from "react-hot-toast";

export default function EventAdminDashboard() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [announcementText, setAnnouncementText] = useState("");
  const [judgeIdInput, setJudgeIdInput] = useState("");
  const [activeTab, setActiveTab] = useState("registrations");
  
  const event = useSelector(selectSelectedEvent);
  const allSubmissions = useSelector(selectAllSubmissions);
  const registrations = useSelector(selectRegistrations);
  const teams = useSelector(selectTeams);
  const loading = !event;

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      dispatch(fetchAllSubmissionsThunk(eventId));
      dispatch(fetchRegistrationsThunk(eventId));
      dispatch(fetchTeams({ eventId }));
    }
  }, [dispatch, eventId]);

  if (loading) return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;

  const handleTransition = async (newState) => {
    if (!window.confirm(`Are you sure you want to transition this event to: ${newState}?`)) return;
    await dispatch(transitionStateThunk({ id: eventId, stateData: { status: newState } }));
  };

  const handleApproveRegistration = async (userId) => {
    try {
      await dispatch(approveRegistrationThunk({ eventId, userId })).unwrap();
      toast.success("Registration approved");
    } catch (err) {
      toast.error(err || "Failed to approve");
    }
  };

  const handleRejectRegistration = async (userId) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      await dispatch(rejectRegistrationThunk({ eventId, userId, reason })).unwrap();
      toast.success("Registration rejected");
    } catch (err) {
      toast.error(err || "Failed to reject");
    }
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
    const currentJudges = event.judgingConfig?.judges?.map(j => j._id) || [];
    await dispatch(updateJudgesThunk({ id: eventId, judgeIds: [...currentJudges, judgeIdInput.trim()] }));
    setJudgeIdInput("");
  };

  const handleDisqualify = async (teamId) => {
    if (!window.confirm("Are you sure you want to disqualify this team? This cannot be undone automatically.")) return;
    await dispatch(disqualifyTeamThunk({ eventId, teamId }));
  };

  const handleKickMember = async (teamId, userId, displayName) => {
    if (!window.confirm(`Are you sure you want to remove ${displayName} from this team?`)) return;
    try {
      await dispatch(kickMemberThunk({ eventId, teamId, userId })).unwrap();
      toast.success(`${displayName} removed from team`);
      // Refresh teams to reflect changes
      dispatch(fetchTeams({ eventId }));
      // Update selected team if modal is open
      if (selectedTeam?._id === teamId) {
        setSelectedTeam(prev => ({
          ...prev,
          members: prev.members.filter(m => (m.userId?._id || m.userId) !== userId)
        }));
      }
    } catch (err) {
      toast.error(err || "Failed to remove member");
    }
  };

  const handleDeleteEvent = async () => {
    const confirmName = window.prompt(`To delete this event, please type its name: "${event.title}"`);
    if (confirmName === event.title) {
      try {
        await dispatch(deleteEventThunk(eventId)).unwrap();
        toast.success("Event deleted successfully");
        navigate("/events");
      } catch (err) {
        toast.error(err || "Failed to delete event");
      }
    } else if (confirmName !== null) {
      toast.error("Event name did not match.");
    }
  };

  const [selectedTeam, setSelectedTeam] = useState(null);
  
  const safeRegistrations = Array.isArray(registrations) ? registrations : [];
  const safeSubmissions = Array.isArray(allSubmissions) ? allSubmissions : [];
  const safeTeams = Array.isArray(teams) ? teams : [];
  
  const pendingCount = safeRegistrations.filter(r => r.status === 'pending').length;

  return (
    <div className="text-[#e6edf3] min-h-screen animate-in fade-in duration-500">
      
      {/* Top Section: Quick Stats & Essential Controls */}
      <div className="py-6 space-y-8">
        
        {/* Header Section for Manage HQ */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#30363d] pb-8">
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span className="material-symbols-outlined text-[#1f6feb] text-4xl">analytics</span>
              Operational Control
            </h1>
            <p className="text-[#8b949e] text-sm mt-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Event Management Engine — {event.title}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-3">
             <Button 
              variant="secondary" 
              className="bg-[#161b22] border-[#30363d] text-xs h-10 px-4 group"
              onClick={() => navigate(`/events/${eventId}/check-in`)}
            >
              <span className="material-symbols-outlined text-lg mr-2 group-hover:rotate-12 transition-transform">qr_code_scanner</span> 
              Live Check-in
            </Button>
            <Button 
              variant="secondary" 
              className="bg-[#161b22] border-[#30363d] text-xs h-10 px-4 group"
              onClick={() => navigate(`/events/${eventId}/edit`)}
            >
              <span className="material-symbols-outlined text-lg mr-2 group-hover:scale-110 transition-transform">edit_square</span> 
              Edit Details
            </Button>
            <Button 
              className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 text-xs h-10 px-4" 
              onClick={handleDeleteEvent}
            >
              <span className="material-symbols-outlined text-lg mr-2">delete_forever</span> 
              Terminate Event
            </Button>
          </div>
        </div>

        {/* Dash Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          
          {/* Node 1: Lifecycle */}
          <div className="bg-[#161b22]/40 border border-[#30363d] rounded-2xl p-6 hover:border-[#1f6feb]/50 transition-all group">
            <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-[0.2em] mb-4">Lifecycle Node</h3>
            <div className="flex items-center justify-between mb-6">
              <span className="text-sm font-bold text-white capitalize">{event.status} mode</span>
              <span className="w-2 h-2 rounded-full bg-[#1f6feb] shadow-[0_0_10px_#1f6feb]"></span>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => handleTransition("ongoing")}
                disabled={event.status === 'ongoing'}
                className="flex-1 bg-[#1f6feb] text-white text-[10px] font-black uppercase py-2.5 rounded-lg disabled:opacity-20 hover:brightness-110 transition-all"
              >
                Start
              </button>
              <button 
                onClick={() => handleTransition("judging")}
                disabled={event.status === 'judging' || event.status === 'completed'}
                className="flex-1 border border-[#30363d] text-[#8b949e] text-[10px] font-black uppercase py-2.5 rounded-lg hover:border-red-500 hover:text-red-500 transition-all"
              >
                Lock
              </button>
            </div>
          </div>

          {/* Node 2: Participation */}
          <div className="bg-[#161b22]/40 border border-[#30363d] rounded-2xl p-6">
            <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-[0.2em] mb-4">Registration Matrix</h3>
            <div className="flex items-end justify-between">
              <div>
                <span className="block text-3xl font-black text-white">{pendingCount}</span>
                <span className="text-[10px] text-amber-500 font-bold uppercase">Pending Verification</span>
              </div>
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-500">pending_actions</span>
              </div>
            </div>
          </div>

          {/* Node 3: Teams */}
          <div className="bg-[#161b22]/40 border border-[#30363d] rounded-2xl p-6">
            <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-[0.2em] mb-4">Active Roster</h3>
            <div className="flex items-end justify-between">
              <div>
                <span className="block text-3xl font-black text-white">{(teams || []).length || 0}</span>
                <span className="text-[10px] text-[#1f6feb] font-bold uppercase">Formed Teams</span>
              </div>
              <div className="w-12 h-12 bg-[#1f6feb]/10 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-[#1f6feb]">groups</span>
              </div>
            </div>
          </div>

          {/* Node 4: Judges */}
          <div className="bg-[#161b22]/40 border border-[#30363d] rounded-2xl p-6">
            <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-[0.2em] mb-4">Judging Module</h3>
            <form onSubmit={handleAssignJudge} className="flex gap-2 mb-2">
              <input 
                type="text" 
                required
                value={judgeIdInput}
                onChange={e => setJudgeIdInput(e.target.value)}
                placeholder="User ID..." 
                className="flex-1 bg-[#0d1117] text-white px-3 py-1.5 text-xs rounded-lg border border-[#30363d] focus:border-[#1f6feb] outline-none" 
              />
              <button type="submit" className="bg-[#161b22] border border-[#30363d] text-white p-1.5 rounded-lg hover:border-[#1f6feb] transition-all">
                <span className="material-symbols-outlined text-sm">add</span>
              </button>
            </form>
            <p className="text-[10px] text-[#8b949e] font-medium">{event.judgingConfig?.judges?.length || 0} Evaluators Active</p>
          </div>

        </div>

        {/* Data Persistence Area */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Main List Module */}
          <div className="xl:col-span-8">
            <div className="bg-[#161b22]/30 border border-[#30363d] rounded-3xl overflow-hidden">
              <div className="flex p-2 bg-[#0d1117]/50">
                <button 
                  onClick={() => setActiveTab("registrations")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'registrations' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:text-white'}`}
                >
                  Registrations
                  {pendingCount > 0 && <span className="bg-white text-[#1f6feb] px-1.5 py-0.5 rounded-md text-[9px]">{pendingCount}</span>}
                </button>
                <button 
                  onClick={() => setActiveTab("teams")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'teams' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:text-white'}`}
                >
                  Teams Roster
                </button>
              </div>

              <div className="overflow-x-auto min-h-[500px]">
                {activeTab === "registrations" ? (
                  <table className="w-full text-left">
                    <thead className="bg-[#0d1117]/80 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b949e]">
                      <tr>
                        <th className="px-8 py-5">Entity</th>
                        <th className="px-8 py-5">Proof of Intake</th>
                        <th className="px-8 py-5">Status</th>
                        <th className="px-8 py-5 text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]/50">
                      {safeRegistrations.length === 0 ? (
                        <tr><td colSpan="4" className="py-32 text-center text-[#8b949e] text-sm italic">No data records found</td></tr>
                      ) : (
                        safeRegistrations.map(reg => (
                          <tr key={reg._id} className="hover:bg-[#1f6feb]/5 transition-colors group">
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <img src={reg.userId?.profile?.avatar || "/default-avatar.png"} className="w-10 h-10 rounded-full border border-[#30363d]" alt="" />
                                <div>
                                  <p className="text-sm font-bold text-white leading-tight">{reg.userId?.profile?.displayName}</p>
                                  <p className="text-[10px] text-[#8b949e] font-medium tracking-wide uppercase">{reg.userId?.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              {reg.paymentScreenshot ? (
                                <a href={reg.paymentScreenshot} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[#1f6feb] text-xs font-bold hover:underline">
                                  <span className="material-symbols-outlined text-sm">attachment</span>
                                  View Audit Image
                                </a>
                              ) : (
                                <span className="text-[10px] text-[#484f58] uppercase font-bold italic">No data attached</span>
                              )}
                            </td>
                            <td className="px-8 py-4">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                                reg.status === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                reg.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                                'bg-red-500/10 text-red-500 border-red-500/20'
                              }`}>
                                {reg.status}
                              </span>
                            </td>
                            <td className="px-8 py-4">
                              <div className="flex justify-end gap-2">
                                {reg.status === 'pending' && (
                                  <>
                                    <button onClick={() => handleApproveRegistration(reg.userId?._id)} className="w-8 h-8 rounded-lg bg-[#1f6feb]/10 text-[#1f6feb] hover:bg-[#1f6feb] hover:text-white transition-all flex items-center justify-center border border-[#1f6feb]/20">
                                      <span className="material-symbols-outlined text-sm">check</span>
                                    </button>
                                    <button onClick={() => handleRejectRegistration(reg.userId?._id)} className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center border border-red-500/20">
                                      <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-[#0d1117]/80 text-[10px] font-black uppercase tracking-[0.2em] text-[#8b949e]">
                      <tr>
                        <th className="px-8 py-5">Team Identifier</th>
                        <th className="px-8 py-5">Entity Count</th>
                        <th className="px-8 py-5">Logistics</th>
                        <th className="px-8 py-5 text-right">Sanctions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]/50">
                      {safeTeams.length === 0 ? (
                        <tr><td colSpan="4" className="py-32 text-center text-[#8b949e] text-sm italic">Roster remains unpopulated</td></tr>
                      ) : (
                        safeTeams.map(team => (
                          <tr 
                            key={team._id} 
                            onClick={() => setSelectedTeam(team)}
                            className="hover:bg-[#1f6feb]/5 transition-colors cursor-pointer group"
                          >
                            <td className="px-8 py-4">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-[#30363d] flex items-center justify-center text-white font-black uppercase text-sm">
                                  {(team.teamName || team.name || "??").slice(0, 2)}
                                </div>
                                <p className="text-sm font-bold text-white uppercase tracking-wider">{team.teamName || team.name || "Anonymous Entity"}</p>
                              </div>
                            </td>
                            <td className="px-8 py-4">
                              <span className="text-xs text-[#8b949e] font-bold tracking-widest">{team.members?.length || 0} Members</span>
                            </td>
                            <td className="px-8 py-4">
                              <span className={`text-[9px] font-black uppercase tracking-tighter px-2 py-1 rounded border ${
                                team.status === 'disqualified' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                team.status === 'forming' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                'bg-green-500/10 text-green-500 border-green-500/20'
                              }`}>
                                {team.status}
                              </span>
                            </td>
                            <td className="px-8 py-4 text-right">
                              {team.status !== 'disqualified' && (
                                <button onClick={() => handleDisqualify(team._id)} className="text-[#8b949e] hover:text-red-500 transition-colors" title="Disqualify Team">
                                  <span className="material-symbols-outlined text-lg">person_remove</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Side Module: Broadcast & Logs */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Real-time Broadcast Terminal */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-3xl p-8 relative overflow-hidden">
               <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1f6feb]"></span>
                Live Broadcast Terminal
              </h3>
              <form className="space-y-4" onSubmit={handleBroadcast}>
                <textarea 
                  rows="5" 
                  value={announcementText} 
                  onChange={(e) => setAnnouncementText(e.target.value)} 
                  placeholder="Push global system-wide notification to all active devices..." 
                  className="w-full bg-[#0d1117] text-white p-4 rounded-2xl border border-[#30363d] focus:border-[#1f6feb] outline-none text-xs font-medium placeholder:text-[#484f58] transition-all"
                ></textarea>
                <Button 
                  type="submit" 
                  disabled={!announcementText.trim()}
                  className="w-full bg-[#1f6feb] text-white text-[10px] font-black uppercase py-4 rounded-2xl shadow-lg shadow-blue-500/10 active:scale-95 transition-all"
                >
                  Initialize Global Push
                </Button>
              </form>
              <div className="mt-8 pt-8 border-t border-[#30363d] space-y-4">
                 <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Protocol Audit</h4>
                 <ul className="space-y-3">
                   <li className="flex gap-2 items-start">
                     <span className="w-1 h-1 rounded-full bg-[#1f6feb] mt-1.5"></span>
                     <p className="text-[10px] text-[#8b949e] leading-relaxed uppercase">Verify all intake data against internal records before state transitions.</p>
                   </li>
                   <li className="flex gap-2 items-start">
                     <span className="w-1 h-1 rounded-full bg-[#1f6feb] mt-1.5"></span>
                     <p className="text-[10px] text-[#8b949e] leading-relaxed uppercase">Global broadcasts are permanent and immutable within the activity stream.</p>
                   </li>
                 </ul>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Team Details Modal */}
      {selectedTeam && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
           <div className="bg-[#161b22] border border-[#30363d] rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden">
             <div className="p-6 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]/50">
               <div>
                 <h2 className="text-xl font-bold text-white flex items-center gap-3">
                   <span className="material-symbols-outlined text-[#1f6feb]">group</span>
                   {selectedTeam.teamName || selectedTeam.name}
                 </h2>
                 <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-widest mt-1">
                   Operational Signature: {selectedTeam._id}
                 </p>
               </div>
               <button onClick={() => setSelectedTeam(null)} className="text-[#8b949e] hover:text-white transition-colors">
                 <span className="material-symbols-outlined">close</span>
               </button>
             </div>
             
             <div className="p-8">
               <div className="grid grid-cols-2 gap-8 mb-8 pb-8 border-b border-[#30363d]/50">
                 <div>
                   <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest block mb-2">Current Status</label>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                     selectedTeam.status === 'disqualified' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 'bg-green-500/10 text-green-500 border-green-500/20'
                   }`}>
                     {selectedTeam.status}
                   </span>
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest block mb-2">Member Count</label>
                   <span className="text-xl font-bold text-white">{selectedTeam.members?.length || 0} Entities</span>
                 </div>
               </div>

               <h3 className="text-[10px] font-black text-[#8b949e] uppercase tracking-widest mb-4">Active Member Roster</h3>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {selectedTeam.members?.map(member => (
                   <div key={member.userId?._id || member.userId} className="flex justify-between items-center p-3 bg-[#0d1117] border border-[#30363d] rounded-2xl group/m">
                     <div className="flex items-center gap-4">
                       <img 
                         src={member.userId?.profile?.avatar || "/default-avatar.png"} 
                         className="w-10 h-10 rounded-full border border-[#30363d]" 
                         alt="" 
                       />
                       <div>
                         <p className="text-sm font-bold text-white">{member.userId?.profile?.displayName || "Anonymous"}</p>
                         <p className="text-[10px] text-[#8b949e] font-medium tracking-wide">{member.role === 'leader' ? "🔥 Team Leader" : "Member"}</p>
                       </div>
                     </div>
                     <button 
                       onClick={() => handleKickMember(selectedTeam._id, member.userId?._id || member.userId, member.userId?.profile?.displayName)}
                       className="p-2 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover/m:opacity-100"
                       title="Remove Member"
                     >
                       <span className="material-symbols-outlined text-lg">no_accounts</span>
                     </button>
                   </div>
                 ))}
               </div>
             </div>

             <div className="p-6 bg-[#0d1117]/50 border-t border-[#30363d] flex justify-end">
               <Button variant="secondary" className="px-6" onClick={() => setSelectedTeam(null)}>Close Protocol</Button>
             </div>
           </div>
         </div>
      )}
    </div>
  );


}
