import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAllEvents, fetchEvents, selectEventLoading, selectEventPagination } from "../redux/slices/eventSlice";
import SectionHeader from "../components/common/SectionHeader";
import EventCard from "../components/common/EventCard";
import CircularProgress from "../components/common/CircularProgress";
import { useDebounce } from "../hooks/useDebounce";
import { Search, ChevronLeft, ChevronRight, CalendarOff } from "lucide-react";

export default function Events() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const events = useSelector(selectAllEvents);
  const loading = useSelector(selectEventLoading);
  const pagination = useSelector(selectEventPagination);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    dispatch(fetchEvents({ page, limit: 12, q: debouncedSearchTerm }));
  }, [dispatch, page, debouncedSearchTerm]);

  // Reset page to 1 when search term changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

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
      <div className="max-w-[1200px] mx-auto">
        {/* Header & Search */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex-1">
            <SectionHeader
              title="Campus Events"
              subtitle="Discover and join exciting events happening on campus. From tech talks to social gatherings, find what interests you."
              align="left"
            />
          </div>
          
          <div className="w-full md:w-80 lg:w-96">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-[#8b949e] group-focus-within:text-[#58a6ff] transition-colors" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-3 border border-[#30363d] rounded-xl leading-5 bg-[#161b22] text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:ring-2 focus:ring-[#58a6ff] focus:border-[#58a6ff] transition-all duration-300 shadow-sm"
                placeholder="Search events by title, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading && events.length === 0 ? (
          <div className="flex justify-center items-center py-32">
            <CircularProgress />
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {events.length > 0 ? (
                events.map((event) => (
                  <div 
                    key={event._id || event.id} 
                    onClick={() => navigate(`/events/${event._id || event.id}`)} 
                    className="cursor-pointer h-full"
                  >
                    <EventCard
                      title={event.title}
                      date={formatDate(event.startAt)}
                      time={formatTime(event.startAt)}
                      location={event.venue?.address || event.venue?.type || "TBA"}
                      description={event.description || "No description provided."}
                      attendees={event.registrationCount || 0}
                      coverImage={event.coverImage}
                      onRegister={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event._id || event.id}`);
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-full flex flex-col items-center justify-center py-24 bg-[#161b22] rounded-2xl border border-[#30363d]">
                  <div className="p-4 bg-[#0d1117] rounded-full mb-4">
                    <CalendarOff className="w-12 h-12 text-[#8b949e] opacity-80" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#e6edf3] mb-2">No events found</h3>
                  <p className="text-[#8b949e] text-center max-w-md">
                    {searchTerm 
                      ? `We couldn't find any events matching "${searchTerm}". Try adjusting your search.` 
                      : "There are no upcoming events at the moment. Check back later!"}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center space-x-4 mt-8 pb-10">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-2.5 rounded-lg bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className="text-[#8b949e] font-medium text-sm">
                    Page <span className="text-[#e6edf3] px-1">{page}</span> of <span className="text-[#e6edf3] px-1">{pagination.pages}</span>
                  </span>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages || loading}
                  className="p-2.5 rounded-lg bg-[#21262d] text-[#c9d1d9] border border-[#30363d] hover:bg-[#30363d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
