import React from "react";
import PropTypes from "prop-types";
import Button from "../common/Button";

/**
 * ReportReadyDownloadBanner
 * Banner for when a report is ready to download
 */
const ReportReadyDownloadBanner = ({
  message,
  onDownload,
  downloadLabel = "Download CSV",
}) => (
  <div className="flex items-center gap-4 rounded-xl border border-primary/30 bg-primary/10 p-4">
    <span className="material-symbols-outlined text-primary text-2xl">
      check_circle
    </span>
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between flex-1 gap-2">
      <p className="text-text-primary-light dark:text-text-primary-dark text-sm font-medium">
        {message}
      </p>
      <Button
        variant="secondary"
        size="sm"
        onClick={onDownload}
        className="min-w-[84px] h-9 px-4 sm:w-auto border border-border-light dark:border-border-dark bg-background-light dark:bg-surface-dark hover:bg-zinc-200 dark:hover:bg-zinc-700 text-text-primary-light dark:text-text-primary-dark font-bold"
      >
        <span className="truncate">{downloadLabel}</span>
      </Button>
    </div>
  </div>
);

ReportReadyDownloadBanner.propTypes = {
  message: PropTypes.string.isRequired,
  onDownload: PropTypes.func.isRequired,
  downloadLabel: PropTypes.string,
};

export default ReportReadyDownloadBanner;
