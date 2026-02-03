import React from "react";
import PropTypes from "prop-types";
import Select from "../common/Select";

/**
 * ReportTypeSelect
 * Dropdown for selecting report type
 */
const REPORT_TYPE_OPTIONS = [
  { value: "", label: "Select Report Type" },
  { value: "engagement", label: "User Engagement" },
  { value: "moderation", label: "Moderation Activity" },
  { value: "mentorship", label: "Mentorship Metrics" },
  { value: "society", label: "Society Growth" },
];

const ReportTypeSelect = ({ value, onChange }) => (
  <Select
    options={REPORT_TYPE_OPTIONS}
    value={value}
    onChange={onChange}
    placeholder="Select Report Type"
    className="w-full min-w-0 flex-1"
  />
);

ReportTypeSelect.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default ReportTypeSelect;
