import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { fetchEventById, selectSelectedEvent, selectEventLoading, selectEventError } from "../../redux/slices/eventSlice";
import CircularProgress from "../../components/common/CircularProgress";
import CTACard from "../../components/common/CTACard";
import SectionHeader from "../../components/common/SectionHeader";
import { selectUser } from "../../redux/slices/authSlice";

export default function EventDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const event = useSelector(selectSelectedEvent);
  const loading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  const handleRegister = () => {
    // Navigate to register flow, or dispatch join team / enroll directly depending on participation
    navigate(`/events/${id}/register`);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleString(undefined, {
      year: "numeric", month: "long", day: "numeric", 
      hour: "2-digit", minute: "2-digit"
    });
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen bg-[#0d1117]"><CircularProgress /></div>;
  }

  if (error || !event) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0d1117] text-[#8b949e]">
        Event not found.
      </div>
    );
  }

  const isCreator = user?._id === event.createdBy?._id || user?.id === event.createdBy;

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Cover Image Wrapper */}
      <div className="w-full h-64 md:h-96 relative bg-[#161b22]">
        {event.coverImage ? (
          <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="w-full h-full flex justify-center items-center">
            <span className="material-symbols-outlined text-8xl text-[#30363d]">event</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-full p-8 md:px-20 lg:px-40">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <span className="px-3 py-1 bg-[#1dc964]/20 text-[#1dc964] rounded-full text-xs font-semibold uppercase tracking-wider mb-3 inline-block">
                {event.category}
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-white">{event.title}</h1>
            </div>
            {isCreator && (
              <button 
                onClick={() => navigate(`/events/${id}/edit`)}
                className="bg-[#21262d] text-white px-4 py-2 rounded-lg border border-[#30363d] hover:bg-[#30363d] transition-colors"
              >
                Edit Event
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Details */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <SectionHeader title="About Event" align="left" />
            <p className="text-[#8b949e] whitespace-pre-wrap mt-4 leading-relaxed">
              {event.description}
            </p>
          </section>

          <section>
            <h3 className="text-xl font-bold mb-4">Event Details</h3>
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 space-y-4">
              
              <div className="flex flex-col gap-1 border-b border-[#30363d] pb-4">
                <span className="text-[#8b949e] text-sm font-medium">Starts</span>
                <span className="text-white">{formatDate(event.startAt)}</span>
              </div>
              
              <div className="flex flex-col gap-1 border-b border-[#30363d] pb-4">
                <span className="text-[#8b949e] text-sm font-medium">Ends</span>
                <span className="text-white">{formatDate(event.endAt)}</span>
              </div>
              
              <div className="flex flex-col gap-1 border-b border-[#30363d] pb-4">
                <span className="text-[#8b949e] text-sm font-medium">Venue ({event.venue?.type})</span>
                {event.venue?.type === 'online' && <span className="text-white break-all">{event.venue?.onlineUrl}</span>}
                {event.venue?.type !== 'online' && <span className="text-white">{event.venue?.address}</span>}
              </div>

              <div className="flex flex-col gap-1 pt-2">
                <span className="text-[#8b949e] text-sm font-medium">Status</span>
                <span className="text-white capitalize">{event.status} ({event.registrationCount} / {event.maxCapacity || '∞'} registered)</span>
              </div>
              
            </div>
          </section>
        </div>

        {/* Right Col: Registration Card */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <CTACard
              title={event.registrationOpen ? "Registration Open" : "Registration Closed"}
              description={event.registrationOpen 
                ? "Don't miss out! Secure your spot before capacity fills up." 
                : "Registration is currently unavailable for this event."}
              buttonText="Register Now"
              buttonAction={handleRegister}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
