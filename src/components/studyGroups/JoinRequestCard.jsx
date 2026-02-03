import React from "react";
import PropTypes from "prop-types";
import Avatar from "../common/Avatar";
import Button from "../common/Button";

/**
 * JoinRequestCard Component
 * Displays a user's join request with approve/decline actions
 */
const JoinRequestCard = ({
  user,
  requestedOn,
  onApprove,
  onDecline,
  loading,
}) => (
  <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#f6f6f8] dark:bg-[#161b22] p-4 rounded-lg border border-transparent dark:border-[#30363d]">
    <div className="flex items-center gap-4 grow">
      <Avatar src={user.avatar} name={user.name} size="lg" />
      <div className="flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <p className="text-gray-900 dark:text-[#e6edf3] text-base font-medium leading-normal">
            {user.name}
          </p>
          <a
            className="text-blue-600 dark:text-[#58a6ff] hover:underline text-sm font-medium"
            href={user.profileUrl || "#"}
          >
            View Profile
          </a>
        </div>
        <p className="text-gray-500 dark:text-[#8b949e] text-sm font-normal leading-normal">
          Requested on {requestedOn}
        </p>
      </div>
    </div>
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <Button
        variant="outline"
        size="md"
        onClick={onDecline}
        disabled={loading}
        className="flex-1 sm:flex-none min-w-21"
      >
        Decline
      </Button>
      <Button
        variant="success"
        size="md"
        onClick={onApprove}
        loading={loading}
        className="flex-1 sm:flex-none min-w-21"
      >
        Approve
      </Button>
    </div>
  </div>
);

JoinRequestCard.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    profileUrl: PropTypes.string,
  }).isRequired,
  requestedOn: PropTypes.string.isRequired,
  onApprove: PropTypes.func,
  onDecline: PropTypes.func,
  loading: PropTypes.bool,
};

export default JoinRequestCard;
