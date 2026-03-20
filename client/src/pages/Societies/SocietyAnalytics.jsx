import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import Card from "../../components/common/Card";

export default function SocietyAnalytics() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState("monthly");

  // Mock analytics data
  const analytics = {
    totalMembers: 245,
    newMembers: 23,
    activeMembers: 187,
    totalEvents: 42,
    upcomingEvents: 8,
    completedEvents: 34,
    avgAttendance: 78,
    engagement: 89,
  };

  const memberGrowth = [
    { month: "Sep", members: 156 },
    { month: "Oct", members: 178 },
    { month: "Nov", members: 198 },
    { month: "Dec", members: 212 },
    { month: "Jan", members: 225 },
    { month: "Feb", members: 245 },
  ];

  const eventStats = [
    { name: "Workshop: Intro to AI", attendees: 92, date: "Feb 15" },
    { name: "Tech Talk: Web Dev", attendees: 78, date: "Feb 10" },
    { name: "Networking Mixer", attendees: 65, date: "Feb 8" },
    { name: "Coding Competition", attendees: 54, date: "Feb 3" },
    { name: "Guest Speaker Event", attendees: 112, date: "Jan 28" },
  ];

  const memberCategories = [
    { category: "Computer Science", count: 98, percentage: 40 },
    { category: "Engineering", count: 73, percentage: 30 },
    { category: "Business", count: 49, percentage: 20 },
    { category: "Other", count: 25, percentage: 10 },
  ];

  const maxMembers = Math.max(...memberGrowth.map((m) => m.members));

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
      {/* Header */}
      <PageHeader
        title="Society Analytics"
        subtitle="Track your society's growth and engagement"
        icon="analytics"
        backPath="/society/dashboard"
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Time Range Selector */}
        <div className="flex justify-end mb-6">
          <div className="flex gap-2 bg-[#161b22] border border-[#30363d] rounded-lg p-1">
            {["weekly", "monthly", "yearly"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                  timeRange === range
                    ? "bg-[#238636] text-white"
                    : "text-[#8b949e] hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Members"
            value={analytics.totalMembers}
            icon="people"
            trend="+23 this month"
          />
          <StatCard
            label="Active Members"
            value={analytics.activeMembers}
            icon="trending_up"
            trend={`${Math.round((analytics.activeMembers / analytics.totalMembers) * 100)}% active`}
          />
          <StatCard
            label="Total Events"
            value={analytics.totalEvents}
            icon="event"
            trend="+8 upcoming"
          />
          <StatCard
            label="Avg Attendance"
            value={`${analytics.avgAttendance}%`}
            icon="groups"
            trend="↑ 5% from last month"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Member Growth Chart */}
          <Card padding="p-6">
            <h3 className="text-lg font-bold text-white mb-6">Member Growth</h3>
            <div className="space-y-4">
              {memberGrowth.map((data, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#8b949e]">
                      {data.month}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {data.members}
                    </span>
                  </div>
                  <div className="h-3 bg-[#161b22] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#238636] to-[#2ea043] rounded-full transition-all duration-500"
                      style={{
                        width: `${(data.members / maxMembers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Member Distribution */}
          <Card padding="p-6">
            <h3 className="text-lg font-bold text-white mb-6">
              Member Distribution
            </h3>
            <div className="space-y-4">
              {memberCategories.map((cat, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#8b949e]">
                      {cat.category}
                    </span>
                    <span className="text-sm font-bold text-white">
                      {cat.count} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="h-3 bg-[#161b22] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#238636] to-[#2ea043] rounded-full transition-all duration-500"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Events Performance */}
        <Card padding="p-6">
          <h3 className="text-lg font-bold text-white mb-6">
            Recent Events Performance
          </h3>
          <div className="space-y-4">
            {eventStats.map((event, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-[#161b22] rounded-lg border border-[#30363d]"
              >
                <div className="flex-1">
                  <h4 className="text-white font-medium mb-1">{event.name}</h4>
                  <p className="text-sm text-[#8b949e]">{event.date}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">
                      {event.attendees}
                    </div>
                    <div className="text-xs text-[#8b949e]">attendees</div>
                  </div>
                  <div className="w-16 h-16 rounded-lg bg-[#238636]/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[#238636] text-2xl">
                      event
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Engagement Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card padding="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#238636]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#238636] text-xl">
                  forum
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">1,284</div>
                <div className="text-sm text-[#8b949e]">Total Posts</div>
              </div>
            </div>
          </Card>
          <Card padding="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#238636]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#238636] text-xl">
                  favorite
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">5,672</div>
                <div className="text-sm text-[#8b949e]">Total Likes</div>
              </div>
            </div>
          </Card>
          <Card padding="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#238636]/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-[#238636] text-xl">
                  chat
                </span>
              </div>
              <div>
                <div className="text-2xl font-bold text-white">892</div>
                <div className="text-sm text-[#8b949e]">Comments</div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}
