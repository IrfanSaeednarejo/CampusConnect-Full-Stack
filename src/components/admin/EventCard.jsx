import React from "react";
import PropTypes from "prop-types";

/**
 * EventCard
 * Card for displaying event summary in moderation grid
 */
const EventCard = ({ event, onViewDetails, onApprove, onReject }) => (
  <div className="flex flex-col bg-[#1c2620]/50 border border-[#3c5345] rounded-lg overflow-hidden">
    <div className="p-4 grow">
      <h3 className="text-white font-semibold">{event.title}</h3>
      <p className="text-[#9db8a8] text-sm mt-1">Hosted by {event.host}</p>
    </div>
    <div className="flex items-center justify-between p-4 border-t border-[#3c5345] bg-[#111814]/50">
      <button
        onClick={() => onViewDetails(event)}
        className="px-4 py-2 text-sm rounded-lg text-white font-medium bg-[#29382f] hover:bg-[#3c5345]"
      >
        View Details
      </button>
      <div className="flex items-center gap-2">
        <button
          className="px-4 py-2 text-sm rounded-lg text-white font-semibold bg-[#DA3633]/20 hover:bg-[#DA3633]/30"
          onClick={() => onReject(event)}
        >
          Reject
        </button>
        <div className="relative group">
          <button
            className="px-4 py-2 text-sm rounded-lg text-black font-semibold bg-[#17cf60] hover:bg-[#17cf60]/90"
            onClick={() => onApprove(event)}
          >
            Approve
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Approved events will be published immediately.
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

EventCard.propTypes = {
  event: PropTypes.object.isRequired,
  onViewDetails: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default EventCard;
