import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAllEvents, fetchEvents, selectEventLoading } from "../redux/slices/eventSlice";
import SectionHeader from "../components/common/SectionHeader";
import EventCard from "../components/common/EventCard";
import CTACard from "../components/common/CTACard";
import CircularProgress from "../components/common/CircularProgress";

export default function Events() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const events = useSelector(selectAllEvents);
  const loading = useSelector(selectEventLoading);

  useEffect(() => {
    dispatch(fetchEvents());
  }, [dispatch]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <CircularProgress />
          </div>
        ) : (
          /* Events Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            {events.length > 0 ? (
              events.map((event) => (
                <div key={event._id || event.id} onClick={() => navigate(`/events/${event._id || event.id}`)} className="cursor-pointer">
                  <EventCard
                    title={event.title}
                    date={formatDate(event.startAt)}
                    time={formatTime(event.startAt)}
                    location={event.venue?.address || event.venue?.type || "TBA"}
                    description={event.description?.substring(0, 100) + (event.description?.length > 100 ? "..." : "") || "No description provided."}
                    attendees={event.registrationCount || 0}
                    onRegister={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event._id || event.id}`);
                    }}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-[#8b949e] py-10">
                No upcoming events found. Be the first to create one!
              </div>
            )}
          </div>
        )}

        {/* CTA Section */}
        <div onClick={() => navigate("/society/create")} className="cursor-pointer">
          <CTACard
            title="Create an Event"
            description="Are you a society or organizer? Create an event on CampusConnect."
            buttonText="Create Event"
          />
        </div>
      </div>
    </div>
  );
}
