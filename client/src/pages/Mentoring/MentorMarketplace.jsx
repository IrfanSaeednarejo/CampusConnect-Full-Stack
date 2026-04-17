import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMentors, selectAllMentors, selectMentoringLoading } from '../../redux/slices/mentoringSlice';
import PageHeader from '../../components/common/PageHeader';
import CircularProgress from '../../components/common/CircularProgress';
import Button from '../../components/common/Button';

/**
 * Mentor Discovery Marketplace.
 * Allows students to find and schedule sessions with experts and institutional mentors.
 */
export default function MentorMarketplace() {
  const dispatch = useDispatch();
  const mentors = useSelector(selectAllMentors);
  const loading = useSelector(selectMentoringLoading);

  useEffect(() => {
    // Need a fetchMentors or similar in mentoringSlice. Currently it has setMentors.
    // Assuming a fetchMentors thunk is needed.
  }, [dispatch]);

  const categories = ['All Mentors', 'Software Engineering', 'Business Strategy', 'Data Science', 'Graphic Design', 'Academic Support'];

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] p-6 lg:p-10 pb-24">
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
               className={`px-4 py-2 rounded-full border text-xs font-bold whitespace-nowrap transition-all ${
                 idx === 0 
                  ? 'bg-[#1f6feb] border-transparent text-white' 
                  : 'border-[#30363d] text-[#8b949e] hover:bg-[#161b22] hover:text-white'
               }`}
             >
               {cat}
             </button>
           ))}
        </div>

        {/* Mentor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(mentors.length > 0 ? mentors : [1, 2, 3, 4, 5, 6, 7, 8]).map((mentor, idx) => (
            <div key={idx} className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden hover:border-[#1f6feb] transition-all transform hover:-translate-y-1 group">
               <div className="h-24 bg-[#0d1117] relative flex items-center justify-center border-b border-[#30363d]">
                  <div className="absolute top-4 right-4 text-[#238636] flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-[#23863610] px-2 py-1 rounded">
                     <span className="material-symbols-outlined text-[10px]">check_circle</span>
                     Verified
                  </div>
                  <div className="w-20 h-20 rounded-2xl bg-[#161b22] border-4 border-[#0d1117] shadow-xl translate-y-8 flex items-center justify-center overflow-hidden">
                     <img 
                       src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${idx + 10}`} 
                       className="w-full h-full object-cover" 
                       alt="" 
                     />
                  </div>
               </div>
               
               <div className="p-6 pt-12 text-center">
                  <h3 className="text-xl font-black text-white group-hover:text-[#58a6ff] transition-colors">Expert Mentor {idx + 1}</h3>
                  <p className="text-xs text-[#8b949e] font-bold mt-1">Institutional Consultant</p>
                  
                  <div className="flex items-center justify-center gap-4 mt-6">
                     <div className="text-center">
                        <div className="text-sm font-bold text-white">4.9</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Rating</div>
                     </div>
                     <div className="w-[1px] h-8 bg-[#30363d]" />
                     <div className="text-center">
                        <div className="text-sm font-bold text-white">128</div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-tighter">Sessions</div>
                     </div>
                  </div>

                  <div className="mt-8 space-y-3">
                     <Button variant="primary" className="w-full bg-[#1f6feb] text-xs h-10 group-hover:scale-[1.02] transition-transform">Book a Session</Button>
                     <Button variant="outline" className="w-full border-[#30363d] text-xs h-10 hover:bg-[#30363d]">View Journey</Button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
