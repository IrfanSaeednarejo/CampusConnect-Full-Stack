import React from "react";
import PropTypes from "prop-types";
import Avatar from "../common/Avatar";
import Button from "../common/Button";

/**
 * DirectoryCard Component
 * Displays a member's avatar, name, role, skills, and action buttons for Academic Network
 */
const DirectoryCard = ({ member, onViewProfile, onConnect, onMessage }) => {
  const getConnectionButton = (status) => {
    switch (status) {
      case "message":
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onMessage?.(member)}
          >
            <span className="material-symbols-outlined text-sm">send</span>
            <span>Message</span>
          </Button>
        );
      case "connect":
        return (
          <Button
            variant="primary"
            size="sm"
            onClick={() => onConnect?.(member)}
          >
            <span className="material-symbols-outlined text-sm">
              person_add
            </span>
            <span>Connect</span>
          </Button>
        );
      case "pending":
        return (
          <Button variant="ghost" size="sm" disabled>
            <span className="material-symbols-outlined text-sm">
              hourglass_empty
            </span>
            <span>Pending</span>
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-card-dark border border-border-dark rounded-lg p-6 flex flex-col items-center text-center">
      {/* Avatar */}
      <Avatar
        name={member.avatar}
        size="2xl"
        className="mb-4 bg-gradient-to-br from-primary to-green-500 text-white text-2xl font-bold"
      />
      {/* Name and Role */}
      <h3 className="text-text-dark font-bold text-lg mb-1">{member.name}</h3>
      <p className="text-subtle-dark text-sm mb-4">{member.role}</p>
      {/* Skills */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {member.skills.map((skill, idx) => (
          <span
            key={idx}
            className="px-2 py-1 bg-background-dark border border-primary text-primary text-xs rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>
      {/* Action Buttons */}
      <div className="flex gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onViewProfile?.(member)}
        >
          <span className="material-symbols-outlined text-sm">person</span>
          <span className="text-sm">View Profile</span>
        </Button>
        {getConnectionButton(member.connectionStatus)}
      </div>
    </div>
  );
};

DirectoryCard.propTypes = {
  member: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    role: PropTypes.string.isRequired,
    avatar: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    connectionStatus: PropTypes.string,
  }).isRequired,
  onViewProfile: PropTypes.func,
  onConnect: PropTypes.func,
  onMessage: PropTypes.func,
};

export default DirectoryCard;
