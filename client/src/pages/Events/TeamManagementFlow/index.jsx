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
  kickMemberThunk,
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
  const [password, setPassword] = useState("");
  if (!isOpen || !team) return null;

  const isProtected = !!team.password;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-sm shadow-2xl p-6">
        <h2 className="text-xl font-bold text-white mb-2">Join {team.teamName}</h2>
        
        {isProtected ? (
          <div className="mb-4">
            <label className="block text-sm text-[#8b949e] mb-1">Enter Team Password</label>
            <input 
              autoFocus 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="w-full p-2 bg-[#0d1117] border border-[#30363d] rounded text-white outline-none focus:border-[#1f6feb]"
            />
            <p className="text-[10px] text-[#8b949e] mt-2">This team requires a password to join.</p>
          </div>
        ) : (
          <p className="text-sm text-[#8b949e] mb-6">Are you sure you want to join this open team? You can only belong to one team per competition.</p>
        )}
        
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded border border-[#30363d] text-[#c9d1d9] hover:bg-[#30363d]">Cancel</button>
          <button 
            onClick={() => onSubmit(password)} 
            disabled={loading || (isProtected && !password)} 
            className="px-4 py-2 rounded bg-[#1f6feb] text-white hover:bg-[#58a6ff] disabled:opacity-50"
          >
            {isProtected ? "Verify & Join" : "Join Directly"}
          </button>
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

  // If user is already in a team and visits "/teams", redirect them to "/my-team"
  useEffect(() => {
    if (myTeam && window.location.pathname.endsWith('/teams')) {
      navigate(`/events/${eventId}/my-team`, { replace: true });
    }
  }, [myTeam, eventId, navigate]);

  if (!event) {
    return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;
  }

  const handleCreateTeam = async (formData) => {
    const resultAction = await dispatch(createTeamThunk({ eventId, data: formData }));
    if (createTeamThunk.fulfilled.match(resultAction)) {
      setCreateModalOpen(false);
    }
  };

  const handleJoinTeam = async (password) => {
    const { team } = joinModalConfig;
    const resultAction = await dispatch(joinTeamThunk({ eventId, teamId: team._id, data: { password } }));
    if (joinTeamThunk.fulfilled.match(resultAction)) {
      setJoinModalConfig({ isOpen: false, team: null });
      // Redirect to my-team upon joining
      navigate(`/events/${eventId}/my-team`);
    }
  };

  const handleLeaveTeam = async () => {
    if (!myTeam) return;
    const isLeader = myTeam.members.some(m => (m.userId?._id === user._id || m.userId === user._id) && m.role === 'leader');
    const confirmMsg = isLeader 
      ? "As leader, leaving will disband the team or transfer leadership. Are you sure?"
      : "Are you sure you want to leave this team?";
    
    if (window.confirm(confirmMsg)) {
      await dispatch(leaveTeamThunk({ eventId, teamId: myTeam._id }));
    }
  };

  const handleRemoveMember = async (userId, displayName) => {
    if (!window.confirm(`Are you sure you want to remove ${displayName} from your team?`)) return;
    try {
      await dispatch(kickMemberThunk({ eventId, teamId: myTeam._id, userId })).unwrap();
      // Refresh my team
      dispatch(fetchMyTeam(eventId));
    } catch (err) {
      // Error is handled by thunk/slice but we can add local feedback if needed
    }
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
           <MyTeamDashboard 
             team={myTeam} 
             user={user} 
             onLeave={handleLeaveTeam} 
             onRemoveMember={handleRemoveMember}
             loading={loading} 
           />
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
