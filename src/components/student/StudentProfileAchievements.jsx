import React from "react";
import PropTypes from "prop-types";

const StudentProfileAchievements = ({ achievements }) => (
  <section className="bg-card-dark border border-border-dark rounded-lg p-6">
    <div className="flex items-start justify-between">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
          <span className="material-symbols-outlined text-primary text-2xl">
            emoji_events
          </span>
        </div>
        <div>
          <h3 className="text-text-dark font-bold text-lg mb-1">
            {achievements[0].title}
          </h3>
          <p className="text-subtle-dark">{achievements[0].description}</p>
        </div>
      </div>
      <button className="text-primary hover:text-[#2ea043]">
        <span className="material-symbols-outlined">arrow_forward</span>
      </button>
    </div>
  </section>
);

StudentProfileAchievements.propTypes = {
  achievements: PropTypes.array.isRequired,
};

export default StudentProfileAchievements;
