import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMentorById, selectCurrentMentor, selectMentoringLoading } from "../../redux/slices/mentoringSlice";
import Button from "../../components/common/Button";

export default function MentorProfileView() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { mentorId } = useParams();
  
  const mentor = useSelector(selectCurrentMentor);
  const loading = useSelector(selectMentoringLoading);

  useEffect(() => {
    if (mentorId) {
      dispatch(fetchMentorById(mentorId));
    }
  }, [dispatch, mentorId]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0d1117]">
        <div className="w-8 h-8 border-4 border-[#3fb950] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#0d1117] text-white">
        <h2 className="text-2xl font-bold mb-2">Mentor Not Found</h2>
        <p className="text-[#8b949e] mb-4">The mentor profile you are looking for does not exist.</p>
        <Button variant="primary" onClick={() => navigate("/mentors")}>Back to Mentors</Button>
      </div>
    );
  }

  const profile = mentor.userId?.profile || {};
  const displayName = profile.displayName || `${profile.firstName} ${profile.lastName}`;
  const avatar = profile.avatar;
  const initals = profile.firstName ? profile.firstName[0].toUpperCase() : "?";

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 lg:px-10 py-10">
      <div className="flex flex-col w-full max-w-5xl mx-auto gap-8">
        
        {/* Navigation Action */}
        <div>
          <button 
            onClick={() => navigate("/mentors")}
            className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Mentors
          </button>
        </div>

        {/* Profile Card */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-8 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
          {/* Header background accent */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#3fb950]/20 to-transparent"></div>
          
          {/* Avatar Section */}
          <div className="z-10 flex flex-col items-center gap-4 shrink-0">
            {avatar ? (
              <img src={avatar} alt={displayName} className="w-40 h-40 rounded-full object-cover border-4 border-[#161b22] shadow-xl" />
            ) : (
              <div className="w-40 h-40 rounded-full bg-[#238636] flex items-center justify-center text-5xl font-bold text-white border-4 border-[#161b22] shadow-xl">
                {initals}
              </div>
            )}
          </div>
          
          {/* Main Details */}
          <div className="z-10 flex flex-col w-full gap-5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <h1 className="text-white text-3xl font-bold mb-1 flex items-center gap-2">
                  {displayName}
                  {mentor.verified && <span className="material-symbols-outlined text-[#3fb950] text-[20px]" title="Verified Mentor">verified</span>}
                </h1>
                <p className="text-[#3fb950] font-medium text-lg capitalize">{mentor.categories?.join(', ')} Mentor</p>
                {mentor.tier && mentor.tier !== "bronze" && (
                  <span className={`inline-block mt-2 px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${mentor.tier === 'gold' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-[#c0c0c0]/20 text-[#c0c0c0]'}`}>
                    {mentor.tier} Tier
                  </span>
                )}
              </div>
              
              <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
                <div className="text-xl font-bold text-white">
                   {mentor.hourlyRate > 0 ? `${mentor.currency || 'PKR'} ${mentor.hourlyRate}/Hr` : 'Free'}
                </div>
                <Button 
                  variant="primary" 
                  className="px-6 py-2.5 flex items-center gap-2 font-medium"
                  onClick={() => navigate(`/book-session?mentorId=${mentor._id}`)}
                >
                  <span className="material-symbols-outlined text-lg">calendar_month</span>
                  Book Session
                </Button>
              </div>
            </div>
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
              <div className="bg-[#0d1117] rounded-xl p-4 border border-[#30363d] flex flex-col">
                <span className="text-[#8b949e] text-xs font-semibold uppercase mb-1">Sessions</span>
                <span className="text-white text-xl font-bold">{mentor.totalSessions || 0}</span>
              </div>
              <div className="bg-[#0d1117] rounded-xl p-4 border border-[#30363d] flex flex-col">
                <span className="text-[#8b949e] text-xs font-semibold uppercase mb-1">Rating</span>
                <span className="text-white text-xl font-bold flex items-center gap-1">
                  {mentor.averageRating ? mentor.averageRating.toFixed(1) : "New"}
                  {mentor.averageRating > 0 && <span className="material-symbols-outlined text-[#e3b341] text-[16px]">star</span>}
                </span>
              </div>
              <div className="bg-[#0d1117] rounded-xl p-4 border border-[#30363d] flex flex-col md:col-span-2">
                <span className="text-[#8b949e] text-xs font-semibold uppercase mb-1">Availability</span>
                <span className="text-white text-sm font-medium mt-auto">
                    {mentor.availability?.length > 0 ? `${mentor.availability.length} active time slots` : "No slots currently available"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Main Info */}
          <div className="md:col-span-2 flex flex-col gap-8">
            <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8b949e]">person</span>
                About Me
              </h2>
              <div className="prose prose-invert max-w-none text-[#c9d1d9] whitespace-pre-wrap leading-relaxed">
                {mentor.bio || "No professional biography provided."}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-8">
            <section className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 md:p-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#8b949e]">code</span>
                Expertise
              </h2>
              {mentor.expertise?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {mentor.expertise.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1.5 bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] text-sm font-medium rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[#8b949e] italic">No specific expertise listed.</p>
              )}
            </section>
          </div>

        </div>
      </div>
    </div>
  );
}
