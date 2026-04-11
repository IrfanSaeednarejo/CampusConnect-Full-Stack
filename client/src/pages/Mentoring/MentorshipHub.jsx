import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getAllMentors } from "../../api/mentoringApi";
import Avatar from "../../components/common/Avatar";
import SharedFooter from "../../components/common/SharedFooter";

export default function MentorshipHub() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchValue, setSearchValue] = useState("");

  const displayName =
    user?.name ||
    user?.profile?.displayName ||
    user?.email?.split("@")[0] ||
    "User";

  useEffect(() => {
    const loadMentors = async () => {
      try {
        const res = await getAllMentors();
        const data = res?.data?.docs || res?.data || [];
        setMentors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load mentors:", err);
      } finally {
        setLoading(false);
      }
    };
    loadMentors();
  }, []);

  // Filter mentors by search
  const filteredMentors = mentors.filter((mentor) => {
    if (!searchValue.trim()) return true;
    const search = searchValue.toLowerCase();
    const name = (mentor.userId?.profile?.displayName || mentor.name || "").toLowerCase();
    const expertise = (mentor.expertise || []).join(" ").toLowerCase();
    const department = (mentor.userId?.academic?.department || "").toLowerCase();
    return name.includes(search) || expertise.includes(search) || department.includes(search);
  });

  return (
    <div className="flex min-h-screen w-full bg-background font-display">
      {/* Sidebar */}
      <aside className="flex flex-col w-64 bg-background border-r border-border/50 hidden lg:flex">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            {/* User Profile */}
            <div className="flex gap-3 items-center">
              {user?.avatar ? (
                <Avatar src={user.avatar} size="10" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-sm">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="flex flex-col">
                <h1 className="text-text-primary text-base font-medium leading-normal">
                  {displayName}
                </h1>
                <p className="text-text-secondary text-sm font-normal leading-normal">
                  {user?.department || "Student"}
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 mt-4">
              <button
                onClick={() => navigate("/student/dashboard")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary/70 hover:bg-surface-hover transition-colors text-left"
              >
                <span className="material-symbols-outlined text-text-primary text-2xl">home</span>
                <p className="text-text-primary text-sm font-medium leading-normal">Home</p>
              </button>
              <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-hover">
                <span className="material-symbols-outlined text-text-primary text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
                <p className="text-text-primary text-sm font-medium leading-normal">Mentorship</p>
              </div>
              <button
                onClick={() => navigate("/student/events")}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-text-primary/70 hover:bg-surface-hover transition-colors text-left"
              >
                <span className="material-symbols-outlined text-text-primary text-2xl">event</span>
                <p className="text-text-primary text-sm font-medium leading-normal">Events</p>
              </button>
            </nav>
          </div>

          {/* Bottom */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/mentor-registration")}
              className="flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
            >
              <span className="truncate">Become a Mentor</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-text-primary text-4xl font-black leading-tight tracking-[-0.033em]">
                Mentorship Hub
              </p>
              <p className="text-text-secondary text-base font-normal leading-normal">
                Find and connect with mentors to guide your academic and professional journey.
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-text-secondary flex border-none bg-surface-hover items-center justify-center pl-4 rounded-l-lg">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border-none bg-surface-hover h-full placeholder:text-text-secondary px-4 text-base font-normal leading-normal"
                    placeholder="Search by name, skill, or department..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
              </label>
            </div>
          </div>

          {/* Section Header */}
          <h2 className="text-text-primary text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4 mt-10">
            Available Mentors
          </h2>

          {/* Mentor Cards Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredMentors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor) => {
                const mentorName = mentor.userId?.profile?.displayName || mentor.name || "Mentor";
                const mentorTitle = mentor.title || mentor.expertise?.[0] || "Mentor";
                const mentorAvatar = mentor.userId?.profile?.avatar || "";
                const mentorId = mentor._id || mentor.id;
                const skills = mentor.expertise || mentor.skills || [];
                const rating = mentor.rating || 0;
                const reviews = mentor.totalReviews || mentor.reviews || 0;

                return (
                  <div
                    key={mentorId}
                    className="bg-surface rounded-xl border border-border/50 p-6 flex flex-col gap-4 hover:border-primary/40 transition-colors"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-4">
                      {mentorAvatar ? (
                        <img
                          className="size-16 rounded-full object-cover"
                          src={mentorAvatar}
                          alt={mentorName}
                        />
                      ) : (
                        <div className="size-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                          {mentorName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <h3 className="text-text-primary font-bold text-lg">{mentorName}</h3>
                        <p className="text-text-secondary text-sm">{mentorTitle}</p>
                      </div>
                    </div>

                    {/* Skills */}
                    {skills.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {skills.slice(0, 4).map((skill) => (
                          <span
                            key={skill}
                            className="bg-surface-hover text-primary text-xs font-semibold px-2.5 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-2 text-text-secondary mt-2">
                      <div className="flex text-primary">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className="material-symbols-outlined text-lg"
                            style={{
                              fontVariationSettings: i < Math.floor(rating) ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            {i < Math.floor(rating) ? "star" : "star"}
                          </span>
                        ))}
                      </div>
                      <span className="text-sm">
                        {rating > 0 ? `${rating} (${reviews} reviews)` : "No reviews yet"}
                      </span>
                    </div>

                    {/* Button */}
                    <button
                      onClick={() => navigate(`/mentor-profile/${mentorId}`)}
                      className="mt-4 w-full text-center bg-primary/20 text-primary font-bold py-2 px-4 rounded-lg hover:bg-primary/30 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <span className="material-symbols-outlined text-5xl text-text-secondary mb-4">person_search</span>
              <p className="text-text-primary text-lg font-semibold">No mentors found</p>
              <p className="text-text-secondary text-sm mt-1">
                {searchValue ? "Try a different search term" : "No registered mentors yet. Check back later!"}
              </p>
            </div>
          )}
        </div>
      </main>
      <SharedFooter />
    </div>
  );
}
