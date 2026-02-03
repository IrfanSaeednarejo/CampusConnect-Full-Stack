import React from "react";
import PropTypes from "prop-types";
import Modal from "../common/Modal";

/**
 * EventDetailsModal
 * Modal for reviewing event details in moderation
 */
const EventDetailsModal = ({ isOpen, event, onClose, onApprove, onReject }) => {
  if (!event) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="flex items-center justify-between p-4 border-b border-[#3c5345]">
        <h2 className="text-lg font-semibold text-white">
          Review Event Submission
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        <div>
          <h3 className="text-sm font-medium text-[#9db8a8]">Event Title</h3>
          <p className="mt-1 text-white">{event.title}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-[#9db8a8]">Hosted by</h3>
          <button className="mt-1 text-[#17cf60] hover:underline">
            {event.host}
          </button>
        </div>
        {event.date && (
          <div>
            <h3 className="text-sm font-medium text-[#9db8a8]">
              Date, Time & Location
            </h3>
            <p className="mt-1 text-white">{event.date}</p>
            {event.location && <p className="text-white">{event.location}</p>}
          </div>
        )}
        {event.description && (
          <div>
            <h3 className="text-sm font-medium text-[#9db8a8]">
              Full Event Description
            </h3>
            <p className="mt-1 text-white/90 leading-relaxed">
              {event.description}
            </p>
          </div>
        )}
        {(event.category || event.capacity) && (
          <div className="grid grid-cols-2 gap-6">
            {event.category && (
              <div>
                <h3 className="text-sm font-medium text-[#9db8a8]">
                  Event Category
                </h3>
                <p className="mt-1 text-white">{event.category}</p>
              </div>
            )}
            {event.capacity && (
              <div>
                <h3 className="text-sm font-medium text-[#9db8a8]">Capacity</h3>
                <p className="mt-1 text-white">{event.capacity}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end items-center p-4 border-t border-[#3c5345] bg-[#1c2620]/50">
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 text-sm rounded-lg text-white font-semibold bg-[#DA3633]/80 hover:bg-[#DA3633]"
            onClick={() => onReject(event)}
          >
            Reject Event
          </button>
          <button
            className="px-4 py-2 text-sm rounded-lg text-black font-semibold bg-[#17cf60] hover:bg-[#17cf60]/90"
            onClick={() => onApprove(event)}
          >
            Approve Event
          </button>
        </div>
      </div>
    </Modal>
  );
};

EventDetailsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  event: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  onApprove: PropTypes.func.isRequired,
  onReject: PropTypes.func.isRequired,
};

export default EventDetailsModal;
