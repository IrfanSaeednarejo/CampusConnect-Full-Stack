import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { 
  fetchSessionDetails, 
  fetchSessionMessages, 
  selectActiveSession, 
  selectSessionMessages, 
  selectSessionLoading, 
  selectSessionError,
  addMessage,
  setSessionEnded,
  clearSession
} from "../../redux/slices/sessionSlice";
import { 
    completeBookingThunk 
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";
import { useSocket } from "../../hooks/useSocket";
import Avatar from "../../components/common/Avatar";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal";

// --- Sub-Component: SessionControlPanel ---
const SessionControlPanel = ({ session, isMentor, onEndSession }) => {
  return (
    <div className="flex flex-col gap-4 p-4 bg-[#161b22] border border-[#30363d] rounded-xl">
      <h3 className="text-white font-bold text-sm uppercase tracking-wider text-[#8b949e]">Session Controls</h3>
      <div className="flex flex-col gap-2">
        {isMentor && session.status === "active" && (
          <button 
            onClick={onEndSession}
            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 text-red-500 border border-red-500/20 rounded-lg hover:bg-red-600 hover:text-white transition-all text-sm font-semibold"
          >
            <span className="material-symbols-outlined text-sm">stop_circle</span>
            End Session
          </button>
        )}
        <button className="flex items-center gap-2 px-4 py-2 bg-[#21262d] text-[#c9d1d9] border border-[#30363d] rounded-lg hover:border-[#8b949e] transition-all text-sm">
          <span className="material-symbols-outlined text-sm">report</span>
          Report Issue
        </button>
      </div>
    </div>
  );
};

// --- Sub-Component: ChatBox ---
const MentorChatBox = ({ roomId, messages, currentUser }) => {
  const [input, setInput] = useState("");
  const socket = useSocket();
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim() || !socket) return;
    
    socket.emit("mentor:send_message", { roomId, message: input.trim() }, (response) => {
        if (response.error) {
            toast.error(response.error);
        } else {
            setInput("");
        }
    });
  };

  return (
    <div className="flex flex-col h-[500px] md:h-full bg-[#0d1117] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-white font-bold text-sm uppercase tracking-widest">Live Chat</span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-[#0d1117]">
        {messages.map((msg, idx) => {
          const isMe = msg.senderId?._id === currentUser?._id || msg.senderId === currentUser?._id;
          return (
            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-2xl ${
                isMe ? 'bg-[#238636] text-white rounded-tr-none' : 'bg-[#21262d] text-[#c9d1d9] rounded-tl-none border border-[#30363d]'
              }`}>
                {!isMe && (
                   <p className="text-[10px] font-bold text-[#8b949e] mb-1 uppercase">
                     {msg.senderId?.profile?.displayName || 'Partner'}
                   </p>
                )}
                <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                <p className="text-[9px] text-[#ffffff80] mt-1 text-right">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-[#161b22] border-t border-[#30363d]">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a message..."
            className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2 text-white text-sm outline-none focus:border-[#3fb950] transition-colors"
          />
          <button 
            onClick={handleSend}
            className="w-10 h-10 flex items-center justify-center bg-[#238636] text-white rounded-xl hover:bg-[#2ea043] transition-colors"
          >
            <span className="material-symbols-outlined">send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function SessionWorkspace() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const socket = useSocket();
  
  const currentUser = useSelector(selectUser);
  const session = useSelector(selectActiveSession);
  const messages = useSelector(selectSessionMessages);
  const loading = useSelector(selectSessionLoading);
  const error = useSelector(selectSessionError);

  useEffect(() => {
    if (bookingId) {
      dispatch(fetchSessionDetails(bookingId));
    }
    return () => {
      dispatch(clearSession());
    };
  }, [bookingId, dispatch]);

  useEffect(() => {
    if (session?.roomId) {
      dispatch(fetchSessionMessages({ roomId: session.roomId }));
      
      if (socket) {
        socket.emit("mentor:join_session", session.roomId, (res) => {
            if (res.error) toast.error(res.error);
            else console.log("[Session] Socket joined successfully");
        });

        // Event listeners
        const handleNewMessage = (msg) => {
            dispatch(addMessage(msg));
        };

        const handleSessionEnded = () => {
            dispatch(setSessionEnded());
            toast.success("Session has been concluded");
        };

        socket.on("mentor:message_received", handleNewMessage);
        socket.on("mentor:session_ended", handleSessionEnded);

        return () => {
          socket.off("mentor:message_received", handleNewMessage);
          socket.off("mentor:session_ended", handleSessionEnded);
        };
      }
    }
  }, [session?.roomId, socket, dispatch]);

  if (loading) return (
     <div className="h-full flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#3fb950] border-t-transparent rounded-full animate-spin"></div>
     </div>
  );

  if (error) return (
    <div className="h-full flex flex-col items-center justify-center p-10 text-center">
       <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
       <h2 className="text-2xl font-bold text-white mb-2">Workspace Unavailable</h2>
       <p className="text-[#8b949e] max-w-md">{error}</p>
       <button onClick={() => navigate(-1)} className="mt-6 px-6 py-2 bg-[#21262d] border border-[#30363d] text-white rounded-lg hover:border-[#8b949e]">Go Back</button>
    </div>
  );

  if (!session) return null;

  const isMentor = session.mentorId?.userId?.toString() === currentUser?._id;
  const partner = isMentor ? session.menteeId : session.mentorId?.userId;

  const [confirmState, setConfirmState] = useState({ isOpen: false });

  const handleEndSession = () => {
    setConfirmState({
      isOpen: true,
      title: "End Session",
      message: "Are you sure you want to end this session? It will be marked as complete and both participants will be notified. This action cannot be reversed.",
      confirmText: "Yes, End Session",
      variant: "danger",
      onConfirm: async () => {
        try {
            await dispatch(completeBookingThunk(bookingId)).unwrap();
            toast.success("Session concluded successfully");
        } catch (err) {
            toast.error(err || "Failed to end session");
        } finally {
            setConfirmState({ isOpen: false });
        }
      }
    });
  };

  return (
    <div className="flex flex-col h-full bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[#30363d] bg-[#161b22]">
        <div className="flex items-center gap-4">
           <button onClick={() => navigate(-1)} className="p-2 hover:bg-[#30363d] rounded-lg text-[#8b949e] transition-colors">
              <span className="material-symbols-outlined">arrow_back</span>
           </button>
           <div className="bg-[#238636]/10 px-3 py-1 rounded-full border border-[#238636]/20">
              <span className="text-[#3fb950] text-[10px] font-bold uppercase tracking-widest">LIVE WORKSPACE</span>
           </div>
           <h2 className="text-white font-bold hidden md:block">{session.bookingId?.topic}</h2>
        </div>

        <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-[#30363d] rounded-lg">
               {partner?.profile?.avatar ? (
                 <img src={partner.profile.avatar} alt="" className="w-6 h-6 rounded-full" />
               ) : (
                 <div className="w-6 h-6 rounded-full bg-[#3fb950] flex items-center justify-center text-[10px] text-white font-bold">
                   {partner?.profile?.displayName?.[0] || '?'}
                 </div>
               )}
               <span className="text-xs font-medium text-[#8b949e]">Partner:</span>
               <span className="text-xs font-bold text-white truncate max-w-[100px]">{partner?.profile?.displayName}</span>
            </div>
            
            {session.status === "ended" && (
                <div className="bg-red-500/10 text-red-500 px-3 py-1.5 rounded-lg border border-red-500/20 text-xs font-bold uppercase">
                    Session Concluded
                </div>
            )}
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden overflow-y-auto lg:overflow-y-hidden">
         
         {/* Left Side: Session Details + Controls (3 cols) */}
         <div className="lg:col-span-3 flex flex-col p-6 gap-6 border-r border-[#30363d] lg:overflow-y-auto custom-scrollbar">
            
            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Scheduled Duration</label>
                <div className="flex items-center gap-2 text-white">
                   <span className="material-symbols-outlined text-sm text-[#3fb950]">schedule</span>
                   <span className="text-sm font-medium">{session.bookingId?.duration || 60} Minutes</span>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Topic</label>
                <p className="text-sm text-white font-medium">{session.bookingId?.topic}</p>
            </div>

            {session.bookingId?.notes && (
               <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Session Notes</label>
                  <p className="text-xs text-[#8b949e] leading-relaxed bg-[#161b22] p-3 rounded-lg border border-[#30363d]">
                    {session.bookingId.notes}
                  </p>
               </div>
            )}

            <div className="mt-auto pt-6 border-t border-[#30363d]">
               <SessionControlPanel session={session} isMentor={isMentor} onEndSession={handleEndSession} />
            </div>
         </div>

         {/* Middle: Chat Workspace (6 cols) */}
         <div className="lg:col-span-6 flex flex-col p-0 lg:p-6 bg-[#0d1117]">
            <MentorChatBox roomId={session.roomId} messages={messages} currentUser={currentUser} />
         </div>

         {/* Right Side: Shared Tools / Resources (3 cols) */}
         <div className="lg:col-span-3 flex flex-col p-6 gap-6 border-l border-[#30363d] lg:overflow-y-auto custom-scrollbar">
            <h3 className="text-white font-bold text-sm uppercase tracking-wider text-[#8b949e]">Resources & Collaboration</h3>
            
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#30363d] rounded-2xl text-center bg-[#161b22]/30">
               <span className="material-symbols-outlined text-3xl text-[#30363d] mb-2">attachment</span>
               <p className="text-xs text-[#8b949e]">Drag & drop files or shared links here (Future Enhancement)</p>
            </div>

            <div className="bg-[#3fb950]/5 border border-[#3fb950]/20 p-4 rounded-xl">
               <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-sm text-[#3fb950]">lightbulb</span>
                  <p className="text-xs font-bold text-[#3fb950] uppercase">Quick Tips</p>
               </div>
               <p className="text-[11px] text-[#8b949e] leading-relaxed">
                  Keep your focus on the topic: <span className="text-white font-medium">{session.bookingId?.topic}</span>. Ensure all action items are documented in the chat for summary access.
               </p>
            </div>
         </div>

      </div>
      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState({ isOpen: false })} 
      />
    </div>
  );
}
