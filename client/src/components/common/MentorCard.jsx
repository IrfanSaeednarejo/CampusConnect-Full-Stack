import Button from "./Button";
import { Link } from "react-router-dom";

export default function MentorCard({ mentor, className = "" }) {
  const profile = mentor?.userId?.profile || {};
  const displayName = profile.displayName || `${profile.firstName} ${profile.lastName}` || "Unknown Mentor";
  const avatar = profile.avatar;
  const initals = profile.firstName ? profile.firstName[0].toUpperCase() : "?";

  // Format expertise array to string
  const expertiseKeys = mentor?.expertise?.join(", ") || "General";
  
  // Quick summary of availability (e.g., number of slots)
  const slotsCount = mentor?.availability?.length || 0;
  const availabilityText = slotsCount > 0 ? `${slotsCount} slots available` : "Flexible";

  return (
    <div
      className={`flex flex-col gap-4 p-5 rounded-xl border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] transition-colors ${className}`}
    >
      <div className="flex items-start gap-4">
        {avatar ? (
          <img src={avatar} alt={displayName} className="w-14 h-14 rounded-full object-cover border-2 border-[#30363d]" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-[#3fb950] flex items-center justify-center text-xl font-bold text-white shrink-0">
            {initals}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link to={`/mentors/${mentor._id}`} className="hover:underline">
            <h2 className="text-[#e6edf3] text-lg font-bold leading-tight truncate">
              {displayName}
            </h2>
          </Link>
          <p className="text-[#3fb950] text-sm font-semibold mt-0.5 truncate">
            {expertiseKeys}
          </p>
          {mentor.tier && mentor.tier !== "bronze" && (
            <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${mentor.tier === 'gold' ? 'bg-[#d4af37]/20 text-[#d4af37]' : 'bg-[#c0c0c0]/20 text-[#c0c0c0]'}`}>
              {mentor.tier} Mentor
            </span>
          )}
        </div>
      </div>
      
      <p className="text-[#8b949e] text-sm font-normal leading-relaxed line-clamp-2 min-h-[40px]">
        {mentor.bio || "No bio provided."}
      </p>
      
      <div className="flex items-center gap-4 text-xs font-medium text-[#8b949e] mt-auto">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">calendar_clock</span>
          {availabilityText}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px]">group</span>
          {mentor.totalSessions || 0} sessions
        </div>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="material-symbols-outlined text-[16px] text-[#e3b341]">star</span>
          {mentor.averageRating ? mentor.averageRating.toFixed(1) : "New"}
        </div>
      </div>
      
      <div className="border-t border-[#30363d] pt-4 mt-1 flex justify-between items-center">
        <div className="text-sm font-semibold text-[#e6edf3]">
          {mentor.hourlyRate > 0 ? `${mentor.currency || 'PKR'} ${mentor.hourlyRate}/Hr` : 'Free'}
        </div>
        <Link to={`/mentors/${mentor._id}`}>
          <Button variant="primary" className="h-9 px-4 text-sm font-medium">
            View Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}
