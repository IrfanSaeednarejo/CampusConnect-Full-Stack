import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent } from "../../../redux/slices/eventSlice";
import { 
  fetchTeams, 
  fetchMyTeam, 
  createTeamThunk, 
  joinTeamThunk, 
  leaveTeamThunk, 
  selectTeams, 
  selectMyTeam, 
  selectTeamLoading, 
  selectTeamError 
} from "../../../redux/slices/teamSlice";
import { selectUser } from "../../../redux/slices/authSlice";

import CircularProgress from "../../../components/common/CircularProgress";
import TeamStatusHeader from "../../../components/events/Teams/TeamStatusHeader";
import CreateTeamModal from "../../../components/events/Teams/CreateTeamModal";
import MyTeamDashboard from "../../../components/events/Teams/MyTeamDashboard";
import FindTeamBoard from "../../../components/events/Teams/FindTeamBoard";

// Minor form modal inside orchestrator for password required
const JoinTeamModal = ({ team, isOpen, onClose, onSubmit, loading }) => {
  const [code, setCode] = useState("");
  if (!isOpen || !team) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-sm shadow-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Join {team.name || team.teamName}</h2>
        <div className="mb-4">
           <label className="block text-sm text-[#8b949e] mb-1">Enter Team Invite Code</label>
           <input 
             autoFocus 
             type="text" 
             placeholder="e.g. A1B2C3D4"
             value={code} 
             onChange={e => setCode(e.target.value.toUpperCase())} 
             className="w-full p-2 bg-[#0d1117] border border-[#30363d] rounded text-white outline-none focus:border-[#1f6feb] font-mono tracking-widest"
           />
           <p className="text-[10px] text-[#58a6ff] mt-2 italic">Ask the team leader for their unique 8-character invite code.</p>
        </div>
        
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded border border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d]">Cancel</button>
          <button onClick={() => onSubmit(code)} disabled={loading || !code} className="px-4 py-2 rounded bg-[#1f6feb] text-white hover:bg-[#58a6ff] disabled:opacity-50">Join Team</button>
        </div>
      </div>
    </div>
  );
};

export default function TeamManagementFlow() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const event = useSelector(selectSelectedEvent);
  const teams = useSelector(selectTeams);
  const myTeam = useSelector(selectMyTeam);
  const loading = useSelector(selectTeamLoading);
  const error = useSelector(selectTeamError);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [joinModalConfig, setJoinModalConfig] = useState({ isOpen: false, team: null });

  useEffect(() => {
    if (eventId) {
      dispatch(fetchTeams({ eventId }));
      dispatch(fetchMyTeam(eventId));
    }
  }, [dispatch, eventId]);

  if (!event) {
    return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;
  }

  const handleCreateTeam = async (formData) => {
    const resultAction = await dispatch(createTeamThunk({ eventId, data: formData }));
    if (createTeamThunk.fulfilled.match(resultAction)) {
      setCreateModalOpen(false);
    }
  };

  const handleJoinTeam = async (inviteCode) => {
    const { team } = joinModalConfig;
    const resultAction = await dispatch(joinTeamThunk({ eventId, teamId: team._id, data: { inviteCode } }));
    if (joinTeamThunk.fulfilled.match(resultAction)) {
      setJoinModalConfig({ isOpen: false, team: null });
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam || !window.confirm("Are you sure you want to leave this team?")) return;
    await dispatch(leaveTeamThunk({ eventId, teamId: myTeam._id }));
  };

  const minSize = event.teamConfig?.minSize || 1;
  const maxSize = event.teamConfig?.maxSize || 5;

  return (
    <div className="text-[#e6edf3] pb-10">
      
      {/* Header Area */}
      <div className="border-b border-[#30363d] py-6 px-4 sm:px-10 lg:px-20 relative bg-[#161b22]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-white">Team Management</h1>
            <p className="text-[#8b949e] mt-1">{event.title}</p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {error && (
           <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3 text-red-500">
              <span className="material-symbols-outlined">error</span>
              <p className="text-sm font-medium">{error}</p>
           </div>
        )}

        <TeamStatusHeader status={myTeam ? "enrolled" : "independent"} teamName={myTeam?.name} />

        {myTeam ? (
           // Branch B: User is in a team
           <MyTeamDashboard team={myTeam} user={user} onLeave={handleLeaveTeam} loading={loading} />
        ) : (
           // Branch A: User does not have a team
           <FindTeamBoard 
             teams={teams} 
             onJoinClick={(team) => setJoinModalConfig({ isOpen: true, team })} 
             onCreateClick={() => setCreateModalOpen(true)} 
             loading={loading}
           />
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setCreateModalOpen(false)} 
        onSubmit={handleCreateTeam} 
        minSize={minSize} 
        maxSize={maxSize} 
        loading={loading}
      />

      <JoinTeamModal 
        isOpen={joinModalConfig.isOpen}
        team={joinModalConfig.team}
        onClose={() => setJoinModalConfig({ isOpen: false, team: null })}
        onSubmit={handleJoinTeam}
        loading={loading}
      />
    </div>
  );
}
