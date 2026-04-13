import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Avatar from "../../components/common/Avatar";
import {
  selectUpcomingEvents,
  setUpcomingEvents,
} from "../../redux/slices/eventSlice";
import {
  selectRegisteredSocieties,
  setRegisteredSocieties,
} from "../../redux/slices/societySlice";
import { useAuth } from "../../contexts/AuthContext";
import api from "../../api/axios";
import { getUserSocieties } from "../../api/societyApi";

const ACHIEVEMENTS = [];

export default function StudentProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const { user } = useAuth();

  const upcomingEvents = useSelector(selectUpcomingEvents);
  const societies = useSelector(selectRegisteredSocieties);

  const displayName = user?.profile?.displayName || user?.name || "Student";
  const username = user?.email?.split("@")[0] || "student";
  const bio = user?.profile?.bio || user?.bio || "Campus Connect member";
  const department = user?.profile?.department || user?.department || "Student";
  const avatarUrl = user?.profile?.avatar || user?.avatar || "";

  useEffect(() => {
    // Fetch real events from backend
    const loadEvents = async () => {
      try {
        const res = await api.get("/competitions", { params: { limit: 5 } });
        const data = res.data?.data?.docs || res.data?.data || [];
        if (Array.isArray(data)) {
          const mapped = data.map(e => ({
            id: e._id,
            icon: "event",
            title: e.title,
            time: e.startAt ? new Date(e.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD",
          }));
          dispatch(setUpcomingEvents(mapped));
        }
      } catch (err) {
        console.error("[StudentProfile] Failed to fetch events:", err);
      }
    };

    // Fetch real societies from backend
    const loadSocieties = async () => {
      const userId = user?._id || user?.id;
      if (!userId) return;
      try {
        const res = await getUserSocieties(userId);
        const data = res.data?.docs || res.data?.societies || res.data || [];
        dispatch(setRegisteredSocieties(Array.isArray(data) ? data : []));
      } catch (err) {
        console.error("[StudentProfile] Failed to fetch societies:", err);
      }
    };

    loadEvents();
    loadSocieties();
  }, [dispatch, user]);

  return (
    <div className="w-full bg-background text-text-primary min-h-screen">


      {/* Main Content */}
      <main className="px-4 sm:px-10 lg:px-20 flex flex-1 justify-center py-5 md:py-10">
        <div className="layout-content-container flex flex-col w-full max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <aside className="w-full md:w-1/4 flex-shrink-0">
              <div className="flex flex-col gap-6">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="w-48 h-48 mx-auto md:w-full md:h-auto rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto md:w-full md:h-auto rounded-lg bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-6xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-text-primary text-2xl font-bold leading-tight tracking-tight">
                    {displayName}
                  </h1>
                  <p className="text-text-secondary text-lg font-normal leading-normal">
                    {username}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => navigate("/profile/edit")}
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface-hover border border-border text-text-primary text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/20 transition-colors gap-2"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    <span className="truncate">Edit Profile</span>
                  </button>
                  <button
                    onClick={() => navigate("/student/academic-network")}
                    className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity gap-2"
                  >
                    <span className="material-symbols-outlined">people</span>
                    <span className="truncate">View Connections</span>
                  </button>
                </div>
                <div className="border-t border-border pt-6">
                  <p className="text-text-primary text-base font-normal leading-normal">
                    {bio}
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-text-secondary">
                    <span className="material-symbols-outlined text-xl">
                      school
                    </span>
                    <p className="text-sm">{department}</p>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <span className="material-symbols-outlined text-xl">
                      group
                    </span>
                    <p className="text-sm">Member of {societies.length} societies</p>
                  </div>
                  <div className="flex items-center gap-3 text-text-secondary">
                    <span className="material-symbols-outlined text-xl">
                      location_on
                    </span>
                    <p className="text-sm">London, UK</p>
                  </div>
                </div>
                <div className="border-t border-border pt-6">
                  <h3 className="text-text-primary text-base font-bold leading-normal mb-3">
                    Interests
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {(user?.profile?.interests || []).length > 0 ? (
                      user.profile.interests.map((interest) => (
                        <div
                          key={interest}
                          className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-primary/20 px-3"
                        >
                          <p className="text-primary text-xs font-medium leading-normal">
                            {interest}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-text-secondary text-sm">No interests added yet</p>
                    )}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="w-full md:w-3/4">
              <div className="flex flex-col gap-8">
                {/* Tabs */}
                <div className="border-b border-border">
                  <div className="flex gap-4 sm:gap-8 -mb-px">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "societies", label: "Societies" },
                      { id: "events", label: "Events" },
                      { id: "mentorship", label: "Mentorship" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-2 px-2 transition-colors ${activeTab === tab.id
                          ? "border-b-primary text-text-primary"
                          : "border-b-transparent text-text-secondary hover:text-text-primary"
                          }`}
                      >
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                          {tab.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Achievements */}
                    {ACHIEVEMENTS.length > 0 && (
                      <div className="col-span-1 lg:col-span-2">
                        <h2 className="text-xl font-bold text-text-primary mb-4">
                          Achievements
                        </h2>
                        {ACHIEVEMENTS.map((achievement) => (
                          <div
                            key={achievement.id}
                            className="bg-surface p-6 rounded-lg border border-border flex items-center justify-between hover:border-primary/50 transition-colors"
                          >
                            <div className="flex items-center gap-4">
                              <div className="text-primary">
                                <span className="material-symbols-outlined text-4xl">
                                  {achievement.icon}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-bold text-text-primary">
                                  {achievement.title}
                                </h3>
                                <p className="text-text-secondary text-sm">
                                  {achievement.description}
                                </p>
                              </div>
                            </div>
                            <span className="material-symbols-outlined text-text-secondary">
                              arrow_forward_ios
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upcoming Events */}
                    <div>
                      <h2 className="text-xl font-bold text-text-primary mb-4">
                        Upcoming Events
                      </h2>
                      <div className="flex flex-col gap-4">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-surface p-4 rounded-lg border border-border flex items-start gap-4 hover:border-primary/50 transition-colors"
                          >
                            <div className="bg-primary/20 rounded-lg p-3 text-primary">
                              <span className="material-symbols-outlined">
                                {event.icon}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-text-primary">
                                {event.title}
                              </h3>
                              <p className="text-text-secondary text-sm">
                                {event.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mentorship Status */}
                    {user?.role === 'mentor' && (
                      <div>
                        <h2 className="text-xl font-bold text-text-primary mb-4">
                          Mentorship Status
                        </h2>
                        <div className="bg-surface p-4 rounded-lg border border-border flex items-start gap-4 hover:border-primary/50 transition-colors">
                          <div className="bg-primary/20 rounded-lg p-3 text-primary">
                            <span className="material-symbols-outlined">
                              school
                            </span>
                          </div>
                          <div>
                            <h3 className="font-bold text-primary">
                              Available to Mentor
                            </h3>
                            <p className="text-text-secondary text-sm">
                              You are registered as a mentor. Check your Mentorship dashboard for pending requests!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* My Societies */}
                    <div className="col-span-1 lg:col-span-2">
                      <h2 className="text-xl font-bold text-text-primary mb-4">
                        My Societies
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {societies.map((society) => {
                          const socName = society.name || 'Society';
                          const socLogo = society.media?.logo || '';
                          return (
                            <div
                              key={society._id || society.id}
                              className="bg-surface p-4 rounded-lg border border-border flex flex-col gap-3 hover:border-primary/50 transition-colors"
                            >
                              {socLogo && socLogo.startsWith('http') ? (
                                <img
                                  src={socLogo}
                                  alt={socName}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center text-xl font-bold text-primary">
                                  {socName.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h3 className="font-bold text-text-primary">
                                  {socName}
                                </h3>
                                <p className="text-text-secondary text-sm capitalize">
                                  {society.role || 'member'}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "societies" && (
                  <div className="bg-surface p-8 rounded-lg border border-border text-center">
                    <span className="material-symbols-outlined text-6xl text-text-secondary block mb-4">
                      groups
                    </span>
                    <p className="text-text-primary">
                      View your society memberships and activities
                    </p>
                  </div>
                )}

                {activeTab === "events" && (
                  <div className="bg-surface p-8 rounded-lg border border-border text-center">
                    <span className="material-symbols-outlined text-6xl text-text-secondary block mb-4">
                      event
                    </span>
                    <p className="text-text-primary">
                      View your event history and upcoming events
                    </p>
                  </div>
                )}

                {activeTab === "mentorship" && (
                  <div className="bg-surface p-8 rounded-lg border border-border text-center">
                    <span className="material-symbols-outlined text-6xl text-text-secondary block mb-4">
                      school
                    </span>
                    <p className="text-text-primary">
                      View your mentorship history and availability
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </main>
    </div>
  );
}
