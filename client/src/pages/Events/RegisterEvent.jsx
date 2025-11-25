import React from "react";
import { useParams } from "react-router-dom";
import SocietySidebar from "../../components/layout/Sidebar";

// --- Chess Club Events Widget ---
function ChessClubEvents({ eventType }) {
  // Example events based on type
  const eventsMap = {
    chessclub: [
      {
        name: "Annual Chess Tournament",
        date: "Oct 26, 2024 - 10:00 AM",
        badge: 42,
      },
      {
        name: "Weekly Casual Play",
        date: "Nov 01, 2024 - 06:00 PM",
        badge: 15,
        highlight: true,
      },
      {
        name: "Beginner's Workshop",
        date: "Nov 10, 2024 - 03:00 PM",
        badge: 28,
      },
    ],
    debateteam: [
      {
        name: "Inter-College Debate",
        date: "Nov 05, 2024 - 02:00 PM",
        badge: 30,
      },
      {
        name: "Weekly Practice",
        date: "Nov 07, 2024 - 05:00 PM",
        badge: 12,
        highlight: true,
      },
    ],
  };

  const events = eventsMap[eventType] || [];

  return (
    <div className="w-1/3 bg-[#0d1117] rounded-xl p-6 flex flex-col gap-6 shadow-lg border border-[#21262d]">
      <h2 className="text-xl font-semibold text-white">
        {eventType
          ? `${eventType.replace(/^\w/, (c) => c.toUpperCase())} Events`
          : "Events"}
      </h2>
      <div className="relative">
        <input
          className="w-full bg-[#161b22] text-[#c9d1d9] border border-[#30363d] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#238636] transition-colors"
          placeholder="Search events..."
          type="text"
        />
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">
          search
        </span>
      </div>
      <div className="flex-grow overflow-y-auto">
        {events.map((event) => (
          <div
            key={event.name}
            className={`group flex items-center gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
              event.highlight
                ? "bg-[#238636]/30 border-[#238636]"
                : "bg-[#161b22] border-[#30363d] hover:bg-[#21262d]"
            }`}
          >
            <span
              className={`material-symbols-outlined text-lg ${
                event.highlight
                  ? "text-white"
                  : "text-[#8b949e] group-hover:text-white"
              }`}
            >
              event
            </span>
            <div className="flex flex-col flex-grow">
              <span className="text-sm font-medium text-white">
                {event.name}
              </span>
              <span
                className={`text-xs ${
                  event.highlight ? "text-primary" : "text-[#8b949e]"
                }`}
              >
                {event.date}
              </span>
            </div>
            <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-semibold text-white bg-[#238636] rounded-full">
              {event.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Attendees Table Widget ---
function AttendeesTable({ eventType }) {
  // Example attendees
  const attendeesMap = {
    chessclub: [
      {
        name: "Alice Johnson",
        email: "alice.j@campus.com",
        id: "2022001",
        date: "Oct 30, 2024",
      },
      {
        name: "Bob Williams",
        email: "bob.w@campus.com",
        id: "2022002",
        date: "Oct 30, 2024",
      },
    ],
    debateteam: [
      {
        name: "Charlie Brown",
        email: "charlie.b@campus.com",
        id: "2022003",
        date: "Oct 31, 2024",
      },
      {
        name: "Diana Prince",
        email: "diana.p@campus.com",
        id: "2022004",
        date: "Nov 01, 2024",
      },
    ],
  };

  const attendees = attendeesMap[eventType] || [];

  return (
    <div className="flex-1 bg-[#0d1117] rounded-xl p-6 flex flex-col gap-6 shadow-lg border border-[#21262d]">
      <h2 className="text-xl font-semibold text-white">
        Attendees for:{" "}
        {eventType ? eventType.replace(/^\w/, (c) => c.toUpperCase()) : "Event"}
      </h2>
      <div className="flex items-center gap-4">
        <div className="relative flex-grow">
          <input
            className="w-full bg-[#161b22] text-[#c9d1d9] border border-[#30363d] rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:border-[#238636] transition-colors"
            placeholder="Filter attendees..."
            type="text"
          />
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e]">
            filter_alt
          </span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#238636]/80 transition-colors text-sm font-medium">
          <span className="material-symbols-outlined text-base">download</span>
          Export
        </button>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#238636]/80 transition-colors text-sm font-medium">
          <span className="material-symbols-outlined text-base">add</span>Add
          Attendee
        </button>
      </div>
      <div className="flex-grow overflow-y-auto">
        <table className="w-full text-left table-auto">
          <thead>
            <tr className="bg-[#161b22] text-[#8b949e] text-xs uppercase tracking-wider">
              <th className="px-4 py-3 rounded-tl-lg">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Registration Date</th>
              <th className="px-4 py-3 rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#21262d]">
            {attendees.map((a) => (
              <tr
                key={a.id}
                className="hover:bg-[#161b22]/50 transition-colors"
              >
                <td className="px-4 py-4 text-sm font-medium text-white">
                  {a.name}
                </td>
                <td className="px-4 py-4 text-sm text-[#c9d1d9]">{a.email}</td>
                <td className="px-4 py-4 text-sm text-[#c9d1d9]">{a.id}</td>
                <td className="px-4 py-4 text-sm text-[#c9d1d9]">{a.date}</td>
                <td className="px-4 py-4 text-sm text-[#8b949e] flex gap-2">
                  <button className="text-[#8b949e] hover:text-white material-symbols-outlined text-lg">
                    edit
                  </button>
                  <button className="text-[#8b949e] hover:text-red-500 material-symbols-outlined text-lg">
                    delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Main Page Layout ---
export default function RegisterEvent() {
  const { eventType } = useParams(); // from route /events/:eventType

  return (
    <div className="bg-background-light bg-black font-display flex h-240">
      <SocietySidebar />
      <main className="flex-1 p-8">
        <div className="w-full h-full flex gap-6">
          <ChessClubEvents eventType={eventType} />
          <AttendeesTable eventType={eventType} />
        </div>
      </main>
    </div>
  );
}
