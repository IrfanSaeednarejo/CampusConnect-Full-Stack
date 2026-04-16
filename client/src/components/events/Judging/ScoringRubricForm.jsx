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
      <div className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl text-center">
         <p className="text-[#8b949e]">The organizer hasn't provided a grading rubric.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#161b22] border border-[#30363d] p-6 rounded-xl space-y-6 shadow-xl text-left">
      <div className="border-b border-[#30363d] pb-4 flex justify-between items-end">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#8957e5]">fact_check</span> Rubric
        </h3>
        <span className="text-2xl font-black text-[#1dc964]">{calculateTotal()} <span className="text-sm text-[#8b949e] font-normal">/ {maxPossible}</span></span>
      </div>

      <div className="space-y-5">
        {criteria.map((c, idx) => (
           <div key={idx} className="bg-[#0d1117] border border-[#30363d] p-4 rounded-lg">
             <div className="flex justify-between items-center mb-2">
                <label className="font-bold text-white block">{c.name}</label>
                <span className="text-[#8957e5] font-bold">{scores[c.name] || 0} <span className="text-xs text-[#8b949e] font-normal">/ {c.maxScore}</span></span>
             </div>
             {c.description && <p className="text-xs text-[#8b949e] mb-4">{c.description}</p>}
             
             <input 
               type="range" 
               min="0" 
               max={c.maxScore} 
               value={scores[c.name]}
               onChange={e => handleScoreChange(c.name, e.target.value)}
               disabled={disabled || loading}
               className="w-full accent-[#8957e5]"
             />
           </div>
        ))}
      </div>

      <div>
        <label className="text-sm font-semibold text-white block mb-2">Qualitative Feedback (Optional)</label>
        <textarea 
          rows="3" 
          value={feedback}
          onChange={e => setFeedback(e.target.value)}
          disabled={disabled || loading}
          placeholder="Leave constructive feedback for the team..."
          className="w-full bg-[#0d1117] text-white p-3 rounded-lg border border-[#30363d] focus:border-[#8957e5] outline-none resize-none"
        ></textarea>
      </div>

      <Button variant="primary" type="submit" disabled={disabled || loading} className="w-full justify-center py-3 bg-[#8957e5] hover:bg-[#a371f7] border-none">
        {loading ? "Submitting..." : "Finalize Score"}
      </Button>
    </form>
  );
}
