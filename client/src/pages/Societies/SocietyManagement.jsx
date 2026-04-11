import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectRegisteredSocieties,
  fetchUserSocieties,
  fetchSocietyById,
  selectSelectedSociety,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";
import { getSocietyMembers, getSocietyAnalytics } from "../../api/societyApi";
import api from "../../api/axios";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";
import SocietyTabs from "../../components/societies/SocietyTabs";
import Avatar from "../../components/common/Avatar";
import { approveSocietyMember, rejectSocietyMember } from "../../api/societyApi";

export default function SocietyManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");

  // Get the logged-in user's societies from Redux
  const userSocieties = useSelector(selectRegisteredSocieties);
  const selectedSociety = useSelector(selectSelectedSociety);
  const isLoading = useSelector(selectSocietyLoading);
  const authUser = useSelector((state) => state.auth?.user);

  // Local state for real data
  const [societyData, setSocietyData] = useState(null);
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // First, fetch user's societies if not loaded
  useEffect(() => {
    if (authUser?._id && userSocieties.length === 0) {
      dispatch(fetchUserSocieties(authUser._id));
    }
  }, [dispatch, authUser, userSocieties.length]);

  // Pick the first society the user owns (or the selected one)
  const targetSociety = selectedSociety || userSocieties[0];
  const societyId = targetSociety?._id || targetSociety?.id;

  // Fetch all real data once we have a societyId
  useEffect(() => {
    if (!societyId) return;

    const loadAllData = async () => {
      setLoading(true);
      try {
        // Fetch society detail
        const societyRes = await dispatch(fetchSocietyById(societyId)).unwrap();
        setSocietyData(societyRes);

        // Fetch approved members
        const membersRes = await getSocietyMembers(societyId, { status: "approved" });
        const membersData = membersRes.data || membersRes || [];
        setMembers(Array.isArray(membersData) ? membersData : []);

        // Fetch pending members
        const pendingRes = await getSocietyMembers(societyId, { status: "pending" });
        const pendingData = pendingRes.data || pendingRes || [];
        setPendingMembers(Array.isArray(pendingData) ? pendingData : []);

        // Fetch society events from competitions API
        try {
          const eventsRes = await api.get("/competitions", { params: { societyId } });
          const eventsData = eventsRes.data?.data?.docs || eventsRes.data?.data || [];
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch { setEvents([]); }

        // Fetch announcements from the first event (if any exist)
        setAnnouncements([]);

        // Fetch stats
        try {
          const statsRes = await getSocietyAnalytics(societyId);
          setStats(statsRes.data || statsRes || null);
        } catch { setStats(null); }
      } catch (err) {
        console.error("[SocietyManagement] Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAllData();
  }, [societyId, dispatch]);

  // Approve/Reject handlers
  const handleApprove = async (memberId) => {
    try {
      await approveSocietyMember(societyId, memberId);
      setPendingMembers((prev) => prev.filter((m) => (m.memberId?._id || m.memberId) !== memberId));
      // Refresh members
      const membersRes = await getSocietyMembers(societyId, { status: "approved" });
      const membersData = membersRes.data || membersRes || [];
      setMembers(Array.isArray(membersData) ? membersData : []);
    } catch (err) {
      console.error("Approve failed:", err);
    }
  };

  const handleReject = async (memberId) => {
    try {
      await rejectSocietyMember(societyId, memberId);
      setPendingMembers((prev) => prev.filter((m) => (m.memberId?._id || m.memberId) !== memberId));
    } catch (err) {
      console.error("Reject failed:", err);
    }
  };

  if (loading || !societyData) {
    return (
      <div className="min-h-screen bg-background text-text-primary flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
          <p className="text-text-secondary">Loading society data...</p>
        </div>
      </div>
    );
  }

  const totalMembers = societyData.memberCount || members.length || 0;
  const totalEvents = events.length;
  const pendingCount = pendingMembers.length;
  const upcomingEvents = events.filter((e) => e.status === "registration" || e.status === "upcoming" || e.status === "draft").length;
  const societyName = societyData.name || "Society";
  const societyDesc = societyData.description || "";
  const societyCategory = societyData.category || "";
  const societyFounded = societyData.createdAt ? new Date(societyData.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "N/A";
  const societyStatus = societyData.status || "approved";
  const societyLogo = societyData.media?.logo || societyData.logoUrl || "🏛️";

  return (
    <div className="min-h-screen bg-background text-text-primary">
      {/* Header */}
      <SocietyPageHeader
        title={societyName}
        subtitle="Society Management"
        icon={
          societyLogo.startsWith("http") ? (
            <img src={societyLogo} alt={societyName} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <span className="text-4xl">{societyLogo}</span>
          )
        }
        backPath="/society/dashboard"
        action={
          <>
            <button
              onClick={() => navigate(`/society/edit/${societyId}`)}
              className="px-4 py-2 rounded-lg bg-surface-hover text-text-primary text-sm font-medium hover:bg-surface-hover/80 transition-colors"
            >
              Edit Society
            </button>
            <button
              onClick={() => navigate("/society/events/create")}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
            >
              Add Event
            </button>
          </>
        }
      />

      {/* Tabs */}
      <SocietyTabs
        tabs={["overview", "members", "events", "pending", "analytics"]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards — REAL DATA */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Total Members</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{totalMembers}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-4xl">group</span>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Total Events</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{totalEvents}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-4xl">event</span>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Pending Requests</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{pendingCount}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-4xl">person_add</span>
                </div>
              </div>
              <div className="bg-surface border border-border rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-text-secondary text-sm">Upcoming Events</p>
                    <p className="text-3xl font-bold text-text-primary mt-2">{upcomingEvents}</p>
                  </div>
                  <span className="material-symbols-outlined text-primary text-4xl">upcoming</span>
                </div>
              </div>
            </div>

            {/* Society Details — REAL DATA */}
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Society Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-text-secondary text-sm mb-1">Description</p>
                  <p className="text-text-primary">{societyDesc || "No description provided"}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">Category</p>
                  <p className="text-text-primary capitalize">{societyCategory}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">Founded</p>
                  <p className="text-text-primary">{societyFounded}</p>
                </div>
                <div>
                  <p className="text-text-secondary text-sm mb-1">Status</p>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${societyStatus === "approved"
                    ? "bg-primary/20 text-primary"
                    : "bg-yellow-500/20 text-yellow-400"
                    }`}>
                    {societyStatus === "approved" ? "Active" : societyStatus}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab — REAL DATA */}
        {activeTab === "members" && (
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Members ({members.length})</h2>
            </div>
            {members.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <span className="material-symbols-outlined text-5xl mb-3">group_off</span>
                <p>No approved members yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Name</th>
                      <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Role</th>
                      <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Joined</th>
                      <th className="text-left py-3 px-4 text-text-secondary text-sm font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member, idx) => {
                      const user = member.memberId || {};
                      const displayName = user?.profile?.displayName || user?.profile?.firstName || "Unknown";
                      const avatarUrl = user?.profile?.avatar || "";
                      const joinedDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "N/A";

                      return (
                        <tr key={user?._id || idx} className="border-b border-border hover:bg-surface border border-border">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar name={displayName} src={avatarUrl} size="sm" />
                              <span className="text-text-primary">{displayName}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-text-secondary capitalize">{member.role}</td>
                          <td className="py-3 px-4 text-text-secondary">{joinedDate}</td>
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/20 text-primary">
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Events Tab — REAL DATA */}
        {activeTab === "events" && (
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Society Events ({events.length})</h2>
              <button
                onClick={() => navigate("/society/events/create")}
                className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary/90"
              >
                Create Event
              </button>
            </div>
            {events.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <span className="material-symbols-outlined text-5xl mb-3">event_busy</span>
                <p>No events created yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => {
                  const eventDate = event.startAt ? new Date(event.startAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBD";
                  return (
                    <div
                      key={event._id}
                      className="flex items-center justify-between p-4 bg-background rounded-lg border border-border"
                    >
                      <div className="flex-1">
                        <h3 className="text-text-primary font-semibold mb-1">{event.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-text-secondary">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            {eventDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">category</span>
                            {event.eventType || "event"}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${event.status === "registration" || event.status === "ongoing"
                        ? "bg-primary/20 text-primary"
                        : event.status === "draft"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-text-secondary/20 text-text-secondary"
                        }`}>
                        {event.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pending Requests Tab — REAL DATA */}
        {activeTab === "pending" && (
          <div className="bg-surface border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-6">Pending Join Requests ({pendingCount})</h2>
            {pendingMembers.length === 0 ? (
              <div className="text-center py-12 text-text-secondary">
                <span className="material-symbols-outlined text-5xl mb-3">check_circle</span>
                <p>No pending requests</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingMembers.map((member, idx) => {
                  const user = member.memberId || {};
                  const memberId = user?._id || member.memberId;
                  const displayName = user?.profile?.displayName || user?.profile?.firstName || "Unknown User";
                  const avatarUrl = user?.profile?.avatar || "";
                  const requestDate = member.joinedAt ? new Date(member.joinedAt).toLocaleDateString() : "";

                  return (
                    <div key={memberId || idx} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Avatar name={displayName} src={avatarUrl} size="sm" />
                        <div>
                          <p className="text-text-primary font-medium">{displayName}</p>
                          {requestDate && <p className="text-text-secondary text-xs">Requested {requestDate}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(memberId)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(memberId)}
                          className="px-3 py-1.5 text-xs font-bold rounded-lg border border-[#DC2626] text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab — REAL DATA */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-surface border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Society Analytics</h2>
              {stats ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-text-secondary text-sm">Total Members</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.members?.total || 0}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-text-secondary text-sm">Total Events</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.events?.total || 0}</p>
                  </div>
                  <div className="bg-background rounded-lg p-4 border border-border">
                    <p className="text-text-secondary text-sm">Joined Last 30 Days</p>
                    <p className="text-2xl font-bold text-text-primary">{stats.members?.joinedLast30Days || 0}</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  <span className="material-symbols-outlined text-6xl mb-4">analytics</span>
                  <p>Analytics data could not be loaded</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
