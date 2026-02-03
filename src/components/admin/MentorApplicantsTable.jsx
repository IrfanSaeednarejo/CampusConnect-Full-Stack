import React from "react";

export default function MentorApplicantsTable({ applicants, onReview }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-dark bg-card-dark">
      <table className="min-w-full text-sm">
        <thead className="bg-surface-dark text-text-secondary-dark">
          <tr>
            <th className="px-6 py-4 font-medium">Name</th>
            <th className="px-6 py-4 font-medium">Expertise</th>
            <th className="px-6 py-4 font-medium">Date Applied</th>
            <th className="px-6 py-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="text-text-primary-dark">
          {applicants.map((applicant, idx) => (
            <tr
              key={idx}
              className="border-b border-border-dark hover:bg-surface-dark/60 transition-colors"
            >
              <td className="px-6 py-4 font-medium">{applicant.name}</td>
              <td className="px-6 py-4">{applicant.expertise}</td>
              <td className="px-6 py-4">{applicant.date}</td>
              <td className="px-6 py-4">
                <button
                  className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90"
                  onClick={() => onReview(applicant)}
                >
                  Review
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
