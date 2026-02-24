import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import AnalyticsWidget from "@/components/dashboard/AnalyticsWidget";
import SocietySummary from "@/components/dashboard/SocietySummary";
import {
  selectRegisteredSocieties,
  setRegisteredSocieties,
} from "@/redux/slices/societySlice";
import {
  selectUpcomingEvents,
  setUpcomingEvents,
} from "@/redux/slices/eventSlice";

export default function SocietyDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const societies = useSelector(selectRegisteredSocieties);
  const upcomingEvents = useSelector(selectUpcomingEvents);

  useEffect(() => {
    if (societies.length === 0) {
      dispatch(
        setRegisteredSocieties([
          { id: 1, name: "Tech Innovators Club", image: "🚀" },
          { id: 2, name: "Entrepreneurs of Tomorrow", image: "💼" },
          { id: 3, name: "Debate Society", image: "🎤" },
        ])
      );
    }
  }, [dispatch, societies.length]);

  useEffect(() => {
    if (upcomingEvents.length === 0) {
      dispatch(
        setUpcomingEvents([
          {
            id: 1,
            date: "28",
            month: "NOV",
            title: "Annual Tech Summit",
            society: "Tech Innovators Club",
            time: "10:00 AM - 4:00 PM",
          },
          {
            id: 2,
            date: "02",
            month: "DEC",
            title: "Startup Pitch Night",
            society: "Entrepreneurs of Tomorrow",
            time: "7:00 PM",
          },
          {
            id: 3,
            date: "05",
            month: "DEC",
            title: "The Art of Persuasion Workshop",
            society: "Debate Society",
            time: "2:00 PM - 3:30 PM",
          },
        ])
      );
    }
  }, [dispatch, upcomingEvents.length]);

  return (
    <div className="flex min-h-screen bg-[#111714]">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[#111714] border-r border-[#29382f] hidden lg:flex">
        <div className="flex h-full flex-col justify-between p-4">
          {/* Top Section */}
          <div className="flex flex-col gap-4">
            {/* Profile */}
            <button
              onClick={() => (window.location.href = "/society/profile")}
              className="flex gap-3 items-center hover:opacity-80 transition-opacity cursor-pointer"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                AC
              </div>
              <div className="flex flex-col text-left">
                <h1 className="text-white text-base font-medium leading-normal">
                  Alex Chen
                </h1>
                <p className="text-[#9eb7a9] text-sm font-normal leading-normal">
                  Society Head
                </p>
              </div>
            </button>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 mt-4">
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md bg-[#1a241e]"
                href="#"
              >
                <span className="material-symbols-outlined text-white">
                  dashboard
                </span>
                <p className="text-white text-sm font-medium leading-normal">
                  Dashboard
                </p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1a241e]/50 transition-colors"
                href="/societies"
              >
                <span className="material-symbols-outlined text-[#9eb7a9]">
                  groups
                </span>
                <p className="text-[#9eb7a9] text-sm font-medium leading-normal">
                  Societies
                </p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1a241e]/50 transition-colors"
                href="/society/events"
              >
                <span className="material-symbols-outlined text-[#9eb7a9]">
                  event
                </span>
                <p className="text-[#9eb7a9] text-sm font-medium leading-normal">
                  Events
                </p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1a241e]/50 transition-colors"
                href="/society/mentoring"
              >
                <span className="material-symbols-outlined text-[#9eb7a9]">
                  school
                </span>
                <p className="text-[#9eb7a9] text-sm font-medium leading-normal">
                  Mentoring
                </p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1a241e]/50 transition-colors"
                href="/society/networking"
              >
                <span className="material-symbols-outlined text-[#9eb7a9]">
                  lan
                </span>
                <p className="text-[#9eb7a9] text-sm font-medium leading-normal">
                  Networking
                </p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1a241e]/50 transition-colors"
                href="/society/analytics"
              >
                <span className="material-symbols-outlined text-[#9eb7a9]">
                  analytics
                </span>
                <p className="text-[#9eb7a9] text-sm font-medium leading-normal">
                  Analytics
                </p>
              </a>
            </nav>
          </div>

          {/* Bottom Section */}
          <div className="flex flex-col gap-2">
            <button
              onClick={() => (window.location.href = "/society/create")}
              className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[#1dc964] text-[#111714] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#1dc964]/90 transition-colors"
            >
              <span className="truncate">Create New</span>
            </button>
            <div className="flex flex-col gap-1 border-t border-[#29382f] pt-2 mt-2">
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1a241e]/50 transition-colors"
                href="/society/settings"
              >
                <span className="material-symbols-outlined text-[#9eb7a9]">
                  settings
                </span>
                <p className="text-[#9eb7a9] text-sm font-medium leading-normal">
                  Settings
                </p>
              </a>
              <a
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-[#1a241e]/50 transition-colors"
                href="/logout"
              >
                <span className="material-symbols-outlined text-[#9eb7a9]">
                  logout
                </span>
                <p className="text-[#9eb7a9] text-sm font-medium leading-normal">
                  Logout
                </p>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                Society HQ
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                Oversee your societies and campus impact
              </p>
            </div>
            <button
              onClick={() => (window.location.href = "/society/create")}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-md h-12 px-5 bg-[#1dc964] text-[#111714] gap-2 text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#1dc964]/90 transition-colors"
            >
              <span className="material-symbols-outlined text-[#111714]">
                add_circle
              </span>
              <span className="truncate">Create New Society</span>
            </button>
          </header>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* My Societies Section (2 columns) */}
            <SocietySummary
              title="My Societies"
              societies={societies}
              variant="list"
              onItemAction={() => (window.location.href = "/society/manage")}
            />

            {/* Approvals Needed Widget */}
            <section className="bg-[#1a241e] border border-[#29382f] rounded-lg p-6">
              <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4">
                Approvals Needed
              </h2>
              <div className="bg-[#1dc964]/20 border border-[#1dc964]/50 rounded-md p-4 flex flex-col items-start gap-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-[#1dc964]">
                    person_add
                  </span>
                  <p className="text-white">
                    You have <span className="font-bold">3</span> pending member
                    requests.
                  </p>
                </div>
                <button
                  onClick={() =>
                    (window.location.href = "/society/member-requests")
                  }
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-10 px-4 bg-[#1dc964] text-[#111714] text-sm font-bold leading-normal w-full hover:bg-[#1dc964]/90 transition-colors"
                >
                  <span className="truncate">Review Requests</span>
                </button>
              </div>
            </section>

            {/* Upcoming Events Section (2 columns) */}
            <section className="lg:col-span-2 bg-[#1a241e] border border-[#29382f] rounded-lg p-6 flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">
                  Upcoming Events
                </h2>
                <button
                  onClick={() => (window.location.href = "/society/events")}
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 bg-[#29382f] text-white gap-2 text-sm font-medium leading-normal hover:bg-[#29382f]/80 transition-colors"
                >
                  <span className="material-symbols-outlined">add</span>
                  <span className="truncate">Add Event</span>
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-start gap-4">
                    <div className="flex flex-col items-center justify-center bg-[#29382f] rounded-md p-2 w-14 text-center">
                      <span className="text-[#9eb7a9] text-xs font-bold uppercase">
                        {event.month}
                      </span>
                      <span className="text-white text-2xl font-black">
                        {event.date}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{event.title}</p>
                      <p className="text-sm text-[#9eb7a9]">
                        {event.society} • {event.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Society Analytics Widget */}
            <AnalyticsWidget
              title="Society Analytics"
              options={["All Societies", "Tech Club", "Entrepreneurs"]}
              statLabel="Total Members"
              statValue="1,284"
              trendLabel="+112 this month"
              onOpen={() => navigate("/society/analytics")}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
