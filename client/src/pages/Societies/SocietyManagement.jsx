import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSelectedSociety,
  setSelectedSociety,
} from "../../redux/slices/societySlice";
import { selectAllMembers, setMembers } from "../../redux/slices/memberSlice";
import { selectAllEvents, setEvents } from "../../redux/slices/eventSlice";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";
import SocietyTabs from "../../components/societies/SocietyTabs";

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: "New meeting schedule",
    date: "2 days ago",
    content: "Weekly meetings now on Fridays at 4 PM",
  },
  {
    id: 2,
    title: "Event registration open",
    date: "1 week ago",
    content: "Register for the Annual Tech Summit",
  },
];

export default function SocietyManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const societyData = useSelector(selectSelectedSociety);
  const members = useSelector(selectAllMembers);
  const events = useSelector(selectAllEvents);

  useEffect(() => {
    if (!societyData) {
      dispatch(
        setSelectedSociety({
          id: 1,
          name: "Tech Innovators Club",
          description:
            "A community of technology enthusiasts exploring cutting-edge innovations",
          category: "Technology",
          members: 245,
          events: 12,
          founded: "September 2023",
          logo: "🚀",
        })
      );
    }
  }, [dispatch, societyData]);

  useEffect(() => {
    if (members.length === 0) {
      dispatch(
        setMembers([
          {
            id: 1,
            name: "Sarah Johnson",
            role: "President",
            email: "sarah@example.com",
            joined: "Sep 2023",
            status: "Active",
            interests: ["Leadership", "Technology"],
          },
          {
            id: 2,
            name: "Mike Chen",
            role: "Vice President",
            email: "mike@example.com",
            joined: "Oct 2023",
            status: "Active",
            interests: ["Management", "Innovation"],
          },
          {
            id: 3,
            name: "Emily Davis",
            role: "Secretary",
            email: "emily@example.com",
            joined: "Nov 2023",
            status: "Active",
            interests: ["Administration", "Communication"],
          },
          {
            id: 4,
            name: "James Wilson",
            role: "Member",
            email: "james@example.com",
            joined: "Dec 2023",
            status: "Active",
            interests: ["Technology", "Development"],
          },
          {
            id: 5,
            name: "Lisa Brown",
            role: "Member",
            email: "lisa@example.com",
            joined: "Jan 2024",
            status: "Active",
            interests: ["Design", "Innovation"],
          },
        ])
      );
    }
  }, [dispatch, members.length]);

  useEffect(() => {
    if (events.length === 0) {
      dispatch(
        setEvents([
          {
            id: 1,
            title: "Annual Tech Summit",
            date: "Nov 28, 2024",
            attendees: 120,
            status: "Upcoming",
          },
          {
            id: 2,
            title: "AI Workshop Series",
            date: "Dec 5, 2024",
            attendees: 45,
            status: "Upcoming",
          },
          {
            id: 3,
            title: "Hackathon 2024",
            date: "Oct 15, 2024",
            attendees: 80,
            status: "Completed",
          },
        ])
      );
    }
  }, [dispatch, events.length]);

  if (!societyData) {
    return (
      <div className="min-h-screen bg-[#111714] text-white flex items-center justify-center">
        <div className="text-[#9eb7a9]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111714] text-white">
      {/* Header */}
      <SocietyPageHeader
        title={societyData.name}
        subtitle="Society Management"
        icon={<span className="text-4xl">{societyData.logo}</span>}
        backPath="/society/dashboard"
        action={
          <>
            <button
              onClick={() => navigate(`/society/edit/${societyData.id || 1}`)}
              className="px-4 py-2 rounded-lg bg-[#29382f] text-white text-sm font-medium hover:bg-[#29382f]/80 transition-colors"
            >
              Edit Society
            </button>
            <button className="px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-bold hover:bg-[#1dc964]/90 transition-colors">
              Add Event
            </button>
          </>
        }
      />

      {/* Tabs */}
      <SocietyTabs
        tabs={["overview", "members", "events", "announcements", "analytics"]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#9eb7a9] text-sm">Total Members</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {societyData.members}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                    group
                  </span>
                </div>
              </div>
              <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#9eb7a9] text-sm">Total Events</p>
                    <p className="text-3xl font-bold text-white mt-2">
                      {societyData.events}
                    </p>
                  </div>
                  <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                    event
                  </span>
                </div>
              </div>
              <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#9eb7a9] text-sm">Pending Requests</p>
                    <p className="text-3xl font-bold text-white mt-2">3</p>
                  </div>
                  <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                    person_add
                  </span>
                </div>
              </div>
              <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#9eb7a9] text-sm">Upcoming Events</p>
                    <p className="text-3xl font-bold text-white mt-2">2</p>
                  </div>
                  <span className="material-symbols-outlined text-[#1dc964] text-4xl">
                    upcoming
                  </span>
                </div>
              </div>
            </div>

            {/* Society Details */}
            <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Society Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-[#9eb7a9] text-sm mb-1">Description</p>
                  <p className="text-white">{societyData.description}</p>
                </div>
                <div>
                  <p className="text-[#9eb7a9] text-sm mb-1">Category</p>
                  <p className="text-white">{societyData.category}</p>
                </div>
                <div>
                  <p className="text-[#9eb7a9] text-sm mb-1">Founded</p>
                  <p className="text-white">{societyData.founded}</p>
                </div>
                <div>
                  <p className="text-[#9eb7a9] text-sm mb-1">Status</p>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#1dc964]/20 text-[#1dc964]">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Members ({members.length})</h2>
              <button className="px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-bold hover:bg-[#1dc964]/90">
                Add Member
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#29382f]">
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Role
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Email
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Joined
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-[#9eb7a9] text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr
                      key={member.id}
                      className="border-b border-[#29382f] hover:bg-white/5"
                    >
                      <td className="py-3 px-4 text-white">{member.name}</td>
                      <td className="py-3 px-4 text-[#9eb7a9]">
                        {member.role}
                      </td>
                      <td className="py-3 px-4 text-[#9eb7a9]">
                        {member.email}
                      </td>
                      <td className="py-3 px-4 text-[#9eb7a9]">
                        {member.joined}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#1dc964]/20 text-[#1dc964]">
                          {member.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-[#9eb7a9] hover:text-white">
                          <span className="material-symbols-outlined text-lg">
                            more_vert
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Society Events</h2>
              <button className="px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-bold hover:bg-[#1dc964]/90">
                Create Event
              </button>
            </div>
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 bg-[#111714] rounded-lg border border-[#29382f]"
                >
                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-[#9eb7a9]">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          calendar_today
                        </span>
                        {event.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">
                          group
                        </span>
                        {event.attendees} attendees
                      </span>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      event.status === "Upcoming"
                        ? "bg-[#1dc964]/20 text-[#1dc964]"
                        : "bg-[#9eb7a9]/20 text-[#9eb7a9]"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Announcements Tab */}
        {activeTab === "announcements" && (
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Announcements</h2>
              <button className="px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-bold hover:bg-[#1dc964]/90">
                New Announcement
              </button>
            </div>
            <div className="space-y-4">
              {ANNOUNCEMENTS.map((announcement) => (
                <div
                  key={announcement.id}
                  className="p-4 bg-[#111714] rounded-lg border border-[#29382f]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-white font-semibold">
                      {announcement.title}
                    </h3>
                    <span className="text-sm text-[#9eb7a9]">
                      {announcement.date}
                    </span>
                  </div>
                  <p className="text-[#9eb7a9]">{announcement.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Growth Analytics</h2>
              <div className="text-center py-12 text-[#9eb7a9]">
                <span className="material-symbols-outlined text-6xl mb-4">
                  analytics
                </span>
                <p>Analytics charts and graphs will be displayed here</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
