import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import RatingStars from "../common/RatingStars";
import Badge from "../common/Badge";

/**
 * MentorCardSimple Component
 * Simplified mentor card for marketplace listing
 */
const MentorCardSimple = ({ mentor }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-[#1c241f] rounded-xl border border-[#29382f]/50 p-6 flex flex-col gap-4 hover:border-[#238636]/40 transition-colors">
      <div className="flex items-center gap-4">
        <img
          className="size-16 rounded-full object-cover"
          data-alt={`Profile picture of ${mentor.name}`}
          src={mentor.avatar}
          alt={mentor.name}
        />
        <div className="flex flex-col">
          <h3 className="text-white font-bold text-lg">{mentor.name}</h3>
          <p className="text-[#9db8a9] text-sm">{mentor.title}</p>
        </div>
      </div>

      {/* Skills */}
      {mentor.skills && mentor.skills.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {mentor.skills.map((skill, idx) => (
            <Badge key={idx} variant="filled" color="primary" size="sm">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      {/* Rating */}
      <div className="flex items-center gap-2 text-[#9db8a9]">
        <RatingStars rating={mentor.rating} size="md" />
        <span className="text-sm">
          {mentor.rating} ({mentor.reviews} reviews)
        </span>
      </div>

      {/* Action Button */}
      <button
        onClick={() => navigate(`/mentors/${mentor.id}`)}
        className="mt-4 w-full text-center bg-[#238636]/20 text-[#238636] font-bold py-2 px-4 rounded-lg hover:bg-[#238636]/30 transition-colors"
      >
        View Profile
      </button>
    </div>
  );
};

MentorCardSimple.propTypes = {
  mentor: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    title: PropTypes.string,
    avatar: PropTypes.string,
    skills: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    reviews: PropTypes.number,
  }).isRequired,
};

export default MentorCardSimple;
