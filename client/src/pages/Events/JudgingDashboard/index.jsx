import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent } from "../../../redux/slices/eventSlice";
import { fetchMyJudgingQueue, selectJudgingQueue, selectScoringLoading } from "../../../redux/slices/scoringSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import Button from "../../../components/common/Button";

export default function JudgingDashboard() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const event = useSelector(selectSelectedEvent);
  const queue = useSelector(selectJudgingQueue);
  const loading = useSelector(selectScoringLoading);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      dispatch(fetchMyJudgingQueue({ eventId }));
    }
  }, [dispatch, eventId]);

  if (!event || loading) {
    return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;
  }

  // Determine scoring progress
  const totalSubmissions = queue.length;
  const scoredSubmissions = queue.filter(sub => sub.scores?.some(s => true)).length; // Assuming backend embeds judge's score
  const progressPercent = totalSubmissions === 0 ? 0 : Math.round((scoredSubmissions / totalSubmissions) * 100);

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col text-[#e6edf3]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-4 md:px-8 py-4 sticky top-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10">
        <div>
          <button onClick={() => navigate(`/events/${eventId}`)} className="text-[#8b949e] hover:text-white mb-2 flex items-center text-sm transition-colors">
            <span className="material-symbols-outlined text-sm mr-1">arrow_back</span> Back to Event
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-[#8957e5] text-3xl">gavel</span>
            Judging Dashboard
          </h1>
          <p className="text-sm text-[#8b949e]">Evaluating: {event.title}</p>
        </div>
        
        {/* Progress Tracker */}
        <div className="w-full md:w-64 bg-[#0d1117] border border-[#30363d] p-3 rounded-lg">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-[#8b949e]">Queue Progress</span>
            <span className="text-sm font-bold {progressPercent === 100 ? 'text-[#1dc964]' : 'text-white'}">
              {scoredSubmissions} / {totalSubmissions}
            </span>
          </div>
          <div className="w-full bg-[#30363d] h-2.5 rounded-full overflow-hidden">
            <div 
              className={`h-full ${progressPercent === 100 ? 'bg-[#1dc964]' : 'bg-[#8957e5]'} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-4 max-w-[1600px] w-full mx-auto">
        
        {/* Left Col: Queue Sidebar */}
        <div className="md:col-span-1 border-r border-[#30363d] bg-[#161b22] overflow-y-auto max-h-[calc(100vh-120px)] hide-scrollbar">
          <div className="p-4 border-b border-[#30363d] sticky top-0 bg-[#161b22]/90 backdrop-blur">
            <h3 className="font-bold text-white">Assigned to You</h3>
          </div>
          
          <ul className="divide-y divide-[#30363d]">
            {queue.length === 0 ? (
               <li className="p-6 text-center text-[#8b949e] text-sm">No submissions in your queue yet.</li>
            ) : (
               queue.map((sub) => {
                 const isScored = sub.scores?.length > 0;
                 return (
                   <li key={sub._id} className="hover:bg-[#21262d] transition-colors cursor-pointer border-l-4 border-l-transparent hover:border-l-[#8957e5]">
                     <div className="p-4">
                       <div className="flex justify-between items-start">
                         <span className="font-semibold text-white break-all line-clamp-1">{sub.team?.name || sub.title || "Untitled Project"}</span>
                         {isScored ? (
                           <span className="material-symbols-outlined text-[#1dc964] text-sm">check_circle</span>
                         ) : (
                           <span className="w-2 h-2 rounded-full bg-[#e3b341] mt-1"></span>
                         )}
                       </div>
                       <p className="text-xs text-[#8b949e] mt-1">{sub.files?.length || 0} Files • Delivered</p>
                     </div>
                   </li>
                 );
               })
            )}
          </ul>
        </div>

        {/* Right Col: Active Evaluation / Rubric Area */}
        <div className="md:col-span-3 bg-[#0d1117] flex flex-col justify-center items-center text-center p-8">
           {/* Placeholder for selected submission */}
           <div className="max-w-md">
             <span className="material-symbols-outlined text-6xl text-[#30363d] mb-4">receipt_long</span>
             <h2 className="text-2xl font-bold text-white mb-2">Select a Submission</h2>
             <p className="text-[#8b949e]">Choose a project from the sidebar to view its repository, presentation files, and complete your scoring rubric.</p>
           </div>
        </div>

      </main>
    </div>
  );
}
