import React from "react";
import PropTypes from "prop-types";

/**
 * NotificationListItem - For NotificationCenter list rendering, matches existing UI
 */
const NotificationListItem = ({ icon, title, time }) => (
  <div className="flex items-center gap-4 bg-[#111a22] px-4 min-h-[72px] py-2">
    <div className="text-white flex items-center justify-center rounded-lg bg-[#243647] shrink-0 size-12">
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <div className="flex flex-col justify-center">
      <p className="text-white text-base font-medium leading-normal line-clamp-1">
        {title}
      </p>
      <p className="text-[#93adc8] text-sm font-normal leading-normal line-clamp-2">
        {time}
      </p>
    </div>
  </div>
);

NotificationListItem.propTypes = {
  icon: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
};

export default NotificationListItem;
