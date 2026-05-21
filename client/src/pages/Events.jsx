import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { selectAllEvents, fetchEvents, selectEventLoading, selectEventPagination } from "../redux/slices/eventSlice";
import SectionHeader from "../components/common/SectionHeader";
import EventCard from "../components/common/EventCard";
import CircularProgress from "../components/common/CircularProgress";
import { useDebounce } from "../hooks/useDebounce";
import useHomeTheme from "../hooks/useHomeTheme";
import { Search, ChevronLeft, ChevronRight, CalendarOff } from "lucide-react";
import { useLanguage } from "../hooks/useLanguage";

export default function Events() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const events = useSelector(selectAllEvents);
  const loading = useSelector(selectEventLoading);
  const pagination = useSelector(selectEventPagination);
  const isDark = useHomeTheme();
  const { t, locale } = useLanguage();
  
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
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? 'bg-background-dark text-text-primary-dark' : 'bg-background-light text-text-primary-light'}`}>
      <div className="mx-auto max-w-[1200px] px-4 py-10 sm:px-10 md:px-20 lg:px-40">
        <section className={`relative mb-12 overflow-hidden rounded-[2rem] border px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 md:px-8 md:py-10 ${isDark ? 'border-border-dark bg-surface-dark' : 'border-border-light bg-surface-light'}`}>
          <div className="relative z-10 mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="flex-1">
              <span className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] transition-colors duration-300 ${isDark ? 'border-border-dark bg-background-dark text-info' : 'border-border-light bg-surface-light text-info'}`}>
                {t("events.badge")}
              </span>
              <SectionHeader
                title={t("events.title")}
                subtitle={t("events.subtitle")}
                align="left"
                isDark={isDark}
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { value: t("events.stats.live"), label: t("events.stats.weeklyDrops") },
                { value: "12+", label: t("events.stats.categories") },
                { value: t("events.stats.fast"), label: t("events.stats.registration") },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border px-4 py-4 text-center transition-all duration-300 ${isDark ? 'border-border-dark bg-background-dark' : 'border-border-light bg-background-light'}`}>
                  <p className={`text-lg font-extrabold transition-colors duration-300 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>{item.value}</p>
                  <p className={`mt-1 text-xs transition-colors duration-300 ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full md:w-80 lg:w-96">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className={`h-5 w-5 transition-colors ${isDark ? 'text-text-secondary-dark group-focus-within:text-info' : 'text-text-secondary-light group-focus-within:text-info'}`} />
              </div>
              <input
                type="text"
                className={`block w-full rounded-2xl border py-3 pl-12 pr-4 leading-5 focus:outline-none focus:ring-2 transition-all duration-300 ${isDark ? 'border-border-dark bg-surface-dark text-text-primary-dark placeholder-text-secondary-dark focus:ring-info focus:border-info' : 'border-border-light bg-surface-light text-text-primary-light placeholder-text-secondary-light shadow-[0_12px_32px_rgba(15,23,42,0.07)] focus:ring-info focus:border-info'}`}
                placeholder={t("events.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </section>

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
                      location={event.venue?.address || event.venue?.type || t("events.locationTba")}
                      description={event.description || t("events.noDescription")}
                      attendees={event.registrationCount || 0}
                      coverImage={event.coverImage}
                      isDark={isDark}
                      onRegister={(e) => {
                        e.stopPropagation();
                        navigate(`/events/${event._id || event.id}`);
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className={`col-span-full flex flex-col items-center justify-center rounded-[1.75rem] border py-24 transition-colors duration-300 ${isDark ? 'border-border-dark bg-surface-dark' : 'border-border-light bg-surface-light shadow-[0_18px_50px_rgba(15,23,42,0.08)]'}`}>
                  <div className={`mb-4 rounded-full p-4 transition-colors duration-300 ${isDark ? 'bg-background-dark' : 'bg-background-light'}`}>
                    <CalendarOff className={`h-12 w-12 opacity-80 transition-colors duration-300 ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`} />
                  </div>
                  <h3 className={`mb-2 text-xl font-semibold transition-colors duration-300 ${isDark ? 'text-text-primary-dark' : 'text-text-primary-light'}`}>{t("events.noEvents")}</h3>
                  <p className={`max-w-md text-center transition-colors duration-300 ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
                    {searchTerm 
                      ? t("events.noEventsSearch", { query: searchTerm }) 
                      : t("events.noEventsDefault")}
                  </p>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
              <div className={`mt-8 flex items-center justify-center space-x-4 rounded-[1.5rem] border px-5 py-4 pb-4 ${isDark ? 'border-border-dark bg-surface-dark' : 'border-border-light bg-surface-light shadow-[0_16px_40px_rgba(15,23,42,0.06)]'}`}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className={`rounded-xl border p-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isDark ? 'border-border-dark bg-background-dark text-text-primary-dark hover:bg-surface-muted-dark' : 'border-border-light bg-surface-light text-text-primary-light shadow-sm hover:bg-surface-muted-light'}`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-2">
                  <span className={`text-sm font-medium transition-colors duration-300 ${isDark ? 'text-text-secondary-dark' : 'text-text-secondary-light'}`}>
                    {t("events.pageOf", { page, pages: pagination.pages })}
                  </span>
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                  disabled={page === pagination.pages || loading}
                  className={`rounded-xl border p-2.5 transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${isDark ? 'border-border-dark bg-background-dark text-text-primary-dark hover:bg-surface-muted-dark' : 'border-border-light bg-surface-light text-text-primary-light shadow-sm hover:bg-surface-muted-light'}`}
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
