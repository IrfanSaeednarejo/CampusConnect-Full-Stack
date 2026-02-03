import React from "react";
import PropTypes from "prop-types";
import Avatar from "../common/Avatar";
import Button from "../common/Button";

const StudentProfileSidebar = ({ profileData }) => (
  <aside className="lg:w-1/3 shrink-0">
    <div className="bg-card-dark border border-border-dark rounded-lg p-6 space-y-6">
      {/* Profile Picture */}
      <div className="flex flex-col items-center">
        <Avatar
          name={profileData.name}
          size="2xl"
          className="mb-4 bg-linear-to-br from-primary to-green-500 text-white text-4xl font-bold"
        />
        <h1 className="text-text-dark text-2xl font-bold">
          {profileData.name}
        </h1>
        <p className="text-subtle-dark text-sm">@{profileData.username}</p>
      </div>
      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
        <Button fullWidth variant="primary">
          Edit Profile
        </Button>
        <Button fullWidth variant="success">
          View Connections
        </Button>
      </div>
      {/* Bio */}
      <div>
        <p className="text-text-dark text-sm leading-relaxed">
          {profileData.bio}
        </p>
      </div>
      {/* Academic Details */}
      <div className="space-y-3">
        <div className="flex items-center gap-3 text-text-dark">
          <span className="material-symbols-outlined text-primary">school</span>
          <span>{profileData.degree}</span>
        </div>
        <div className="flex items-center gap-3 text-text-dark">
          <span className="material-symbols-outlined text-primary">groups</span>
          <span>Member of {profileData.societiesCount} societies</span>
        </div>
        <div className="flex items-center gap-3 text-text-dark">
          <span className="material-symbols-outlined text-primary">
            location_on
          </span>
          <span>{profileData.location}</span>
        </div>
      </div>
      {/* Interests */}
      <div>
        <h3 className="text-text-dark font-bold mb-3">Interests</h3>
        <div className="flex flex-wrap gap-2">
          {profileData.interests.map((interest, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-background-dark border border-primary text-primary text-sm rounded-full"
            >
              {interest}
            </span>
          ))}
        </div>
      </div>
    </div>
  </aside>
);

StudentProfileSidebar.propTypes = {
  profileData: PropTypes.object.isRequired,
};

export default StudentProfileSidebar;
