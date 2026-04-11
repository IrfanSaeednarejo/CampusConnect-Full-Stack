import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { selectRegisteredSocieties } from "@/redux/slices/societySlice";
import { selectUpcomingEvents } from "@/redux/slices/eventSlice";
import { getCurrentUser, updateAccountDetails } from "@/api/authApi";

export default function SocietyProfile() {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const societies = useSelector(selectRegisteredSocieties) || [];
  const events = useSelector(selectUpcomingEvents) || [];

  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUser();
        const user = data.profile || data;
        const totalMembers = societies.reduce((acc, soc) => acc + (soc.memberCount || soc.members?.length || 0), 0);

        setProfileData({
          name: user.displayName || user.name || user.firstName || "Society Head",
          role: "Society Head",
          email: user.email || authUser?.email || "",
          phone: user.phoneNumber || user.phone || "Not provided",
          department: user.department || "General",
          bio: user.bio || "Passionate about building communities and fostering collaboration among students.",
          avatar: user.avatar || "",
          stats: {
            totalMembers: totalMembers,
            eventsOrganized: events.length || 0,
            societies: societies.length,
            activeSince: new Date(user.createdAt || authUser?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
            upcomingEvents: events.length,
          },
          achievements: [
            { id: 1, title: `Active since ${new Date(user.createdAt || authUser?.createdAt || Date.now()).getFullYear()}`, date: new Date(user.createdAt || authUser?.createdAt || Date.now()).toLocaleDateString("en-US", { month: "short", year: "numeric" }), icon: "emoji_events" }
          ]
        });
      } catch (err) {
        console.error("Failed to load user profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [societies, events, authUser]);

  const handleToggleEdit = async () => {
    if (isEditing) {
      try {
        setIsSaving(true);
        const nameParts = profileData.name.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.slice(1).join(" ");

        await updateAccountDetails({
          firstName,
          lastName,
          phoneNumber: profileData.phone,
          department: profileData.department,
          bio: profileData.bio
        });

        // Let the state remain as edited
      } catch (err) {
        console.error("Failed to update profile", err);
      } finally {
        setIsSaving(false);
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  if (loading || !profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    );
  }

  const initials = profileData.name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase() || "SH";

  // Re-sync name if it changes due to editing (if you decide to save it externally later)

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/society/dashboard")}
                className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  arrow_back
                </span>
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            </div>
            <button
              onClick={handleToggleEdit}
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg text-white text-sm font-bold transition-colors flex items-center gap-2 ${isSaving ? 'bg-primary/50 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'}`}
            >
              <span className="material-symbols-outlined text-sm">
                {isSaving ? "hourglass_empty" : isEditing ? "save" : "edit"}
              </span>
              {isSaving ? "Saving..." : isEditing ? "Save Profile" : "Edit Profile"}
            </button>
          </div>
        </div>
      </header>

      {/* Profile Banner */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 h-48"></div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20">
        {/* Profile Card */}
        <div className="bg-surface border border-border rounded-lg p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-5xl border-4 border-background">
                {initials}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90">
                  <span className="material-symbols-outlined text-lg">
                    photo_camera
                  </span>
                </button>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={profileData.name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, name: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-primary text-2xl font-bold focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    value={profileData.role}
                    onChange={(e) =>
                      setProfileData({ ...profileData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-secondary focus:outline-none focus:border-primary"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {profileData.name}
                  </h1>
                  <p className="text-text-secondary text-lg mb-4">
                    {profileData.role}
                  </p>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-primary">
                    email
                  </span>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          email: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-1 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <span>{profileData.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-primary">
                    phone
                  </span>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          phone: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-1 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <span>{profileData.phone}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-primary">
                    school
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.department}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          department: e.target.value,
                        })
                      }
                      className="flex-1 px-3 py-1 rounded bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
                    />
                  ) : (
                    <span>{profileData.department}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-primary">
                    calendar_today
                  </span>
                  <span>Active since {profileData.stats.activeSince}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">
              group
            </span>
            <div className="text-3xl font-bold text-text-primary">
              {profileData.stats.totalMembers}
            </div>
            <div className="text-sm text-text-secondary mt-1">Total Members</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">
              event
            </span>
            <div className="text-3xl font-bold text-text-primary">
              {profileData.stats.eventsOrganized}
            </div>
            <div className="text-sm text-text-secondary mt-1">Events Organized</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">
              groups
            </span>
            <div className="text-3xl font-bold text-text-primary">
              {profileData.stats.societies}
            </div>
            <div className="text-sm text-text-secondary mt-1">Societies Led</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-primary mb-2">
              trending_up
            </span>
            <div className="text-3xl font-bold text-text-primary">+{profileData.stats.growthThisMonth}</div>
            <div className="text-sm text-text-secondary mt-1">Growth This Month</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-surface border-b border-border rounded-t-lg">
          <div className="flex gap-6 px-6">
            {["overview", "societies", "achievements", "activity"].map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab
                    ? "border-primary text-text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                    }`}
                >
                  {tab}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-surface border border-border border-t-0 rounded-b-lg p-6 mb-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-text-primary mb-3">About</h3>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-text-primary focus:outline-none focus:border-primary"
                  />
                ) : (
                  <p className="text-text-secondary">{profileData.bio}</p>
                )}
              </div>
            </div>
          )}

          {/* Societies Tab */}
          {activeTab === "societies" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                My Societies
              </h3>
              {societies.length > 0 ? (
                societies.map((society) => (
                  <div
                    key={society._id}
                    className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-4xl">{society.logo || society.emoji || "🏆"}</span>
                      <div>
                        <h4 className="text-text-primary font-semibold">
                          {society.name}
                        </h4>
                        <p className="text-text-secondary text-sm">Society Head</p>
                      </div>
                    </div>
                    <button
                      onClick={() => navigate("/society/manage")}
                      className="px-4 py-2 rounded-lg bg-surface-hover text-text-primary text-sm font-medium hover:bg-surface-hover/80 transition-colors"
                    >
                      Manage
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-text-secondary">
                  <p>You haven't created any societies yet.</p>
                </div>
              )}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Achievements
              </h3>
              {profileData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-2xl">
                      {achievement.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-text-primary font-semibold">
                      {achievement.title}
                    </h4>
                    <p className="text-text-secondary text-sm">{achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-text-primary mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-12 text-text-secondary">
                <span className="material-symbols-outlined text-6xl text-text-secondary/40 block mb-4">
                  history
                </span>
                <p>Activity timeline will be displayed here</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
