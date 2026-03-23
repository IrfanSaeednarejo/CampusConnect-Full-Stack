export default function FAQItem({ question, answer, className = "" }) {
  return (
    <div
      className={`p-4 rounded border border-[#30363d] bg-[#0d1117] ${className}`}
    >
      <h3 className="text-[#238636] font-bold mb-2">{question}</h3>
      <p className="text-[#8b949e] text-sm">{answer}</p>
    </div>
  );
}
