import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllEvents, setEvents } from "../../redux/slices/eventSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function MentorEvents() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const events = useSelector(selectAllEvents);

  useEffect(() => {
    if (events.length === 0) {
      dispatch(setEvents([
        {
          id: 1,
          title: "React Advanced Patterns Workshop",
          date: "2024-02-20",
          time: "10:00 AM - 12:00 PM",
          location: "Online",
          attendees: 25,
          status: "Upcoming",
          image:
            "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&h=300&fit=crop",
        },
        {
          id: 2,
          title: "JavaScript Fundamentals Series",
          date: "2024-02-18",
          time: "2:00 PM - 4:00 PM",
          location: "Virtual Classroom",
          attendees: 45,
          status: "Upcoming",
          image:
            "https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=400&h=300&fit=crop",
        },
        {
          id: 3,
          title: "Web Development Q&A Session",
          date: "2024-02-15",
          time: "3:00 PM - 4:00 PM",
          location: "Online",
          attendees: 32,
          status: "Completed",
          image:
            "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop",
        },
      ]));
    }
  }, [dispatch, events.length]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                My Events
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                Manage your mentoring workshops and events
              </p>
            </div>

            {/* Create Event Button */}
            <div className="mb-8">
              <button className="flex items-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity">
                <span className="material-symbols-outlined">add</span>
                Create New Event
              </button>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex flex-col bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden hover:border-[#1dc964] transition-colors"
                >
                  <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className="text-white font-semibold text-lg flex-1">
                        {event.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          event.status === "Upcoming"
                            ? "bg-[#1dc964]/20 text-[#1dc964]"
                            : "bg-[#9eb7a9]/20 text-[#9eb7a9]"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[#9eb7a9] text-sm">
                      <span className="material-symbols-outlined text-base">
                        calendar_today
                      </span>
                      {event.date}
                    </div>

                    <div className="flex items-center gap-2 text-[#9eb7a9] text-sm">
                      <span className="material-symbols-outlined text-base">
                        schedule
                      </span>
                      {event.time}
                    </div>

                    <div className="flex items-center gap-2 text-[#9eb7a9] text-sm">
                      <span className="material-symbols-outlined text-base">
                        location_on
                      </span>
                      {event.location}
                    </div>

                    <div className="flex items-center gap-2 text-[#9eb7a9] text-sm mt-1">
                      <span className="material-symbols-outlined text-base">
                        people
                      </span>
                      {event.attendees} attendees
                    </div>

                    <button className="mt-4 w-full px-4 py-2 bg-[#1dc964] text-[#112118] font-bold rounded hover:opacity-90 transition-opacity">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
