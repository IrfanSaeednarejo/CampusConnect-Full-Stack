export default function FAQItem({ question, answer, className = "" }) {
  return (
    <div
      className={`p-4 rounded border border-border bg-background ${className}`}
    >
      <h3 className="text-primary font-bold mb-2">{question}</h3>
      <p className="text-text-secondary text-sm">{answer}</p>
    </div>
  );
}
