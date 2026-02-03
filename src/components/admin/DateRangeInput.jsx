import React from "react";
import PropTypes from "prop-types";
import DatePicker from "../common/DatePicker";

/**
 * DateRangeInput
 * Date range input using two DatePickers
 */
const DateRangeInput = ({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}) => (
  <div className="flex gap-2 w-full">
    <DatePicker
      value={startDate}
      onChange={onStartDateChange}
      placeholder="Start date"
      className="flex-1"
    />
    <DatePicker
      value={endDate}
      onChange={onEndDateChange}
      placeholder="End date"
      className="flex-1"
    />
  </div>
);

DateRangeInput.propTypes = {
  startDate: PropTypes.instanceOf(Date),
  endDate: PropTypes.instanceOf(Date),
  onStartDateChange: PropTypes.func.isRequired,
  onEndDateChange: PropTypes.func.isRequired,
};

export default DateRangeInput;
