import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectAllEvents, setEvents } from "../../redux/slices/eventSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import useHomeTheme from "@/hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export default function MentorEvents() {
  const dispatch = useDispatch();
  const events = useSelector(selectAllEvents);
  const isDark = useHomeTheme();

  useEffect(() => {
    if (events.length === 0) {
      dispatch(
        setEvents([
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
        ])
      );
    }
  }, [dispatch, events.length]);

  const pageClass = isDark ? "bg-[#112118] text-[#c9d1d9]" : "bg-slate-50 text-slate-900";
  const cardClass = isDark
    ? "bg-[#161b22] border-[#30363d]"
    : "bg-white border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]";
  const mutedText = isDark ? "text-[#9eb7a9]" : "text-slate-500";

  return (
    <div className={`relative flex h-auto min-h-screen w-full flex-col font-display group/design-root overflow-x-hidden ${pageClass}`}>
      <div className="layout-container flex h-full grow flex-col">
        <MentorTopBar backPath="/mentor/dashboard" />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            <div className="mb-8">
              <h1 className={`text-4xl font-black leading-tight tracking-[-0.033em] mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                My Events
              </h1>
              <p className={`text-base font-normal leading-normal ${mutedText}`}>
                Manage your mentoring workshops and events
              </p>
            </div>

            <div className="mb-8">
              <button className={getButtonClassName({
                variant: "primary",
                size: "lg",
                isDark,
              })}>
                <span className="material-symbols-outlined">add</span>
                Create New Event
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className={`flex flex-col border rounded-xl overflow-hidden transition-colors ${cardClass} ${isDark ? "hover:border-[#1dc964]" : "hover:border-emerald-400"}`}
                >
                  <img src={event.image} alt={event.title} className="w-full h-40 object-cover" />
                  <div className="flex flex-col gap-3 p-5 flex-1">
                    <div className="flex items-start justify-between">
                      <h3 className={`font-semibold text-lg flex-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                        {event.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-2 ${
                          event.status === "Upcoming"
                            ? "bg-[#1dc964]/20 text-[#1dc964]"
                            : isDark
                              ? "bg-[#9eb7a9]/20 text-[#9eb7a9]"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>

                    <div className={`flex items-center gap-2 text-sm ${mutedText}`}>
                      <span className="material-symbols-outlined text-base">calendar_today</span>
                      {event.date}
                    </div>

                    <div className={`flex items-center gap-2 text-sm ${mutedText}`}>
                      <span className="material-symbols-outlined text-base">schedule</span>
                      {event.time}
                    </div>

                    <div className={`flex items-center gap-2 text-sm ${mutedText}`}>
                      <span className="material-symbols-outlined text-base">location_on</span>
                      {event.location}
                    </div>

                    <div className={`flex items-center gap-2 text-sm mt-1 ${mutedText}`}>
                      <span className="material-symbols-outlined text-base">people</span>
                      {event.attendees} attendees
                    </div>

                    <button className={getButtonClassName({
                      variant: "primary",
                      size: "md",
                      isDark,
                      className: "mt-4 w-full",
                    })}>
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
