export default function Card({ children, className = "", padding = "p-8" }) {
  return (
    <div
      className={`bg-[#161b22] border border-[#30363d] rounded-lg ${padding} ${className}`}
    >
      {children}
    </div>
  );
}
