export default function SuccessMessage({ message, className = "" }) {
  return (
    <div
      className={`mb-6 p-4 rounded-lg bg-[#238636] text-white text-sm ${className}`}
    >
      ✓ {message}
    </div>
  );
}
