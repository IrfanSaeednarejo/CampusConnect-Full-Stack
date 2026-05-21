import React, { useState } from "react";
import Button from "../../common/Button";

export default function ScoringRubricForm({ criteria, onSubmitScore, disabled, loading }) {
  // Initialize state based on criteria
  const [scores, setScores] = useState(
    criteria.reduce((acc, crit) => ({ ...acc, [crit.name]: 0 }), {})
  );
  const [feedback, setFeedback] = useState("");

  const handleScoreChange = (name, value) => {
    setScores(prev => ({ ...prev, [name]: Number(value) }));
  };

  const calculateTotal = () => Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossible = criteria.reduce((sum, crit) => sum + (crit.maxScore || 10), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalScoreData = {
      scores: criteria.map(c => ({
        criterionName: c.name,
        scoreGiven: scores[c.name]
      })),
      feedback
    };
    onSubmitScore(finalScoreData);
  };

  if (criteria.length === 0) {
    return (
      <div className="bg-surface-dark border border-border-dark p-6 rounded-xl text-center">
        <p className="text-text-secondary-dark">The organizer hasn't provided a grading rubric.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface-dark border border-border-dark p-6 rounded-xl space-y-6 shadow-xl text-left">
      <div className="border-b border-border-dark pb-4 flex justify-between items-end">
        <h3 className="text-xl font-bold text-text-primary-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-info">fact_check</span> Rubric
        </h3>
        <span className="text-2xl font-black text-primary">{calculateTotal()} <span className="text-sm text-text-secondary-dark font-normal">/ {maxPossible}</span></span>
      </div>

      <div className="space-y-5">
        {criteria.map((c, idx) => (
            <div key={idx} className="bg-background-dark border border-border-dark p-4 rounded-lg">
             <div className="flex justify-between items-center mb-2">
               <label className="font-bold text-text-primary-dark block">{c.name}</label>
               <span className="text-info font-bold">{scores[c.name] || 0} <span className="text-xs text-text-secondary-dark font-normal">/ {c.maxScore}</span></span>
             </div>
             {c.description && <p className="text-xs text-text-secondary-dark mb-4">{c.description}</p>}
             
             <input 
               type="range" 
               min="0" 
               max={c.maxScore} 
               value={scores[c.name]}
               onChange={e => handleScoreChange(c.name, e.target.value)}
               disabled={disabled || loading}
               className="w-full accent-info"
             />
           </div>
        ))}
      </div>

      <div>
        <label className="text-sm font-semibold text-text-primary-dark block mb-2">Qualitative Feedback (Optional)</label>
        <textarea 
          rows="3" 
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          disabled={disabled || loading}
          placeholder="Leave constructive feedback for the team..."
          className="w-full bg-background-dark text-text-primary-dark p-3 rounded-lg border border-border-dark focus:border-info outline-none resize-none"
        ></textarea>
      </div>

      <Button variant="primary" type="submit" disabled={disabled || loading} className="w-full justify-center py-3">
        {loading ? "Submitting..." : "Finalize Score"}
      </Button>
    </form>
  );
}
