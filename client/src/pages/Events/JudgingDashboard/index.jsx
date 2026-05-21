import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent } from "../../../redux/slices/eventSlice";
import { fetchMyJudgingQueue, submitScoreThunk, selectJudgingQueue, selectScoringLoading } from "../../../redux/slices/scoringSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import ScoringRubricForm from "../../../components/events/Judging/ScoringRubricForm";
import useHomeTheme from "../../../hooks/useHomeTheme";

export default function JudgingDashboard() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const event = useSelector(selectSelectedEvent);
  const queue = useSelector(selectJudgingQueue);
  const loading = useSelector(selectScoringLoading);
  const isDark = useHomeTheme();
  
  const [activeSub, setActiveSub] = useState(null);

  useEffect(() => {
    if (eventId) {
      dispatch(fetchMyJudgingQueue({ eventId }));
    }
  }, [dispatch, eventId]);

  if (!event) {
    return <div className={`h-screen flex justify-center items-center ${isDark ? "bg-background-dark" : "bg-slate-50"}`}><CircularProgress /></div>;
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
    <div className={`flex flex-col ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-slate-50 text-slate-900"}`}>
      {/* Header */}
      <header className={`px-4 md:px-8 py-4 sticky top-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 z-10 shadow-lg border-b ${isDark ? "bg-surface-dark border-border-dark" : "bg-white border-slate-200"}`}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-info text-3xl">gavel</span>
            Judging Dashboard
          </h1>
          <p className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>Evaluating: {event.title}</p>
        </div>
        
        {/* Progress Tracker */}
        <div className={`w-full md:w-64 p-3 rounded-lg border ${isDark ? "bg-background-dark border-border-dark" : "bg-slate-50 border-slate-200"}`}>
          <div className="flex justify-between items-end mb-1">
            <span className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>Queue Progress</span>
            <span className={`text-sm font-bold ${progressPercent === 100 ? 'text-success' : isDark ? 'text-white' : 'text-slate-900'}`}>
              {scoredSubmissions} / {totalSubmissions}
            </span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden ${isDark ? "bg-border-dark" : "bg-slate-200"}`}>
            <div 
              className={`h-full ${progressPercent === 100 ? 'bg-success' : 'bg-info'} transition-all duration-500`}
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Content Workspace */}
      <main className="flex-1 overflow-hidden grid grid-cols-1 lg:grid-cols-4 max-w-[1600px] w-full mx-auto">
        
        {/* Left Col: Queue Sidebar */}
        <div className={`lg:col-span-1 border-r overflow-y-auto h-[600px] hide-scrollbar ${isDark ? "border-border-dark bg-surface-dark" : "border-slate-200 bg-white"}`}>
          <div className={`p-4 border-b sticky top-0 backdrop-blur z-10 flex justify-between items-center ${isDark ? "border-border-dark bg-surface-dark/90" : "border-slate-200 bg-white/90"}`}>
            <h3 className={`font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Assigned to You</h3>
            {loading && <span className={`material-symbols-outlined animate-spin text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>refresh</span>}
          </div>
          
          <ul className={`divide-y ${isDark ? "divide-border-dark" : "divide-slate-200"}`}>
            {queue.length === 0 && !loading ? (
               <li className={`p-6 text-center text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>No submissions in your queue yet.</li>
            ) : (
               queue.map((sub) => {
                 const isScored = sub.scores?.length > 0;
                 const isActive = activeSub?._id === sub._id;
                 return (
                   <li 
                      key={sub._id} 
                      onClick={() => setActiveSub(sub)}
                      className={`transition-colors cursor-pointer border-l-4 ${isActive ? isDark ? 'bg-[#21262d] border-l-info' : 'bg-blue-50 border-l-info' : isDark ? 'hover:bg-[#21262d] border-l-transparent' : 'hover:bg-slate-50 border-l-transparent'}`}
                   >
                     <div className="p-4">
                       <div className="flex justify-between items-start">
                         <span className={`font-semibold break-all line-clamp-1 ${isScored ? isDark ? 'text-text-secondary-dark' : 'text-slate-500' : isDark ? 'text-white' : 'text-slate-900'}`}>
                            {sub.team?.name || sub.title || "Untitled Project"}
                         </span>
                         {isScored ? (
                           <span className="material-symbols-outlined text-success text-sm">check_circle</span>
                         ) : (
                           <span className="w-2 h-2 rounded-full bg-warning mt-1 shadow-[0_0_8px_rgba(217,119,6,0.35)]"></span>
                         )}
                       </div>
                       <p className={`text-xs mt-1 ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>{sub.files?.length || 0} Files • Delivered</p>
                     </div>
                   </li>
                 );
               })
            )}
          </ul>
        </div>

        {/* Right Col: Active Evaluation / Rubric Area */}
        <div className={`lg:col-span-3 flex flex-col p-6 overflow-y-auto h-[600px] ${isDark ? "bg-background-dark" : "bg-slate-50"}`}>
           {!activeSub ? (
             <div className="m-auto text-center max-w-md">
               <span className={`material-symbols-outlined text-6xl mb-4 ${isDark ? "text-border-dark" : "text-slate-300"}`}>receipt_long</span>
               <h2 className={`text-2xl font-bold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Select a Submission</h2>
               <p className={isDark ? "text-text-secondary-dark" : "text-slate-500"}>Choose a project from the sidebar to view its repository, presentation files, and complete your scoring rubric.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
                
                {/* Deliverables Preview */}
                <div className="space-y-6">
                   <div className={`p-6 rounded-xl border ${isDark ? "bg-surface-dark border-border-dark" : "bg-white border-slate-200"}`}>
                      <h2 className={`text-2xl font-black mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{activeSub.title || "Untitled Project"}</h2>
                      <p className={`text-sm mb-4 ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>{activeSub.description || "No description provided."}</p>
                      
                      {activeSub.links && activeSub.links.length > 0 && (
                        <div className="flex flex-col gap-2 mt-4">
                           {activeSub.links.map((link, idx) => {
                             let icon = "link";
                             if (link.label === "GitHub" || link.label === "Repository") icon = "code";
                             else if (link.label === "Deployment" || link.label === "Live Demo") icon = "open_in_new";
                             else if (link.label === "YouTube Video") icon = "smart_display";
                             return (
                               <a key={idx} href={link.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-info hover:underline">
                                 <span className="material-symbols-outlined text-lg">{icon}</span> View {link.label}
                               </a>
                             );
                           })}
                        </div>
                      )}
                   </div>

                   <div className={`p-6 rounded-xl border ${isDark ? "bg-surface-dark border-border-dark" : "bg-white border-slate-200"}`}>
                      <h3 className={`font-bold mb-4 border-b pb-2 text-sm uppercase tracking-wider ${isDark ? "text-white border-border-dark" : "text-slate-900 border-slate-200"}`}>Uploaded Files</h3>
                      {activeSub.files?.length > 0 ? (
                         <div className="space-y-3">
                           {activeSub.files.map(f => (
                             <div key={f._id} className={`flex justify-between items-center p-3 rounded-lg border ${isDark ? "bg-background-dark border-border-dark" : "bg-slate-50 border-slate-200"}`}>
                               <div className="flex items-center gap-2">
                                 <span className="material-symbols-outlined text-info">draft</span>
                                 <span className={`text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{f.originalName || "File"}</span>
                               </div>
                               <a href={f.url} target="_blank" rel="noreferrer" className={`text-xs px-3 py-1.5 rounded transition-colors border ${isDark ? "bg-[#21262d] hover:bg-[#30363d] border-border-dark text-text-primary-dark" : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700"}`}>Open</a>
                             </div>
                           ))}
                         </div>
                      ) : (
                        <p className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>This team hasn't uploaded any documents.</p>
                      )}
                   </div>
                </div>

                {/* Rubric View */}
                <div>
                   {activeSub.scores?.length > 0 ? (
                      <div className={`p-8 rounded-xl text-center border ${isDark ? "bg-success/10 border-success shadow-[0_0_30px_rgba(22,163,74,0.12)]" : "bg-green-50 border-green-200"}`}>
                         <span className="material-symbols-outlined text-6xl text-success mb-4">gavel</span>
                         <h3 className="text-2xl font-bold text-success mb-2">Scoring Complete</h3>
                         <p className={isDark ? "text-text-secondary-dark" : "text-slate-500"}>You have successfully evaluated this project. You may select another team from the queue.</p>
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
