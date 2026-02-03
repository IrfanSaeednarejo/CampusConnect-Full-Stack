import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";

/**
 * SocietyCardSimple Component
 * Simplified society card for listing pages
 */
const SocietyCardSimple = ({ society }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] overflow-hidden hover:border-[#238636] transition-colors">
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-[#238636]/20 flex items-center justify-center text-[#238636] text-xl font-bold">
            {society.logo}
          </div>
          <div className="flex-1">
            <h3 className="text-gray-900 dark:text-[#c9d1d9] text-lg font-bold leading-tight">
              {society.name}
            </h3>
            <p className="text-gray-500 dark:text-[#8b949e] text-sm">{society.category}</p>
          </div>
        </div>
        <p className="text-gray-500 dark:text-[#8b949e] text-sm leading-relaxed">
          {society.description}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-[#30363d]">
          <div className="flex items-center gap-2 text-gray-500 dark:text-[#8b949e] text-sm">
            <span className="material-symbols-outlined text-base">group</span>
            <span>{society.members} members</span>
          </div>
          <button
            onClick={() => navigate(`/societies/${society.id}`)}
            className="px-4 py-2 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-medium transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

SocietyCardSimple.propTypes = {
  society: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    members: PropTypes.number,
    category: PropTypes.string,
    logo: PropTypes.string,
  }).isRequired,
};

export default SocietyCardSimple;
