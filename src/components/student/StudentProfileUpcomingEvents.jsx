import React from "react";
import PropTypes from "prop-types";

const StudentProfileUpcomingEvents = ({ events }) => (
  <section className="bg-card-dark border border-border-dark rounded-lg p-6">
    <h2 className="text-text-dark font-bold text-lg mb-4">Upcoming Events</h2>
    <div className="space-y-4">
      {events.map((event, idx) => (
        <div key={idx} className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">
              event
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-text-dark font-medium">{event.title}</h3>
            <p className="text-subtle-dark text-sm">{event.time}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

StudentProfileUpcomingEvents.propTypes = {
  events: PropTypes.array.isRequired,
};

export default StudentProfileUpcomingEvents;
