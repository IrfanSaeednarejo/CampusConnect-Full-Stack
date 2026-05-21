import Button from "./Button";
import { Calendar, Clock, MapPin, Users } from "lucide-react";

export default function EventCard({
  title,
  date,
  time,
  location,
  description,
  attendees,
  onRegister,
  coverImage,
  className = "",
  isDark = true,
}) {
  return (
    <div
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/50"
          : "border-[#DCE4EE] bg-white hover:border-[#93C5FD] hover:shadow-[0_20px_50px_rgba(15,23,42,0.08)]"
      } ${className}`}
    >
      {/* Cover Image */}
      <div
        className={`relative h-48 w-full overflow-hidden shrink-0 ${
          isDark ? "bg-[#0d1117]" : "bg-[#EEF3F9]"
        }`}
      >
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${
              isDark
                ? "bg-surface-dark"
                : "bg-surface-light"
            }`}
          >
            <Calendar
              className={`h-12 w-12 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}
            />
          </div>
        )}
        <div
          className={`absolute inset-0 opacity-80 ${
            isDark
              ? "bg-background-dark/80"
              : "bg-background-light/90"
          }`}
        />
      </div>

      <div className="flex flex-col flex-1 p-5 gap-4">
        <div>
          <h2
            className={`line-clamp-2 text-xl font-bold leading-tight transition-colors ${
              isDark
                ? "text-text-primary-dark group-hover:text-info"
                : "text-text-primary-light group-hover:text-info"
            }`}
          >
            {title}
          </h2>
        </div>

        <div
          className={`flex flex-col gap-2.5 text-sm transition-colors ${
            isDark ? "text-[#8b949e]" : "text-[#526277]"
            }`}
        >
          <div className="flex items-center gap-2">
            <Calendar className={`h-4 w-4 ${isDark ? "text-[#58a6ff]" : "text-[#1D4ED8]"}`} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className={`h-4 w-4 ${isDark ? "text-[#58a6ff]" : "text-[#1D4ED8]"}`} />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className={`h-4 w-4 ${isDark ? "text-[#58a6ff]" : "text-[#1D4ED8]"}`} />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <p
          className={`mt-1 flex-1 line-clamp-3 text-sm leading-relaxed transition-colors ${
            isDark ? "text-[#8b949e]" : "text-[#526277]"
          }`}
        >
          {description}
        </p>

        <div
          className={`mt-auto flex items-center justify-between border-t pt-4 ${
            isDark ? "border-[#30363d]/50" : "border-[#E2E8F0]"
          }`}
        >
          <div
            className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
              isDark ? "text-[#8b949e]" : "text-[#526277]"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>{attendees} attending</span>
          </div>
          <Button
            variant="primary"
            className={`h-9 px-4 text-sm font-semibold transition-transform hover:scale-105 ${
              !isDark
                ? "bg-[#1D4ED8] text-white hover:bg-[#1E40AF] shadow-[0_8px_18px_rgba(29,78,216,0.16)]"
                : ""
            }`}
            onClick={onRegister}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
