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
      className={`flex flex-col gap-4 p-4 rounded-lg border border-border bg-surface hover:bg-surface-hover transition-colors ${className}`}
    >
      <div>
        <h2 className="text-text-primary text-lg font-bold leading-tight">
          {name}
        </h2>
        <p className="text-primary text-sm font-semibold mt-1">
          {expertise}
        </p>
      </div>
      <p className="text-text-secondary text-sm font-normal leading-normal">
        {bio}
      </p>
      <div className="flex flex-col gap-2 text-sm text-text-secondary">
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
