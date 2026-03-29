import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSocietyById,
  selectSelectedSociety,
  selectSocietyLoading,
} from "../../redux/slices/societySlice";
import { getSocietyMembers } from "../../api/societyApi";
import api from "../../api/axios";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/common/EmptyState";

export default function SocietyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");

  const society = useSelector(selectSelectedSociety);
  const isLoading = useSelector(selectSocietyLoading);

  // Local state for real data
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch real society data
  useEffect(() => {
    if (id) {
      dispatch(fetchSocietyById(id));
    }
  }, [dispatch, id]);

  // Fetch members and events when society is loaded
  useEffect(() => {
    if (!id) return;
    const loadData = async () => {
      setLoadingData(true);
      try {
        // Fetch real members
        const membersRes = await getSocietyMembers(id, { status: "approved" });
        const membersData = membersRes.data || membersRes || [];
        setMembers(Array.isArray(membersData) ? membersData : []);

        // Fetch real events
        try {
          const eventsRes = await api.get("/competitions", { params: { societyId: id } });
          const eventsData = eventsRes.data?.data?.docs || eventsRes.data?.data || [];
          setEvents(Array.isArray(eventsData) ? eventsData : []);
        } catch { setEvents([]); }
      } catch (err) {
        console.error("[SocietyDetail] Error loading data:", err);
      } finally {
        setLoadingData(false);
      }
    };
    loadData();
  }, [id]);

  if (isLoading || loadingData || !society) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl animate-spin text-[#238636]">sync</span>
            <p className="text-[#8b949e]">Loading society...</p>
          </div>
        </div>
      </div>
    );
  }

  const societyName = society.name || "Society";
  const societyDesc = society.description || "";
  const memberCount = society.memberCount || members.length || 0;
  const headName = society.createdBy?.profile?.displayName || "N/A";
  const category = society.category || "other";

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
      {/* Header */}
      <PageHeader
        title={societyName}
        subtitle={societyDesc}
        icon="groups"
        backPath="/societies"
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate(`/student/societies/${id}`)}
              variant="primary"
            >
              View Full Page
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Society Stats — REAL DATA */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card padding="p-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-[#238636] mb-2">people</span>
              <div className="text-2xl font-bold text-white">{memberCount}</div>
              <div className="text-sm text-[#8b949e] mt-1">Members</div>
            </div>
          </Card>
          <Card padding="p-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-[#238636] mb-2">event</span>
              <div className="text-2xl font-bold text-white">{events.length}</div>
              <div className="text-sm text-[#8b949e] mt-1">Events</div>
            </div>
          </Card>
          <Card padding="p-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-[#238636] mb-2">category</span>
              <div className="text-2xl font-bold text-white capitalize">{category}</div>
              <div className="text-sm text-[#8b949e] mt-1">Category</div>
            </div>
          </Card>
          <Card padding="p-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-[#238636] mb-2">person</span>
              <div className="text-lg font-bold text-white">{headName}</div>
              <div className="text-sm text-[#8b949e] mt-1">Society Head</div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#30363d]">
          {["overview", "members", "events"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${activeTab === tab
                  ? "text-[#238636] border-b-2 border-[#238636]"
                  : "text-[#8b949e] hover:text-white"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <Card padding="p-6">
            <h3 className="text-xl font-bold text-white mb-4">About</h3>
            <p className="text-[#8b949e] mb-6">{societyDesc || "No description available."}</p>
          </Card>
        )}

        {activeTab === "members" && (
          <div className="space-y-4">
            {members.length === 0 ? (
              <Card padding="p-12">
                <EmptyState icon="group_off" title="No members yet" description="This society has no approved members." />
              </Card>
            ) : (
              members.map((member, idx) => {
                const user = member.memberId || {};
                const displayName = user?.profile?.displayName || user?.profile?.firstName || "Unknown";
                const avatarUrl = user?.profile?.avatar || "";
                return (
                  <Card key={user?._id || idx} padding="p-4" hover={true}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar name={displayName} src={avatarUrl} size="12" borderColor="[#238636]" />
                        <div>
                          <h4 className="text-white font-medium">{displayName}</h4>
                          <p className="text-sm text-[#8b949e] capitalize">{member.role}</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-4">
            {events.length === 0 ? (
              <Card padding="p-12">
                <EmptyState icon="event_busy" title="No events" description="No events have been created for this society yet." />
              </Card>
            ) : (
              events.map((event) => {
                const eventDate = event.startAt ? new Date(event.startAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "TBD";
                const eventTime = event.startAt ? new Date(event.startAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <Card key={event._id} padding="p-6" hover={true}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-white mb-2">{event.title}</h4>
                        <div className="space-y-1 text-sm text-[#8b949e]">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">calendar_today</span>
                            <span>{eventDate}</span>
                          </div>
                          {eventTime && (
                            <div className="flex items-center gap-2">
                              <span className="material-symbols-outlined text-sm">schedule</span>
                              <span>{eventTime}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">info</span>
                            <span className="capitalize">{event.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
