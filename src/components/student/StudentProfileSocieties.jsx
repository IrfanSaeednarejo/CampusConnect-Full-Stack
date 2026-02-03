import React from "react";
import PropTypes from "prop-types";

const StudentProfileSocieties = ({ societies }) => (
  <section className="bg-card-dark border border-border-dark rounded-lg p-6">
    <h2 className="text-text-dark font-bold text-lg mb-4">My Societies</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {societies.map((society, idx) => (
        <div key={idx} className="flex flex-col items-center gap-2">
          <div
            className={`w-16 h-16 ${society.color} rounded-lg flex items-center justify-center text-white font-bold`}
          >
            {society.icon}
          </div>
          <h3 className="text-text-dark font-bold">{society.name}</h3>
          <p className="text-subtle-dark text-sm">{society.role}</p>
        </div>
      ))}
    </div>
  </section>
);

StudentProfileSocieties.propTypes = {
  societies: PropTypes.array.isRequired,
};

export default StudentProfileSocieties;
