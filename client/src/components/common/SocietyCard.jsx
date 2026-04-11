export default function SocietyCard({ society, className = "" }) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors group cursor-pointer ${className}`}
    >
      {/* Society Image */}
      <div className="relative w-full h-40 overflow-hidden bg-background">
        <div
          className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
          style={{ backgroundImage: `url("${society.image}")` }}
        />
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-surface/80 text-primary border border-primary">
            {society.category}
          </span>
        </div>
      </div>

      {/* Society Info */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-text-primary text-lg font-bold leading-tight">
            {society.name}
          </h3>
        </div>

        <p className="text-text-secondary text-sm line-clamp-2">
          {society.description}
        </p>

        {/* Society Stats */}
        <div className="space-y-1 py-3 border-t border-b border-border">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <span className="material-symbols-outlined text-base">group</span>
            <span>{society.members} members</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <span className="material-symbols-outlined text-base">event</span>
            <span>{society.events} events this year</span>
          </div>
          {society.status === "registered" && (
            <div className="flex items-center gap-2 text-primary text-sm font-medium">
              <span className="material-symbols-outlined text-base">
                verified
              </span>
              <span>{society.role}</span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          className={`w-full flex items-center justify-center overflow-hidden rounded-lg h-9 px-4 gap-2 text-sm font-bold leading-normal tracking-[0.015em] transition-colors ${
            society.status === "registered"
              ? "bg-[#C7D2FE] text-text-primary hover:bg-surface-hover"
              : "bg-primary text-[#EEF2FF] hover:bg-primary-hover"
          }`}
        >
          <span className="material-symbols-outlined text-base">
            {society.status === "registered" ? "check_circle" : "add_circle"}
          </span>
          <span>
            {society.status === "registered" ? "Registered" : "Join Now"}
          </span>
        </button>
      </div>
    </div>
  );
}
