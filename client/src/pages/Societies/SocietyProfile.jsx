import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SocietyProfile() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditing, setIsEditing] = useState(false);

  const [profileData, setProfileData] = useState({
    name: "Alex Chen",
    role: "Society Head",
    email: "alex.chen@university.edu",
    phone: "+1 (555) 123-4567",
    department: "Computer Science",
    bio: "Passionate about building communities and fostering collaboration among students. Leading multiple tech societies to create impactful campus experiences.",
    societies: [
      { id: 1, name: "Tech Innovators Club", role: "President", emoji: "🚀" },
      {
        id: 2,
        name: "Entrepreneurs of Tomorrow",
        role: "Vice President",
        emoji: "💼",
      },
      { id: 3, name: "Debate Society", role: "Advisor", emoji: "🎤" },
    ],
    achievements: [
      {
        id: 1,
        title: "Founded Tech Innovators Club",
        date: "Sep 2023",
        icon: "emoji_events",
      },
      {
        id: 2,
        title: "Organized 12 Campus Events",
        date: "2024",
        icon: "event",
      },
      {
        id: 3,
        title: "Grew Society Membership to 1,284",
        date: "Nov 2024",
        icon: "trending_up",
      },
    ],
    stats: {
      totalMembers: 1284,
      eventsOrganized: 42,
      societies: 3,
      activeSince: "Sep 2023",
    },
  });

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <header className="bg-surface border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/society/dashboard")}
                className="flex items-center gap-2 text-text-secondary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">
                  arrow_back
                </span>
                <span className="text-sm font-medium">Back to Dashboard</span>
              </button>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                {isEditing ? "save" : "edit"}
              </span>
              {isEditing ? "Save Profile" : "Edit Profile"}
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
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-5xl border-4 border-[#1a241e]">
                AC
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
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-white text-2xl font-bold focus:outline-none focus:border-[#1dc964]"
                  />
                  <input
                    type="text"
                    value={profileData.role}
                    onChange={(e) =>
                      setProfileData({ ...profileData, role: e.target.value })
                    }
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border text-text-secondary focus:outline-none focus:border-[#1dc964]"
                  />
                </div>
              ) : (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">
                    {profileData.name}
                  </h1>
                  <p className="text-text-secondary text-lg mb-4">
                    {profileData.role}
                  </p>
                </>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-[#1dc964]">
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
                      className="flex-1 px-3 py-1 rounded bg-background border border-border text-white focus:outline-none focus:border-[#1dc964]"
                    />
                  ) : (
                    <span>{profileData.email}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-[#1dc964]">
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
                      className="flex-1 px-3 py-1 rounded bg-background border border-border text-white focus:outline-none focus:border-[#1dc964]"
                    />
                  ) : (
                    <span>{profileData.phone}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-[#1dc964]">
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
                      className="flex-1 px-3 py-1 rounded bg-background border border-border text-white focus:outline-none focus:border-[#1dc964]"
                    />
                  ) : (
                    <span>{profileData.department}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                  <span className="material-symbols-outlined text-[#1dc964]">
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
            <span className="material-symbols-outlined text-4xl text-[#1dc964] mb-2">
              group
            </span>
            <div className="text-3xl font-bold text-white">
              {profileData.stats.totalMembers}
            </div>
            <div className="text-sm text-text-secondary mt-1">Total Members</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-[#1dc964] mb-2">
              event
            </span>
            <div className="text-3xl font-bold text-white">
              {profileData.stats.eventsOrganized}
            </div>
            <div className="text-sm text-text-secondary mt-1">Events Organized</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-[#1dc964] mb-2">
              groups
            </span>
            <div className="text-3xl font-bold text-white">
              {profileData.stats.societies}
            </div>
            <div className="text-sm text-text-secondary mt-1">Societies Led</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6 text-center">
            <span className="material-symbols-outlined text-4xl text-[#1dc964] mb-2">
              trending_up
            </span>
            <div className="text-3xl font-bold text-white">+112</div>
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
                  className={`px-4 py-3 text-sm font-medium capitalize border-b-2 transition-colors ${
                    activeTab === tab
                      ? "border-[#1dc964] text-white"
                      : "border-transparent text-text-secondary hover:text-white"
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
                <h3 className="text-xl font-bold text-white mb-3">About</h3>
                {isEditing ? (
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-white focus:outline-none focus:border-[#1dc964]"
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
              <h3 className="text-xl font-bold text-white mb-4">
                My Societies
              </h3>
              {profileData.societies.map((society) => (
                <div
                  key={society.id}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-[#1dc964]/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{society.emoji}</span>
                    <div>
                      <h4 className="text-white font-semibold">
                        {society.name}
                      </h4>
                      <p className="text-text-secondary text-sm">{society.role}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate("/society/manage")}
                    className="px-4 py-2 rounded-lg bg-surface-hover text-white text-sm font-medium hover:bg-surface-hover/80 transition-colors"
                  >
                    Manage
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">
                Achievements
              </h3>
              {profileData.achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex items-center gap-4 p-4 bg-background rounded-lg border border-border"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#1dc964] text-2xl">
                      {achievement.icon}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-semibold">
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
              <h3 className="text-xl font-bold text-white mb-4">
                Recent Activity
              </h3>
              <div className="text-center py-12 text-text-secondary">
                <span className="material-symbols-outlined text-6xl text-[#29382f] block mb-4">
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
