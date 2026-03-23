import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllEvents, setEvents } from "../redux/slices/eventSlice";
import SectionHeader from "../components/common/SectionHeader";
import EventCard from "../components/common/EventCard";
import CTACard from "../components/common/CTACard";

export default function Events() {
  const dispatch = useDispatch();
  const events = useSelector(selectAllEvents);

  // Initialize mock events data in Redux
  useEffect(() => {
    if (events.length === 0) {
      dispatch(setEvents([
        {
          id: 1,
          title: "Tech Summit 2024",
          date: "March 15, 2024",
          time: "10:00 AM - 5:00 PM",
          location: "Main Auditorium",
          description:
            "Join us for a day-long summit featuring tech talks, workshops, and networking opportunities.",
          attendees: 342,
        },
        {
          id: 2,
          title: "AI & Machine Learning Workshop",
          date: "March 20, 2024",
          time: "2:00 PM - 4:00 PM",
          location: "Room 301",
          description:
            "Hands-on workshop on implementing ML algorithms with Python.",
          attendees: 85,
        },
        {
          id: 3,
          title: "Career Fair 2024",
          date: "March 28, 2024",
          time: "1:00 PM - 6:00 PM",
          location: "Student Center",
          description:
            "Connect with top companies and explore career opportunities.",
          attendees: 520,
        },
        {
          id: 4,
          title: "Web Development Bootcamp",
          date: "April 5, 2024",
          time: "9:00 AM - 1:00 PM",
          location: "Lab Building",
          description:
            "Learn modern web development with React, Node.js, and more.",
          attendees: 156,
        },
        {
          id: 5,
          title: "Leadership Summit",
          date: "April 12, 2024",
          time: "10:00 AM - 3:00 PM",
          location: "Ballroom",
          description:
            "Develop leadership skills and connect with student leaders.",
          attendees: 203,
        },
        {
          id: 6,
          title: "Startup Pitch Night",
          date: "April 19, 2024",
          time: "6:00 PM - 8:00 PM",
          location: "Innovation Hub",
          description: "Watch students pitch their startup ideas to investors.",
          attendees: 127,
        },
      ]));
    }
  }, [dispatch, events.length]);

  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="mb-10">
          <SectionHeader
            title="Campus Events"
            subtitle="Discover and join exciting events happening on campus. From tech talks to social gatherings, find what interests you."
            align="left"
          />
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              title={event.title}
              date={event.date}
              time={event.time}
              location={event.location}
              description={event.description}
              attendees={event.attendees}
            />
          ))}
        </div>

        {/* CTA Section */}
        <CTACard
          title="Create an Event"
          description="Are you a society or organizer? Create an event on CampusConnect."
          buttonText="Create Event"
        />
      </div>
    </div>
  );
}
