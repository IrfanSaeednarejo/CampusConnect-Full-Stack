export default function SuccessMessage({ message, className = "" }) {
  return (
    <div
      className={`mb-6 p-4 rounded-lg bg-primary text-white text-sm ${className}`}
    >
      ✓ {message}
    </div>
  );
}
