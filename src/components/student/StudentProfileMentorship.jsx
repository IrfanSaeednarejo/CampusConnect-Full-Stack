import React from "react";
import PropTypes from "prop-types";

const StudentProfileMentorship = ({ mentorshipStatus }) => (
  <section className="bg-card-dark border border-border-dark rounded-lg p-6">
    <div className="flex items-start gap-4">
      <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
        <span className="material-symbols-outlined text-primary text-2xl">
          school
        </span>
      </div>
      <div className="flex-1">
        <h3 className="text-primary font-bold text-lg mb-1">
          Available to Mentor
        </h3>
        <p className="text-subtle-dark">{mentorshipStatus.message}</p>
      </div>
    </div>
  </section>
);

StudentProfileMentorship.propTypes = {
  mentorshipStatus: PropTypes.object.isRequired,
};

export default StudentProfileMentorship;
