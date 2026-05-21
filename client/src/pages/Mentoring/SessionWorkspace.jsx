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
  clearSession,
} from "../../redux/slices/sessionSlice";
import { completeBookingThunk } from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";
import { useSocket } from "../../hooks/useSocket";
import useHomeTheme from "../../hooks/useHomeTheme";
import { toast } from "react-hot-toast";
import ConfirmModal from "../../components/common/ConfirmModal";

const SessionControlPanel = ({ session, isMentor, onEndSession, isDark }) => {
  return (
    <div
      className={`flex flex-col gap-4 rounded-xl border p-4 ${
        isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
      }`}
    >
      <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
        Session Controls
      </h3>
      <div className="flex flex-col gap-2">
        {isMentor && session.status === "active" && (
          <button
            onClick={onEndSession}
            className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-600/10 px-4 py-2 text-sm font-semibold text-red-500 transition-all hover:bg-red-600 hover:text-white"
          >
            <span className="material-symbols-outlined text-sm">stop_circle</span>
            End Session
          </button>
        )}
        <button
          className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm transition-all ${
            isDark
              ? "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:border-[#8b949e]"
              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
          }`}
        >
          <span className="material-symbols-outlined text-sm">report</span>
          Report Issue
        </button>
      </div>
    </div>
  );
};

const MentorChatBox = ({ roomId, messages, currentUser, isDark }) => {
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
    <div
      className={`flex h-[500px] flex-col overflow-hidden rounded-2xl border md:h-full ${
        isDark
          ? "border-[#30363d] bg-[#0d1117] shadow-2xl"
          : "border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]"
      }`}
    >
      <div
        className={`flex items-center justify-between border-b p-4 ${
          isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
          <span className={`text-sm font-bold uppercase tracking-widest ${isDark ? "text-white" : "text-slate-900"}`}>
            Live Chat
          </span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className={`custom-scrollbar flex-1 space-y-4 overflow-y-auto p-4 ${
          isDark ? "bg-[#0d1117]" : "bg-white"
        }`}
      >
        {messages.map((msg, idx) => {
          const isMe = msg.senderId?._id === currentUser?._id || msg.senderId === currentUser?._id;
          return (
            <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl p-3 ${
                  isMe
                    ? "rounded-tr-none bg-[#238636] text-white"
                    : isDark
                      ? "rounded-tl-none border border-[#30363d] bg-[#21262d] text-[#c9d1d9]"
                      : "rounded-tl-none border border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                {!isMe && (
                  <p className={`mb-1 text-[10px] font-bold uppercase ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                    {msg.senderId?.profile?.displayName || "Partner"}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-sm">{msg.message}</p>
                <p
                  className={`mt-1 text-right text-[9px] ${
                    isMe ? "text-white/70" : isDark ? "text-[#8b949e]" : "text-slate-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <div
        className={`border-t p-4 ${
          isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-slate-50"
        }`}
      >
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className={`flex-1 rounded-xl border px-4 py-2 text-sm outline-none transition-colors ${
              isDark
                ? "border-[#30363d] bg-[#0d1117] text-white focus:border-[#3fb950]"
                : "border-slate-200 bg-white text-slate-900 focus:border-emerald-500"
            }`}
          />
          <button
            onClick={handleSend}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#238636] text-white transition-colors hover:bg-[#2ea043]"
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
  const isDark = useHomeTheme();

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
        });

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

  if (loading) {
    return (
      <div className={`flex h-full items-center justify-center ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}>
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#3fb950] border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex h-full flex-col items-center justify-center p-10 text-center ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}>
        <span className="material-symbols-outlined mb-4 text-6xl text-red-500">error</span>
        <h2 className={`mb-2 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Workspace Unavailable</h2>
        <p className={`max-w-md ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          className={`mt-6 rounded-lg border px-6 py-2 transition-colors ${
            isDark
              ? "border-[#30363d] bg-[#21262d] text-white hover:border-[#8b949e]"
              : "border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-100"
          }`}
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!session) return null;

  const isMentor = session.mentorId?.userId?.toString() === currentUser?._id;
  const partner = isMentor ? session.menteeId : session.mentorId?.userId;
  const [confirmState, setConfirmState] = useState({ isOpen: false });

  const handleEndSession = () => {
    setConfirmState({
      isOpen: true,
      title: "End Session",
      message:
        "Are you sure you want to end this session? It will be marked as complete and both participants will be notified. This action cannot be reversed.",
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
      },
    });
  };

  return (
    <div className={`flex h-full flex-col ${isDark ? "bg-[#0d1117] text-[#c9d1d9]" : "bg-slate-50 text-slate-900"}`}>
      <div
        className={`flex items-center justify-between border-b p-4 ${
          isDark ? "border-[#30363d] bg-[#161b22]" : "border-slate-200 bg-white"
        }`}
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className={`rounded-lg p-2 transition-colors ${
              isDark ? "text-[#8b949e] hover:bg-[#30363d]" : "text-slate-500 hover:bg-slate-100"
            }`}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div
            className={`rounded-full border px-3 py-1 ${
              isDark ? "border-[#238636]/20 bg-[#238636]/10" : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#3fb950]">Live Workspace</span>
          </div>
          <h2 className={`hidden font-bold md:block ${isDark ? "text-white" : "text-slate-900"}`}>{session.bookingId?.topic}</h2>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
              isDark ? "border-[#30363d] bg-[#0d1117]" : "border-slate-200 bg-slate-50"
            }`}
          >
            {partner?.profile?.avatar ? (
              <img src={partner.profile.avatar} alt="" className="h-6 w-6 rounded-full" />
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#3fb950] text-[10px] font-bold text-white">
                {partner?.profile?.displayName?.[0] || "?"}
              </div>
            )}
            <span className={`text-xs font-medium ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Partner:</span>
            <span className={`max-w-[100px] truncate text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {partner?.profile?.displayName}
            </span>
          </div>

          {session.status === "ended" && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold uppercase text-red-500">
              Session Concluded
            </div>
          )}
        </div>
      </div>

      <div
        className={`grid flex-1 grid-cols-1 overflow-hidden overflow-y-auto lg:grid-cols-12 lg:overflow-y-hidden ${
          isDark ? "bg-[#0d1117]" : "bg-slate-50"
        }`}
      >
        <div
          className={`custom-scrollbar flex flex-col gap-6 p-6 lg:col-span-3 lg:overflow-y-auto ${
            isDark ? "border-r border-[#30363d]" : "border-r border-slate-200"
          }`}
        >
          <div className="flex flex-col gap-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
              Scheduled Duration
            </label>
            <div className={`flex items-center gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              <span className="material-symbols-outlined text-sm text-[#3fb950]">schedule</span>
              <span className="text-sm font-medium">{session.bookingId?.duration || 60} Minutes</span>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Topic</label>
            <p className={`text-sm font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{session.bookingId?.topic}</p>
          </div>

          {session.bookingId?.notes && (
            <div className="flex flex-col gap-2">
              <label className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
                Session Notes
              </label>
              <p
                className={`rounded-lg border p-3 text-xs leading-relaxed ${
                  isDark
                    ? "border-[#30363d] bg-[#161b22] text-[#8b949e]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                {session.bookingId.notes}
              </p>
            </div>
          )}

          <div className={`mt-auto pt-6 ${isDark ? "border-t border-[#30363d]" : "border-t border-slate-200"}`}>
            <SessionControlPanel session={session} isMentor={isMentor} onEndSession={handleEndSession} isDark={isDark} />
          </div>
        </div>

        <div className={`flex flex-col p-0 lg:col-span-6 lg:p-6 ${isDark ? "bg-[#0d1117]" : "bg-slate-50"}`}>
          <MentorChatBox roomId={session.roomId} messages={messages} currentUser={currentUser} isDark={isDark} />
        </div>

        <div
          className={`custom-scrollbar flex flex-col gap-6 p-6 lg:col-span-3 lg:overflow-y-auto ${
            isDark ? "border-l border-[#30363d]" : "border-l border-slate-200"
          }`}
        >
          <h3 className={`text-sm font-bold uppercase tracking-wider ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
            Resources & Collaboration
          </h3>

          <div
            className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center ${
              isDark ? "border-[#30363d] bg-[#161b22]/30" : "border-slate-300 bg-white"
            }`}
          >
            <span className={`material-symbols-outlined mb-2 text-3xl ${isDark ? "text-[#30363d]" : "text-slate-300"}`}>
              attachment
            </span>
            <p className={`text-xs ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>
              Drag & drop files or shared links here (Future Enhancement)
            </p>
          </div>

          <div
            className={`rounded-xl border p-4 ${
              isDark ? "border-[#3fb950]/20 bg-[#3fb950]/5" : "border-emerald-200 bg-emerald-50"
            }`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-[#3fb950]">lightbulb</span>
              <p className="text-xs font-bold uppercase text-[#3fb950]">Quick Tips</p>
            </div>
            <p className={`text-[11px] leading-relaxed ${isDark ? "text-[#8b949e]" : "text-slate-600"}`}>
              Keep your focus on the topic:{" "}
              <span className={`font-medium ${isDark ? "text-white" : "text-slate-900"}`}>{session.bookingId?.topic}</span>.
              Ensure all action items are documented in the chat for summary access.
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal {...confirmState} onCancel={() => setConfirmState({ isOpen: false })} />
    </div>
  );
}
