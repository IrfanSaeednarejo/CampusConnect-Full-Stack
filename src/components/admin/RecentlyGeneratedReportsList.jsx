import React from "react";
import PropTypes from "prop-types";
import Button from "../common/Button";

/**
 * RecentlyGeneratedReportsList
 * List of recently generated reports with download buttons
 */
const RecentlyGeneratedReportsList = ({ reports, onDownload }) => (
  <div className="flex flex-col">
    {reports.map((report, idx) => (
      <div
        key={idx}
        className="flex flex-wrap items-center justify-between gap-4 border-t border-border-light dark:border-border-dark py-4"
      >
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-6 flex-1 min-w-50">
          <p className="text-text-primary-light dark:text-text-primary-dark font-medium text-base">
            {report.title}
          </p>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            {report.dateRange}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => onDownload(report)}
          className="min-w-21 h-9 px-4 w-full sm:w-auto border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-primary-light dark:text-text-primary-dark font-bold"
        >
          <span className="truncate">Download Again</span>
        </Button>
      </div>
    ))}
  </div>
);

RecentlyGeneratedReportsList.propTypes = {
  reports: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      dateRange: PropTypes.string.isRequired,
    }),
  ).isRequired,
  onDownload: PropTypes.func.isRequired,
};

export default RecentlyGeneratedReportsList;
