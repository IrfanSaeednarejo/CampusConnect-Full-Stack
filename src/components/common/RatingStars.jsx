import React from "react";
import PropTypes from "prop-types";

/**
 * RatingStars Component
 * Displays star rating with support for half stars
 */
const RatingStars = ({ rating, size = "md", showRating = false, className = "" }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(rating);

  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <div className="flex text-primary">
        {[...Array(fullStars)].map((_, i) => (
          <span
            key={i}
            className={`material-symbols-outlined ${sizeClasses[size]}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
        ))}
        {hasHalfStar && (
          <span
            className={`material-symbols-outlined ${sizeClasses[size]}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star_half
          </span>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <span key={`empty-${i}`} className={`material-symbols-outlined ${sizeClasses[size]}`}>
            star
          </span>
        ))}
      </div>
      {showRating && (
        <span className="text-sm text-gray-500 dark:text-[#8b949e] ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

RatingStars.propTypes = {
  rating: PropTypes.number.isRequired,
  size: PropTypes.oneOf(["sm", "md", "lg"]),
  showRating: PropTypes.bool,
  className: PropTypes.string,
};

export default RatingStars;
