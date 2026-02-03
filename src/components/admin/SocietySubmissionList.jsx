import React from "react";
import PropTypes from "prop-types";

/**
 * SocietySubmissionList
 * List of society submissions for approval
 */
const SocietySubmissionList = ({ submissions, activeId, onSelect }) => (
  <ul className="divide-y divide-border-admin">
    {submissions.map((s) => {
      const isActive = s.id === activeId;
      return (
        <li
          key={s.id}
          className={
            isActive
              ? "p-4 bg-primary-alt/10 border-l-2 border-primary-alt cursor-pointer"
              : "p-4 hover:bg-[#29382f]/50 cursor-pointer"
          }
          onClick={() => onSelect(s.id)}
        >
          <div className="flex justify-between items-start">
            <h3 className="text-white font-semibold">{s.name}</h3>
            <span className="text-[#9db8a8] text-xs">{s.date}</span>
          </div>
          <p className="text-[#9db8a8] text-sm mt-1">
            Proposed by {s.proposer}
          </p>
        </li>
      );
    })}
  </ul>
);

SocietySubmissionList.propTypes = {
  submissions: PropTypes.array.isRequired,
  activeId: PropTypes.string,
  onSelect: PropTypes.func.isRequired,
};

export default SocietySubmissionList;
