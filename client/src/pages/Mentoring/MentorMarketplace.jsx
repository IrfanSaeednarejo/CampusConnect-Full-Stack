import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMentors, selectAllMentors, selectMentoringLoading } from '../../redux/slices/mentoringSlice';
import PageHeader from '../../components/common/PageHeader';
import CircularProgress from '../../components/common/CircularProgress';
import Button from '../../components/common/Button';
import useHomeTheme from '../../hooks/useHomeTheme';

/**
 * Mentor Discovery Marketplace.
 * Allows students to find and schedule sessions with experts and institutional mentors.
 */
export default function MentorMarketplace() {
  const dispatch = useDispatch();
  const mentors = useSelector(selectAllMentors);
  const loading = useSelector(selectMentoringLoading);
  const isDark = useHomeTheme();

  useEffect(() => {
    // Need a fetchMentors or similar in mentoringSlice. Currently it has setMentors.
    // Assuming a fetchMentors thunk is needed.
  }, [dispatch]);

  const categories = ['All Mentors', 'Software Engineering', 'Business Strategy', 'Data Science', 'Graphic Design', 'Academic Support'];

  return (
    <div className={`min-h-screen p-6 pb-24 lg:p-10 ${isDark ? "bg-[#0d1117] text-[#e6edf3]" : "bg-slate-50 text-slate-900"}`}>
      <div className="max-w-7xl mx-auto space-y-10">
        <PageHeader 
          title="Mentor Marketplace" 
          subtitle="Connect with over 500+ institutional experts and industry veterans."
          icon="diversity_3"
        />

        {/* Filter Bar */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
           {categories.map((cat, idx) => (
             <button 
               key={idx}
               className={`px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                 idx === 0 
                  ? isDark
                    ? 'border-emerald-500/60 bg-emerald-600 text-white focus-visible:ring-emerald-400 focus-visible:ring-offset-[#0d1117]'
                    : 'border-emerald-600 bg-emerald-600 text-white focus-visible:ring-emerald-500 focus-visible:ring-offset-white'
                  : isDark
                    ? 'border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-white focus-visible:ring-[#58a6ff] focus-visible:ring-offset-[#0d1117]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 focus-visible:ring-sky-500 focus-visible:ring-offset-white'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(mentors.length > 0 ? mentors : [1, 2, 3, 4, 5, 6, 7, 8]).map((mentor, idx) => (
            <div key={idx} className={`rounded-2xl overflow-hidden transition-all transform hover:-translate-y-1 group border ${isDark ? "bg-[#161b22] border-[#30363d] hover:border-[#1f6feb]" : "bg-white border-slate-200 shadow-[0_16px_40px_rgba(15,23,42,0.08)] hover:border-slate-300"}`}>
               <div className={`h-24 relative flex items-center justify-center border-b ${isDark ? "bg-[#0d1117] border-[#30363d]" : "bg-slate-50 border-slate-200"}`}>
                  <div className="absolute top-4 right-4 text-[#238636] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#23863610] px-2 py-1 rounded">
                     <span className="material-symbols-outlined text-[10px]">check_circle</span>
                     Verified
                  </div>
                  <div className={`w-20 h-20 rounded-2xl border-4 shadow-xl translate-y-8 flex items-center justify-center overflow-hidden ${isDark ? "bg-[#161b22] border-[#0d1117]" : "bg-white border-slate-50"}`}>
                     <img 
                       src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${idx + 10}`} 
                       className="w-full h-full object-cover" 
                       alt="" 
                     />
                  </div>
               </div>
               
               <div className="p-6 pt-12 text-center">
                  <h3 className={`text-xl font-black transition-colors ${isDark ? "text-white group-hover:text-[#58a6ff]" : "text-slate-900 group-hover:text-emerald-600"}`}>Expert Mentor {idx + 1}</h3>
                  <p className={`text-xs font-bold mt-1 ${isDark ? "text-[#8b949e]" : "text-slate-500"}`}>Institutional Consultant</p>
                  
                  <div className="flex items-center justify-center gap-4 mt-6">
                     <div className="text-center">
                        <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>4.9</div>
                        <div className={`text-[10px] uppercase tracking-tighter ${isDark ? "text-gray-500" : "text-slate-400"}`}>Rating</div>
                     </div>
                     <div className={`w-[1px] h-8 ${isDark ? "bg-[#30363d]" : "bg-slate-200"}`} />
                     <div className="text-center">
                        <div className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>128</div>
                        <div className={`text-[10px] uppercase tracking-tighter ${isDark ? "text-gray-500" : "text-slate-400"}`}>Sessions</div>
                     </div>
                  </div>

                  <div className="mt-8 space-y-3">
                     <Button variant="primary" size="sm" className="w-full group-hover:scale-[1.02] transition-transform">Book a Session</Button>
                     <Button variant="outline" size="sm" className="w-full">View Journey</Button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
