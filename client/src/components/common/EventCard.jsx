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
}) {
  return (
    <div
      className={`group flex flex-col h-full rounded-xl border border-[#30363d] bg-[#161b22] hover:border-[#58a6ff]/50 overflow-hidden transition-all duration-300 ${className}`}
    >
      {/* Cover Image */}
      <div className="relative h-48 w-full bg-[#0d1117] overflow-hidden shrink-0">
        {coverImage ? (
          <img 
            src={coverImage} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1f242c] to-[#0d1117]">
            <Calendar className="w-12 h-12 text-[#30363d]" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] to-transparent opacity-80" />
      </div>

      <div className="flex flex-col flex-1 p-5 gap-4">
        <div>
          <h2 className="text-[#e6edf3] text-xl font-bold leading-tight line-clamp-2 group-hover:text-[#58a6ff] transition-colors">
            {title}
          </h2>
        </div>

        <div className="flex flex-col gap-2.5 text-sm text-[#8b949e]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#58a6ff]" />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#58a6ff]" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#58a6ff]" />
            <span className="line-clamp-1">{location}</span>
          </div>
        </div>

        <p className="text-[#8b949e] text-sm leading-relaxed line-clamp-3 mt-1 flex-1">
          {description}
        </p>

        <div className="flex justify-between items-center pt-4 mt-auto border-t border-[#30363d]/50">
          <div className="flex items-center gap-1.5 text-[#8b949e] text-xs font-medium">
            <Users className="w-3.5 h-3.5" />
            <span>{attendees} attending</span>
          </div>
          <Button
            variant="primary"
            className="h-9 px-4 text-sm font-semibold hover:scale-105 transition-transform"
            onClick={onRegister}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
