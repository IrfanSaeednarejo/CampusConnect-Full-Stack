import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

/**
 * EventCard Component
 * Reusable event card display with image, details, and actions
 */
const EventCard = ({ event, variant = "default" }) => {
  const navigate = useNavigate();

  if (variant === "compact") {
    return (
      <div className="flex flex-col sm:flex-row items-stretch justify-between gap-4 p-4 border border-gray-200 dark:border-[#30363d] rounded-lg hover:border-[#238636]/50 dark:hover:border-[#238636]/50 transition-colors">
        <div className="flex flex-[2_2_0px] flex-col gap-3">
          <div className="flex flex-col gap-1">
            {event.host && (
              <p className="text-gray-500 dark:text-[#8b949e] text-sm font-normal">
                {event.host}
              </p>
            )}
            <p className="text-gray-900 dark:text-[#c9d1d9] text-base font-bold">
              {event.title}
            </p>
            <p className="text-gray-500 dark:text-[#8b949e] text-sm font-normal">
              {event.date}
            </p>
          </div>
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-3 bg-gray-200 dark:bg-[#30363d] text-gray-900 dark:text-[#c9d1d9] gap-1 text-sm font-medium leading-normal w-fit hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            <span className="truncate">Join Event</span>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
              arrow_forward
            </span>
          </button>
        </div>
        {event.image && (
          <div
            className="w-full sm:w-48 bg-center bg-no-repeat aspect-video sm:aspect-square bg-cover rounded-lg flex-1"
            data-alt={`Event image for ${event.title}`}
            style={{ backgroundImage: `url("${event.image}")` }}
          ></div>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] transition-all hover:border-[#238636]/50 dark:hover:border-[#238636]/50 @[48rem]:flex-row">
      {event.image && (
        <div
          className="w-full bg-cover bg-center bg-no-repeat @[48rem]:w-1/3 aspect-video @[48rem]:aspect-auto"
          data-alt={`Event image for ${event.title}`}
          style={{ backgroundImage: `url("${event.image}")` }}
        ></div>
      )}
      <div className="flex flex-1 flex-col justify-between gap-4 p-5">
        <div className="flex flex-col gap-2">
          {event.tags && event.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              {event.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    idx === 0
                      ? "bg-[#238636]/20 text-[#238636]"
                      : "bg-blue-500/20 text-blue-400"
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-lg font-bold leading-tight tracking-tight text-gray-900 dark:text-[#c9d1d9]">
            {event.title}
          </p>
          <div className="flex flex-col gap-1 text-sm text-gray-500 dark:text-[#8b949e]">
            <p>
              {event.date} {event.location && `• ${event.location}`}
            </p>
            {event.host && <p>Hosted by {event.host}</p>}
          </div>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={() => navigate(`/events/${event.id}/register`)}
            className="flex h-9 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#238636] px-4 text-sm font-bold leading-normal text-white transition hover:bg-green-500"
          >
            <span className="truncate">Register</span>
          </button>
          <button
            onClick={() => navigate(`/events/${event.id}`)}
            className="flex h-9 flex-1 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-[#21262d] px-4 text-sm font-medium leading-normal text-gray-900 dark:text-[#c9d1d9] transition hover:bg-[#30363d]"
          >
            <span className="truncate">View Details</span>
          </button>
        </div>
      </div>
    </div>
  );
};

EventCard.propTypes = {
  event: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    date: PropTypes.string,
    location: PropTypes.string,
    host: PropTypes.string,
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    image: PropTypes.string,
  }).isRequired,
  variant: PropTypes.oneOf(["default", "compact"]),
};

export default EventCard;
