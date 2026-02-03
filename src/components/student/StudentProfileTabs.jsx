import React from "react";
import PropTypes from "prop-types";

const StudentProfileTabs = ({ activeTab, setActiveTab }) => {
  const tabs = ["Overview", "Societies", "Events", "Mentorship"];
  return (
    <div className="border-b border-border-dark mb-6">
      <div className="flex gap-8 -mb-px">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-2 font-medium transition-colors ${
              activeTab === tab
                ? "text-primary border-b-2 border-primary"
                : "text-subtle-dark hover:text-text-dark"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

StudentProfileTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
};

export default StudentProfileTabs;
