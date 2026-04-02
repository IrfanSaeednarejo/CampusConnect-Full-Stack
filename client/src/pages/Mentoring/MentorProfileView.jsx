import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectUserProfile } from "../../redux/slices/userSlice";
import { useModal, MODAL_TYPES } from "../../contexts/ModalContext";
import { getMyMentorProfile } from "../../api/mentoringApi";
import { getCurrentUser } from "../../api/authApi";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import SharedFooter from "../../components/common/SharedFooter";

export default function MentorProfileView() {
  const navigate = useNavigate();
  const { openModal } = useModal();
  const userProfile = useSelector(selectUserProfile);
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        // Try to get mentor-specific profile first
        let mentorData = null;
        try {
          const mentorRes = await getMyMentorProfile();
          mentorData = mentorRes.data;
        } catch {
          // Mentor profile may not exist yet — that's okay
        }

        // Always get the base user profile
        const userRes = await getCurrentUser();
        setUser(userRes.data);
        setProfile(mentorData);
      } catch (err) {
        setError(err?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const displayName = user?.profile?.displayName || "";
  const firstName = user?.profile?.firstName || "";
  const lastName = user?.profile?.lastName || "";
  
  // Robust name matching: Prefer displayName for the main heading
  // Capitalize for presentation since backend stores as lowercase
  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";
  const formattedFirstName = capitalize(firstName);
  const formattedLastName = capitalize(lastName);
  
  const fullName = displayName 
    ? (displayName.includes('.') ? displayName : capitalize(displayName)) 
    : `${formattedFirstName} ${formattedLastName}`.trim() || "Mentor";

  const avatar = user?.profile?.avatar || "";
  const bio = user?.profile?.bio || profile?.bio || "No bio added yet.";
  const department = user?.academic?.department || "Not specified";
  const email = user?.email || "";
  const interests = user?.interests || [];
  const expertise = profile?.expertise || interests;
  const totalSessions = profile?.sessionsCompleted ?? 0;
  const totalMentees = profile?.totalMentees ?? 0;
  const avgRating = profile?.averageRating ?? 0;
  const hourlyRate = profile?.hourlyRate ?? 0;

  if (loading) {
    return (
      <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary bg-[#112118]">
        <div className="layout-container flex h-full grow flex-col">
          <MentorTopBar backPath="/mentor/dashboard" />
          <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
            <div className="flex flex-col items-center justify-center gap-4 py-16">
              <div className="w-10 h-10 border-4 border-[#1dc964] border-t-transparent rounded-full animate-spin"></div>
              <p className="text-text-secondary">Loading your profile...</p>
            </div>
          </main>
          <SharedFooter />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        <MentorTopBar backPath="/mentor/dashboard" />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              <div className="flex flex-col items-center lg:items-start gap-4 flex-1">
                <div 
                  className="w-32 h-32 rounded-full border-4 border-[#1dc964] bg-center bg-cover bg-no-repeat bg-surface"
                  style={{ backgroundImage: `url("${avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(fullName)}`}")` }}
                  title={fullName}
                />
                <div>
                  <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] capitalize">
                    {fullName}
                  </h1>
                  <p className="text-[#1dc964] text-lg font-semibold capitalize">
                    {department} • Mentor
                  </p>
                  <p className="text-text-secondary text-sm mt-1">{email}</p>
                  {avgRating > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-400">⭐ {avgRating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="p-4 bg-surface border border-border rounded-xl text-center">
                  <p className="text-text-secondary text-sm mb-2">Total Sessions</p>
                  <p className="text-white text-3xl font-bold">{totalSessions}</p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl text-center">
                  <p className="text-text-secondary text-sm mb-2">Mentees</p>
                  <p className="text-white text-3xl font-bold">{totalMentees}</p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl text-center">
                  <p className="text-text-secondary text-sm mb-2">Avg Rating</p>
                  <p className="text-white text-3xl font-bold">{avgRating > 0 ? avgRating.toFixed(1) : "—"}</p>
                </div>
                <div className="p-4 bg-surface border border-border rounded-xl text-center">
                  <p className="text-text-secondary text-sm mb-2">Hourly Rate</p>
                  <p className="text-white text-3xl font-bold">{hourlyRate > 0 ? `$${hourlyRate}` : "Free"}</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="p-6 bg-surface border border-border rounded-xl mb-8">
              <h2 className="text-white text-2xl font-bold mb-4">About Me</h2>
              <p className="text-text-primary leading-relaxed">
                {bio}
              </p>
            </div>

            {/* Expertise */}
            {expertise.length > 0 && (
              <div className="p-6 bg-surface border border-border rounded-xl mb-8">
                <h2 className="text-white text-2xl font-bold mb-4">
                  Expertise & Skills
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {expertise.map((skill, idx) => (
                    <div
                      key={idx}
                      className="px-4 py-2 bg-background border border-border rounded-lg text-center"
                    >
                      <span className="text-text-primary font-semibold capitalize">
                        {skill}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Academic Info */}
            <div className="p-6 bg-surface border border-border rounded-xl mb-8">
              <h2 className="text-white text-2xl font-bold mb-4">
                Academic Information
              </h2>
              <div className="space-y-4">
                {user?.academic?.degree && (
                  <div className="flex gap-4 pb-4 border-b border-border">
                    <span className="material-symbols-outlined text-[#1dc964] flex-shrink-0">
                      school
                    </span>
                    <div>
                      <p className="text-white font-semibold capitalize">{user.academic.degree}</p>
                      <p className="text-text-secondary text-sm capitalize">{department}</p>
                    </div>
                  </div>
                )}
                {user?.academic?.semester > 0 && (
                  <div className="flex gap-4">
                    <span className="material-symbols-outlined text-[#1dc964] flex-shrink-0">
                      calendar_today
                    </span>
                    <div>
                      <p className="text-white font-semibold">Semester {user.academic.semester}</p>
                      {user.academic.cgpa > 0 && (
                        <p className="text-text-secondary text-sm">CGPA: {user.academic.cgpa}</p>
                      )}
                    </div>
                  </div>
                )}
                {!user?.academic?.degree && !user?.academic?.semester && (
                  <p className="text-text-secondary">No academic info added yet. Update your profile to add it.</p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => openModal(MODAL_TYPES.EDIT_PROFILE)}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:opacity-90 transition-opacity flex-1"
              >
                <span className="material-symbols-outlined">edit</span>
                Edit Profile
              </button>
              <button
                onClick={() => navigate("/mentor/dashboard")}
                className="flex items-center gap-2 px-6 py-3 bg-[#30363d] text-white font-bold rounded-lg hover:bg-[#404851] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
        <SharedFooter />
      </div>
    </div>
  );
}
