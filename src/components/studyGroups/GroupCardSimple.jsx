import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import Badge from "../common/Badge";

/**
 * GroupCardSimple Component
 * Simplified study group card for listing pages
 */
const GroupCardSimple = ({ group }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 p-4 rounded-lg border border-gray-200 dark:border-[#30363d] bg-white dark:bg-[#161b22] hover:border-[#238636] transition-colors">
      <div>
        <p className="text-gray-900 dark:text-[#e6edf3] text-base font-bold leading-normal">
          {group.title}
        </p>
        <p className="text-gray-500 dark:text-[#8b949e] text-sm font-normal leading-normal">
          {group.desc}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="filled" color="success" size="sm">
          {group.code}
        </Badge>
        <div className="flex items-center gap-1 text-gray-500 dark:text-[#8b949e]">
          <span className="material-symbols-outlined text-base">group</span>
          <p className="text-xs font-medium">{group.members}</p>
        </div>
      </div>
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => navigate(`/study-groups/${group.id}`)}
          className="flex-1 flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold bg-gray-100 dark:bg-zinc-800/50 text-gray-900 dark:text-[#e6edf3] border border-gray-200 dark:border-[#30363d] hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
        >
          View Group
        </button>
        <button
          type="button"
          onClick={() => navigate(`/study-groups/${group.id}/join`)}
          className="flex-1 flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-semibold bg-[#238636] text-white hover:bg-[#2ea043] transition-colors"
        >
          Join Group
        </button>
      </div>
    </div>
  );
};

GroupCardSimple.propTypes = {
  group: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    desc: PropTypes.string,
    code: PropTypes.string,
    members: PropTypes.string,
  }).isRequired,
};

export default GroupCardSimple;
