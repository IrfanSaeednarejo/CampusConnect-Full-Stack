import Button from "./Button";

export default function MentorCard({
  name,
  expertise,
  bio,
  availability,
  students,
  onRequest,
  className = "",
}) {
  return (
    <div
      className={`flex flex-col gap-4 p-4 rounded-lg border border-[#30363d] bg-[#161b22] hover:bg-[#21262d] transition-colors ${className}`}
    >
      <div>
        <h2 className="text-[#e6edf3] text-lg font-bold leading-tight">
          {name}
        </h2>
        <p className="text-[#238636] text-sm font-semibold mt-1">
          {expertise}
        </p>
      </div>
      <p className="text-[#8b949e] text-sm font-normal leading-normal">
        {bio}
      </p>
      <div className="flex flex-col gap-2 text-sm text-[#8b949e]">
        <p>📅 Available: {availability}</p>
        <p>👥 {students} students mentored</p>
      </div>
      <Button
        variant="primary"
        className="h-8 px-3 text-xs w-full"
        onClick={onRequest}
      >
        Request Mentorship
      </Button>
    </div>
  );
}
