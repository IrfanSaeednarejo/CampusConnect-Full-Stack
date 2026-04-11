import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Card from "../../components/common/Card";
import { useAuth } from "@/contexts/AuthContext";
import { getSocietyAnalytics, getUserSocieties } from "@/api/societyApi";

export default function SocietyAnalytics() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [timeRange, setTimeRange] = useState("monthly");
  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = user?._id || user?.id;
    if (userId) {
      getUserSocieties(userId).then(res => {
        const data = res.data || res || [];
        const societyList = Array.isArray(data.docs) ? data.docs : (Array.isArray(data) ? data : []);
        setSocieties(societyList);

        if (societyList.length > 0) {
          const firstId = societyList[0]._id || societyList[0].id;
          if (firstId) {
            setSelectedSocietyId(firstId);
          } else {
            setLoading(false);
          }
        } else {
          setLoading(false);
        }
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    } else if (user) {
      // If user is loaded but has no ID somehow, stop loading
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (selectedSocietyId) {
      setLoading(true);
      getSocietyAnalytics(selectedSocietyId).then(res => {
        setStats(res.data || res);
        setLoading(false);
      }).catch(err => {
        console.error(err);
        setLoading(false);
      });
    }
  }, [selectedSocietyId]);

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-background">
      {/* Header */}
      <PageHeader
        title="Society Analytics"
        subtitle="Track your society's growth and engagement"
        icon="analytics"
        backPath="/society/dashboard"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Select Society & Time Range Selector */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <div className="flex bg-surface border border-border rounded-lg items-center px-4 py-2 w-full sm:w-auto">
            <span className="material-symbols-outlined text-text-secondary mr-3">admin_panel_settings</span>
            <select
              className="bg-transparent text-text-primary font-medium outline-none cursor-pointer"
              value={selectedSocietyId}
              onChange={(e) => setSelectedSocietyId(e.target.value)}
            >
              {societies.length === 0 && <option value="">No societies found</option>}
              {societies.map(soc => (
                <option key={soc._id || soc.id} value={soc._id || soc.id} className="bg-surface">
                  {soc.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2 bg-surface border border-border rounded-lg p-1 w-full sm:w-auto overflow-x-auto">
            {["weekly", "monthly", "yearly"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors flex-1 sm:flex-none ${timeRange === range
                    ? "bg-primary text-white"
                    : "text-text-secondary hover:text-text-primary"
                  }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : !stats ? (
          <div className="text-center py-20 text-text-secondary">
            Please select a society to view analytics.
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Members"
                value={stats?.members?.total || 0}
                icon="people"
                trend={`+${stats?.members?.joinedLast30Days || 0} this month`}
              />
              <StatCard
                label="Active Members"
                value={stats?.members?.byStatus?.approved || 0}
                icon="how_to_reg"
                trend="Currently active"
              />
              <StatCard
                label="Total Events"
                value={stats?.events?.total || 0}
                icon="event"
                trend={`${stats?.events?.published || 0} Published`}
              />
              <StatCard
                label="Completed Events"
                value={stats?.events?.completed || 0}
                icon="verified"
                trend={`${stats?.events?.cancelled || 0} Cancelled`}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Member Distribution by Status */}
              <Card padding="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-6">Member Distribution (Status)</h3>
                <div className="space-y-4">
                  {stats?.members?.byStatus ? Object.entries(stats.members.byStatus).map(([statusKey, count], index) => {
                    const maxCount = Math.max(...Object.values(stats.members.byStatus), 1);
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-text-secondary capitalize">
                            {statusKey}
                          </span>
                          <span className="text-sm font-bold text-text-primary">
                            {count}
                          </span>
                        </div>
                        <div className="h-3 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4F46E5] to-[#4338CA] rounded-full transition-all duration-500"
                            style={{
                              width: `${(count / maxCount) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  }) : <p className="text-text-secondary text-sm">No status data available</p>}
                </div>
              </Card>

              {/* Member Role Breakdown */}
              <Card padding="p-6">
                <h3 className="text-lg font-bold text-text-primary mb-6">
                  Member Roles
                </h3>
                <div className="space-y-4">
                  {stats?.members?.byRole ? Object.entries(stats.members.byRole).map(([roleKey, count], index) => {
                    const totalApproved = stats.members.byStatus?.approved || 1;
                    const percentage = Math.round((count / totalApproved) * 100);
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-text-secondary capitalize">
                            {roleKey.replace('-', ' ')}
                          </span>
                          <span className="text-sm font-bold text-text-primary">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="h-3 bg-surface rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#4F46E5] to-[#4338CA] rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  }) : <p className="text-text-secondary text-sm">No role data available</p>}
                </div>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
