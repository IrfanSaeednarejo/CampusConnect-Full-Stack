import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentors, selectAllMentors } from "../../redux/slices/mentorsSlice";
import { useModal, MODAL_TYPES } from "../../contexts/ModalContext";

export default function StudentBookMentor() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { openModal } = useModal();
<<<<<<< HEAD

=======
  
>>>>>>> 662eb16bfc824ad3e4b2402400cb51f91082e029
  const status = useSelector((state) => state.mentors.status);
  const mentors = useSelector(selectAllMentors);

  useEffect(() => {
    dispatch(fetchMentors());
  }, [dispatch]);

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      <header className="flex items-center justify-between border-b border-[#30363d] px-6 py-3 sticky top-0 bg-[#0d1117] z-40">
        <div className="flex items-center gap-8">
          <button onClick={() => navigate("/student/dashboard")} className="text-white hover:text-[#238636] transition-colors">
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-4 text-white">
            <h2 className="text-white text-lg font-bold">CampusConnect Mentors</h2>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-10 lg:px-20 py-5 md:py-10 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#30363d] pb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Find a Mentor</h1>
            <p className="text-[#8b949e]">Browse industry experts and book personalized 1-on-1 sessions.</p>
          </div>
        </div>

        {status === "loading" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-64 bg-[#161b22] rounded-xl border border-[#30363d]"></div>
            ))}
          </div>
        )}

        {status === "succeeded" && mentors.length === 0 ? (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-16 flex flex-col items-center justify-center text-center">
            <span className="material-symbols-outlined text-6xl text-[#8b949e] mb-4">person_off</span>
            <h3 className="text-xl font-bold text-white mb-2">No mentors available</h3>
            <p className="text-[#8b949e]">Please check back later.</p>
          </div>
        ) : status === "succeeded" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
<<<<<<< HEAD
              <div key={mentor._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col hover:border-[#238636]/50 hover:shadow-lg hover:shadow-[#238636]/5 transition-all duration-300 group">
                <div className="flex gap-4 mb-4">
                  <div
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#238636]/40 to-[#1f6feb]/40 border-2 border-[#30363d] group-hover:border-[#238636]/60 flex items-center justify-center flex-shrink-0 text-white font-bold text-xl bg-cover bg-center transition-colors"
                    style={mentor.avatar ? { backgroundImage: `url("${mentor.avatar}")` } : undefined}
                  >
                    {!mentor.avatar && mentor.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-white font-bold text-lg leading-tight capitalize truncate">{mentor.name}</h3>
                    <p className="text-[#8b949e] text-sm truncate">{mentor.department || 'CampusConnect Mentor'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-[#d29922] text-sm font-bold">
                        <span className="material-symbols-outlined text-[16px] text-[#d29922]">star</span>
                        {mentor.rating > 0 ? mentor.rating.toFixed(1) : '—'}
                      </div>
                      <span className="text-[#8b949e] text-xs">({mentor.totalSessions} sessions)</span>
=======
              <div key={mentor._id} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col hover:border-[#8b949e] transition-colors">
                <div className="flex gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#238636]/40 to-[#1f6feb]/40 border border-[#30363d] flex items-center justify-center flex-shrink-0 text-white font-bold text-xl">
                    {mentor.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg leading-tight">{mentor.name}</h3>
                    <p className="text-[#8b949e] text-sm">{mentor.title} at {mentor.company}</p>
                    <div className="flex items-center gap-1 mt-1 text-[#d29922] text-sm font-bold">
                      <span className="material-symbols-outlined text-[16px] text-[#d29922]">star</span>
                      {mentor.rating} ({mentor.totalSessions} sessions)
>>>>>>> 662eb16bfc824ad3e4b2402400cb51f91082e029
                    </div>
                  </div>
                </div>

<<<<<<< HEAD
                {mentor.bio && (
                  <p className="text-[#8b949e] text-sm mb-4 line-clamp-2">{mentor.bio}</p>
                )}

                <div className="flex flex-wrap gap-2 mb-4">
                  {mentor.expertise.slice(0, 4).map((tag, idx) => (
                    <span key={idx} className="bg-[#238636]/10 text-[#3fb950] text-xs px-2.5 py-1 rounded-full border border-[#238636]/20 capitalize">
                      {tag}
                    </span>
                  ))}
                  {mentor.expertise.length > 4 && (
                    <span className="text-[#8b949e] text-xs px-2 py-1">+{mentor.expertise.length - 4} more</span>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#21262d]">
                  <span className="text-[#8b949e] text-sm font-medium">
                    {mentor.hourlyRate > 0 ? `${mentor.currency} ${mentor.hourlyRate}/hr` : 'Free'}
                  </span>
                  <button
                    onClick={() => openModal(MODAL_TYPES.BOOK_MENTOR, { mentor })}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white py-2 px-5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                    Book
                  </button>
=======
                <div className="flex flex-wrap gap-2 mb-6">
                  {mentor.expertise.map((tag, idx) => (
                    <span key={idx} className="bg-[#30363d] text-[#c9d1d9] text-xs px-2.5 py-1 rounded-full border border-transparent hover:border-[#8b949e] cursor-default transition-colors">
                      {tag}
                    </span>
                  ))}
>>>>>>> 662eb16bfc824ad3e4b2402400cb51f91082e029
                </div>

                <button
                  onClick={() => openModal(MODAL_TYPES.BOOK_MENTOR, { mentor })}
                  className="mt-auto w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                  Book Session
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </main>
    </div>
  );
}
