import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMentorById } from "../../api/mentoringApi";
import Avatar from "../../components/common/Avatar";

export default function MentorDisplayProfile() {
  const navigate = useNavigate();
  const { mentorId } = useParams();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!mentorId) return;
    const loadMentor = async () => {
      try {
        const res = await getMentorById(mentorId);
        setMentor(res?.data || null);
      } catch (err) {
        console.error("Failed to load mentor:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMentor();
  }, [mentorId]);

  const mentorName = mentor?.userId?.profile?.displayName || mentor?.name || "Mentor";
  const mentorAvatar = mentor?.userId?.profile?.avatar || "";
  const mentorBio = mentor?.bio || mentor?.userId?.profile?.bio || "No bio available";
  const skills = mentor?.expertise || mentor?.skills || [];
  const rating = mentor?.rating || 0;
  const totalReviews = mentor?.totalReviews || 0;

  return (
    <div className="w-full bg-background text-text-primary min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-6 lg:px-10 py-3">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate(-1)}
            className="text-text-primary hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-4 text-text-primary">
            <svg className="size-6 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
            </svg>
            <h2 className="text-text-primary text-lg font-bold">CampusConnect</h2>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 md:px-10 lg:px-20 xl:px-40">
        <div className="mx-auto w-full max-w-7xl flex flex-col gap-8">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : mentor ? (
            <>
              {/* Page Heading */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-text-primary text-3xl font-bold md:text-4xl">
                  {mentorName}'s Profile
                </h1>
              </div>

              {/* Profile Layout */}
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                {/* Left Column */}
                <aside className="lg:col-span-4 xl:col-span-3">
                  <div className="flex flex-col gap-6">
                    {mentorAvatar ? (
                      <img src={mentorAvatar} alt={mentorName} className="w-48 h-48 mx-auto lg:w-full lg:h-auto rounded-lg object-cover" />
                    ) : (
                      <div className="w-48 h-48 mx-auto lg:w-full lg:h-auto rounded-lg bg-primary/20 flex items-center justify-center text-primary text-6xl font-bold">
                        {mentorName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <h2 className="text-text-primary text-2xl font-bold">{mentorName}</h2>
                      <p className="text-text-secondary text-base font-normal">{mentorBio}</p>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-2">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-lg ${i < Math.floor(rating) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                        ))}
                      </div>
                      <span className="text-text-secondary text-sm">
                        {rating > 0 ? `${rating} (${totalReviews} reviews)` : "No reviews yet"}
                      </span>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill) => (
                          <span key={skill} className="bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">{skill}</span>
                        ))}
                      </div>
                    )}

                    <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary hover:bg-primary/90 transition-colors text-white text-sm font-bold">
                      <span>Request Session</span>
                    </button>
                  </div>
                </aside>

                {/* Right Column */}
                <div className="lg:col-span-8 xl:col-span-9">
                  <div className="flex flex-col gap-8">
                    {/* Availability */}
                    <section>
                      <h3 className="text-text-primary text-xl font-bold border-b border-border pb-3 mb-4">
                        Availability
                      </h3>
                      <div className="bg-surface rounded-lg border border-border p-6">
                        {mentor.availability && mentor.availability.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {mentor.availability.map((slot, i) => (
                              <div key={i} className="flex items-center gap-3 p-3 bg-background rounded-lg border border-border">
                                <span className="material-symbols-outlined text-primary">schedule</span>
                                <div>
                                  <p className="text-text-primary text-sm font-medium">{slot.day}</p>
                                  <p className="text-text-secondary text-xs">{slot.startTime} - {slot.endTime}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-text-secondary text-sm text-center py-4">No availability set yet</p>
                        )}
                      </div>
                    </section>

                    {/* About */}
                    <section>
                      <h3 className="text-text-primary text-xl font-bold border-b border-border pb-3 mb-4">
                        About
                      </h3>
                      <div className="bg-surface rounded-lg border border-border p-6">
                        <p className="text-text-primary text-sm leading-relaxed">{mentorBio}</p>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-text-secondary mb-4">person_off</span>
              <p className="text-text-primary text-lg font-semibold">Mentor not found</p>
              <p className="text-text-secondary text-sm mt-1">This mentor profile doesn't exist or has been removed.</p>
              <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                Go Back
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
