import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllEvents,
  setEvents,
} from "../../redux/slices/eventSlice";
import SocietyPageHeader from "../../components/societies/SocietyPageHeader";

export default function SocietyEvents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [filter, setFilter] = useState("all");
  const events = useSelector(selectAllEvents);

  useEffect(() => {
    if (events.length === 0) {
      dispatch(
        setEvents([
          {
            id: 1,
            title: "Annual Tech Summit 2024",
            society: "Tech Innovators Club",
            date: "November 28, 2024",
            time: "10:00 AM - 4:00 PM",
            location: "Main Auditorium",
            attendees: 120,
            capacity: 200,
            status: "Upcoming",
            description:
              "Join us for a full day of technology talks, workshops, and networking opportunities.",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuD9RA_fMuSaLKstjcMP5ozR-vSaxtqQ_kzINRu0QEbitLaiaOGSvhHQ0t3zi1Py769dste1tAWujcMGzeKsHP3LIDU8GpBrAtxlzAEKMTgoN2PCuAMYnxMVStac_6sgv9hNluDqsTZg4B7sFD-1sE6Uqn7KpdMC_eKzapyTUfan20XYGE2tBdjBB1D9B7MnCMh1-NNhn67QqbuDD5OKhys_-_9nTeollnRzd23QBgopcA4rmFIaSDdXU_42pp-765L5mTwpjWlySM8",
          },
          {
            id: 2,
            title: "Startup Pitch Night",
            society: "Entrepreneurs of Tomorrow",
            date: "December 2, 2024",
            time: "7:00 PM - 9:30 PM",
            location: "Innovation Lab",
            attendees: 45,
            capacity: 80,
            status: "Upcoming",
            description:
              "Watch student entrepreneurs pitch their startup ideas to industry experts and investors.",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuD3-_oIn91suwJp2Y7wxBTs3ZPaq72Kd3QtdHOL6EAqtQ0n6pEncU7_La8js5jGDp5Kdnq6kTZFIlzvBwNVVXL5B8iD9ywnZP35iPGjqP-dyZRon4S-2U8RENBHlJUtbWJIHeZQJOH_qCScqBVJG5Ri7fhSA5tI5wwhJ4JT1kRXW3-4TlUwqiyRTBJIKwu8tDxKOBltGDVxpO6MiMUlxREPa1y6MTdQbrVx5MJtWEMJiNqfhjjzGPSRGTe4ThsX54Y986W9h7baUy0",
          },
          {
            id: 3,
            title: "The Art of Persuasion Workshop",
            society: "Debate Society",
            date: "December 5, 2024",
            time: "2:00 PM - 3:30 PM",
            location: "Room 204",
            attendees: 30,
            capacity: 40,
            status: "Upcoming",
            description:
              "Learn advanced debate techniques and persuasive speaking skills from expert coaches.",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDoQNTWTBvvjCWzGT4LSr1h0qdUOa09wVzKeBx1TX53dyRxgmKHYTDS1TN_XJ-VLe34SDS9ynUpvRNZSRm9Ye3nIOTGeARiF7VoBHRUOoJngE52BBV8TselfYt8GNnQI7A7KevlQzgglbGZlfLMMrKCIFTH_dcWm8clNTFCXKbZchH9FtsE5gMqjY5bl9q-XSz00KbL43PLMbTkQKskFEdjkkYVQLBXyt7kcQRB0O_KhbQDbbDkd0EZRslHm881dAppEobIhYUK95E",
          },
          {
            id: 4,
            title: "Hackathon 2024",
            society: "Tech Innovators Club",
            date: "October 15, 2024",
            time: "9:00 AM - 9:00 PM",
            location: "Computer Science Building",
            attendees: 80,
            capacity: 100,
            status: "Completed",
            description:
              "24-hour coding marathon where teams built innovative software solutions.",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuDAw7PEHr5CfYENft29JzW_oh8UNy32igeFcIciwY4SLganFizb8gE_yaxTVMUXknXfbbs2veZ4hzrA5Bs6a1Amq2ATMtYS80ZqCfzGd9qYy9u34e2BhMiLfD5hiXIkVwi6DhktH82Ew4leVgs1NDu1MCD6_6Er0SpmlF-WFut93bD157Ns9za1uJCd0Q0dMJoYX8vfND6G0ekTtV3V1Ff_HoP50ErEPHX7P00DVl6K2njjP26CKL39vwnOHDDERwHbVFUbwVixkXY",
          },
          {
            id: 5,
            title: "Photography Exhibition Opening",
            society: "Photography Club",
            date: "September 20, 2024",
            time: "6:00 PM - 8:00 PM",
            location: "Art Gallery",
            attendees: 95,
            capacity: 120,
            status: "Completed",
            description:
              "Showcase of student photography featuring winners of the annual photo contest.",
            image:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBUb85ANOhOOBeBqSWd-wOjgFd2X0JCzolY-1hBJfJLPjgh0RfRot_aA7obi-3MbWJEWkp-4EOoKaQsxsXaQF0pQ9_q_NaYN4s8cQJ4w2_2cSVD2afeq_WLhwcjHdqA2L-hS7UiUQHqGRXQZ8e8Sm4KhRJ2_iwsPPiMvNwiHZ_JYeAdQdFb2EItrr5p2Qq1QGaRbiLF5b1_EN7VGa92MVgICDZ6Bl4CG_zB56DJg_8QU-44tuOXEc9QEJPAmSZPLZFMMJYsIDE-has",
          },
        ])
      );
    }
  }, [dispatch, events.length]);

  const filteredEvents = useMemo(
    () =>
      events.filter((event) => {
        if (filter === "all") return true;
        if (filter === "upcoming") return event.status === "Upcoming";
        if (filter === "completed") return event.status === "Completed";
        return true;
      }),
    [events, filter]
  );

  return (
    <div className="min-h-screen bg-[#111714] text-white">
      {/* Header */}
      <SocietyPageHeader
        title="Society Events"
        subtitle="Manage and organize your events"
        icon="event"
        backPath="/society/dashboard"
        action={
          <button
            onClick={() => navigate("/society/create-event")}
            className="px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-bold hover:bg-[#1dc964]/90 transition-colors flex items-center gap-2"
          >
            <span className="material-symbols-outlined">add</span>
            Create Event
          </button>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "all"
                  ? "bg-[#1dc964] text-[#111714]"
                  : "bg-[#1a241e] text-[#9eb7a9] hover:bg-[#1a241e]/80 hover:text-white"
              }`}
            >
              All Events ({events.length})
            </button>
            <button
              onClick={() => setFilter("upcoming")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "upcoming"
                  ? "bg-[#1dc964] text-[#111714]"
                  : "bg-[#1a241e] text-[#9eb7a9] hover:bg-[#1a241e]/80 hover:text-white"
              }`}
            >
              Upcoming ({events.filter((e) => e.status === "Upcoming").length})
            </button>
            <button
              onClick={() => setFilter("completed")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === "completed"
                  ? "bg-[#1dc964] text-[#111714]"
                  : "bg-[#1a241e] text-[#9eb7a9] hover:bg-[#1a241e]/80 hover:text-white"
              }`}
            >
              Completed ({events.filter((e) => e.status === "Completed").length}
              )
            </button>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-12 text-center">
            <span className="material-symbols-outlined text-6xl text-[#29382f] block mb-4">
              event
            </span>
            <h3 className="text-xl font-semibold text-white mb-2">
              No events found
            </h3>
            <p className="text-[#9eb7a9]">
              Create your first event to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-[#1a241e] border border-[#29382f] rounded-lg overflow-hidden hover:border-[#1dc964]/50 transition-colors"
              >
                <div
                  className="h-48 bg-cover bg-center"
                  style={{ backgroundImage: `url("${event.image}")` }}
                />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === "Upcoming"
                          ? "bg-[#1dc964]/20 text-[#1dc964]"
                          : "bg-[#9eb7a9]/20 text-[#9eb7a9]"
                      }`}
                    >
                      {event.status}
                    </span>
                    <span className="text-[#9eb7a9] text-xs">
                      {event.society}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">
                    {event.title}
                  </h3>
                  <p className="text-[#9eb7a9] text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-[#9eb7a9]">
                      <span className="material-symbols-outlined text-sm">
                        calendar_today
                      </span>
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#9eb7a9]">
                      <span className="material-symbols-outlined text-sm">
                        schedule
                      </span>
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#9eb7a9]">
                      <span className="material-symbols-outlined text-sm">
                        location_on
                      </span>
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[#9eb7a9]">
                      <span className="material-symbols-outlined text-sm">
                        group
                      </span>
                      <span>
                        {event.attendees}/{event.capacity} attendees
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 rounded-lg bg-[#1dc964] text-[#111714] text-sm font-medium hover:bg-[#1dc964]/90 transition-colors">
                      Manage
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-[#29382f] text-white text-sm font-medium hover:bg-[#29382f]/80 transition-colors">
                      <span className="material-symbols-outlined">
                        more_vert
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#1dc964]">
              {events.length}
            </div>
            <div className="text-sm text-[#9eb7a9] mt-1">Total Events</div>
          </div>
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#1dc964]">
              {events.filter((e) => e.status === "Upcoming").length}
            </div>
            <div className="text-sm text-[#9eb7a9] mt-1">Upcoming</div>
          </div>
          <div className="bg-[#1a241e] border border-[#29382f] rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-[#1dc964]">
              {events.reduce((sum, e) => sum + e.attendees, 0)}
            </div>
            <div className="text-sm text-[#9eb7a9] mt-1">Total Attendees</div>
          </div>
        </div>
      </main>
    </div>
  );
}
