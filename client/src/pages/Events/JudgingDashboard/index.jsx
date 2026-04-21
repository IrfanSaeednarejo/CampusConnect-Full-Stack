import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent } from "../../../redux/slices/eventSlice";
import { fetchMyJudgingQueue, submitScoreThunk, selectJudgingQueue, selectScoringLoading } from "../../../redux/slices/scoringSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import ScoringRubricForm from "../../../components/events/Judging/ScoringRubricForm";

export default function JudgingDashboard() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const event = useSelector(selectSelectedEvent);
  const queue = useSelector(selectJudgingQueue);
  const loading = useSelector(selectScoringLoading);
  
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchEventById(eventId));
      dispatch(fetchMyJudgingQueue({ eventId }));
    }
  }, [dispatch, eventId]);

  if (!event) {
    return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;
  }

  // Determine scoring progress
  const totalSubmissions = queue.length;
  const scoredSubmissions = queue.filter(sub => sub.scores?.some(s => true)).length; 
  const progressPercent = totalSubmissions === 0 ? 0 : Math.round((scoredSubmissions / totalSubmissions) * 100);

  const handleScoreSubmit = async (scoreData) => {
     if (!activeSub) return;
     const action = await dispatch(submitScoreThunk({ eventId, subId: activeSub._id, data: scoreData }));
     if (submitScoreThunk.fulfilled.match(action)) {
        // Re-fetch queue to reflect new state
        dispatch(fetchMyJudgingQueue({ eventId }));
        alert("Score submitted!");
     }
  };

  return (
    <div className="flex flex-col text-[#e6edf3]">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] px-4 md:px-8 py-4 sticky top-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 shadow-lg">
        <div>
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
            <span className={`text-sm font-bold ${progressPercent === 100 ? 'text-[#1dc964]' : 'text-white'}`}>
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
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 max-w-[1600px] w-full mx-auto">
        
        {/* Left Col: Queue Sidebar */}
        <div className="lg:col-span-1 border-r border-[#30363d] bg-[#161b22] overflow-y-auto h-[600px] hide-scrollbar">
          <div className="p-4 border-b border-[#30363d] sticky top-0 bg-[#161b22]/90 backdrop-blur z-10 flex justify-between items-center">
            <h3 className="font-bold text-white">Assigned to You</h3>
            {loading && <span className="material-symbols-outlined animate-spin text-[#8b949e] text-sm">refresh</span>}
          </div>
          
          <ul className="divide-y divide-[#30363d]">
            {queue.length === 0 && !loading ? (
               <li className="p-6 text-center text-[#8b949e] text-sm">No submissions in your queue yet.</li>
            ) : (
               queue.map((sub) => {
                 const isScored = sub.scores?.length > 0;
                 const isActive = activeSub?._id === sub._id;
                 return (
                   <li 
                      key={sub._id} 
                      onClick={() => setActiveSub(sub)}
                      className={`transition-colors cursor-pointer border-l-4 ${isActive ? 'bg-[#21262d] border-l-[#8957e5]' : 'hover:bg-[#21262d] border-l-transparent'}`}
                   >
                     <div className="p-4">
                       <div className="flex justify-between items-start">
                         <span className={`font-semibold break-all line-clamp-1 ${isScored ? 'text-[#8b949e]' : 'text-white'}`}>
                            {sub.team?.name || sub.title || "Untitled Project"}
                         </span>
                         {isScored ? (
                           <span className="material-symbols-outlined text-[#1dc964] text-sm">check_circle</span>
                         ) : (
                           <span className="w-2 h-2 rounded-full bg-[#e3b341] mt-1 shadow-[0_0_8px_#e3b341]"></span>
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
        <div className="lg:col-span-3 bg-[#0d1117] flex flex-col p-6 overflow-y-auto h-[600px]">
           {!activeSub ? (
             <div className="m-auto text-center max-w-md">
               <span className="material-symbols-outlined text-6xl text-[#30363d] mb-4">receipt_long</span>
               <h2 className="text-2xl font-bold text-white mb-2">Select a Submission</h2>
               <p className="text-[#8b949e]">Choose a project from the sidebar to view its repository, presentation files, and complete your scoring rubric.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
                
                {/* Deliverables Preview */}
                <div className="space-y-6">
                   <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl">
                      <h2 className="text-2xl font-black text-white mb-2">{activeSub.title || "Untitled Project"}</h2>
                      <p className="text-sm mb-4 text-[#8b949e]">{activeSub.description || "No description provided."}</p>
                      
                      {activeSub.links && activeSub.links.length > 0 && (
                        <div className="flex flex-col gap-2 mt-4">
                           {activeSub.links.map((link, idx) => {
                             let icon = "link";
                             if (link.label === "GitHub" || link.label === "Repository") icon = "code";
                             else if (link.label === "Deployment" || link.label === "Live Demo") icon = "open_in_new";
                             else if (link.label === "YouTube Video") icon = "smart_display";
                             return (
                               <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[#58a6ff] hover:underline">
                                 <span className="material-symbols-outlined text-lg">{icon}</span> View {link.label}
                               </a>
                             );
                           })}
                        </div>
                      )}
                   </div>

                   <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl">
                      <h3 className="font-bold text-white mb-4 border-b border-[#30363d] pb-2 text-sm uppercase tracking-wider">Uploaded Files</h3>
                      {activeSub.files?.length > 0 ? (
                         <div className="space-y-3">
                           {activeSub.files.map(f => (
                             <div key={f._id} className="flex justify-between items-center bg-[#0d1117] border border-[#30363d] p-3 rounded-lg">
                               <div className="flex items-center gap-2">
                                 <span className="material-symbols-outlined text-[#1f6feb]">draft</span>
                                 <span className="text-sm text-white">{f.originalName || "File"}</span>
                               </div>
                               <a href={f.url} target="_blank" rel="noreferrer" className="bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] text-xs px-3 py-1.5 rounded transition-colors">Open</a>
                             </div>
                           ))}
                         </div>
                      ) : (
                        <p className="text-[#8b949e] text-sm">This team hasn't uploaded any documents.</p>
                      )}
                   </div>
                </div>

                {/* Rubric View */}
                <div>
                   {activeSub.scores?.length > 0 ? (
                      <div className="bg-[#1dc964]/10 border border-[#1dc964] p-8 rounded-xl text-center shadow-[0_0_30px_rgba(29,201,100,0.1)]">
                         <span className="material-symbols-outlined text-6xl text-[#1dc964] mb-4">gavel</span>
                         <h3 className="text-2xl font-bold text-[#1dc964] mb-2">Scoring Complete</h3>
                         <p className="text-[#8b949e]">You have successfully evaluated this project. You may select another team from the queue.</p>
                      </div>
                   ) : (
                      <ScoringRubricForm 
                        criteria={event.judgingConfig?.criteria || []} 
                        onSubmitScore={handleScoreSubmit}
                        loading={loading}
                      />
                   )}
                </div>

             </div>
           )}
        </div>

      </main>
    </div>
  );
}
