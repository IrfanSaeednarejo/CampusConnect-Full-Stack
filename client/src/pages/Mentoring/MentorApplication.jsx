import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorTopBar from "../../components/mentoring/MentorTopBar";
import useHomeTheme from "@/hooks/useHomeTheme";

const APPLICATION_STEPS = [
  { id: 1, title: "Personal Info", icon: "person" },
  { id: 2, title: "Expertise", icon: "school" },
  { id: 3, title: "Documents", icon: "description" },
  { id: 4, title: "Review", icon: "done_all" },
];

export default function MentorApplication() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    expertise: "",
    yearsExperience: "",
    bio: "",
    hourlyRate: "",
    qualifications: "",
    documents: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    if (activeStep < 4) setActiveStep(activeStep + 1);
  };

  const handlePrevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  const handleSubmitApplication = () => {
    alert("Application submitted successfully!");
    navigate("/verification-pending");
  };

  const pageClass = isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light";
  const cardClass = isDark
    ? "bg-surface-dark border-border-dark"
    : "bg-white border-slate-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)]";
  const fieldClass = isDark
    ? "bg-background-dark text-text-primary-dark border-border-dark placeholder:text-text-secondary-dark"
    : "bg-slate-50 text-slate-900 border-slate-300 placeholder:text-slate-400";
  const mutedText = isDark ? "text-text-secondary-dark" : "text-slate-500";
  const primaryButton = "bg-primary text-white hover:bg-primary-hover";
  const softButton = isDark ? "bg-surface-muted-dark text-text-primary-dark hover:bg-surface-dark" : "bg-slate-100 text-slate-700 hover:bg-slate-200";

  return (
    <div className={`relative flex h-auto min-h-screen w-full flex-col font-display group/design-root overflow-x-hidden ${pageClass}`}>
      <div className="layout-container flex h-full grow flex-col">
        <MentorTopBar backPath="/mentor/dashboard" />

        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            <div className="mb-8">
              <h1 className={`text-4xl font-black leading-tight tracking-[-0.033em] mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                Become a Mentor
              </h1>
              <p className={`text-base font-normal leading-normal ${mutedText}`}>
                Share your expertise and help students grow
              </p>
            </div>

            <div className="mb-10">
              <div className="flex justify-between mb-6">
                {APPLICATION_STEPS.map((step) => (
                  <div key={step.id} className="flex flex-col items-center flex-1">
                    <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                        activeStep >= step.id
                          ? "bg-primary text-white"
                          : isDark
                            ? "bg-border-dark text-text-secondary-dark"
                            : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      <span className="material-symbols-outlined">{step.icon}</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        activeStep >= step.id ? (isDark ? "text-white" : "text-slate-900") : mutedText
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className={`h-2 rounded-full overflow-hidden ${isDark ? "bg-border-dark" : "bg-slate-200"}`}>
                <div className="h-full bg-primary transition-all" style={{ width: `${(activeStep / 4) * 100}%` }} />
              </div>
            </div>

            <div className={`p-8 border rounded-xl mb-6 ${cardClass}`}>
              {activeStep === 1 && (
                <div className="space-y-6">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>
                    Personal Information
                  </h2>
                  <div>
                    <label className={`block font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className={`w-full rounded-xl border p-3 text-sm transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${fieldClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={`w-full rounded-xl border p-3 text-sm transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${fieldClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Bio *</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className={`w-full resize-none rounded-xl border p-3 text-sm transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${fieldClass}`}
                      rows="4"
                    />
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Your Expertise</h2>
                  <div>
                    <label className={`block font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Main Expertise *</label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      placeholder="e.g., Web Development, Data Science..."
                      className={`w-full rounded-xl border p-3 text-sm transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${fieldClass}`}
                    />
                  </div>
                  <div>
                    <label className={`block font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Years of Experience *</label>
                    <select
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      className={`w-full rounded-xl border p-3 text-sm transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${fieldClass}`}
                    >
                      <option value="">Select years of experience</option>
                      <option value="0-2">0-2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Hourly Rate ($) *</label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="50"
                      className={`w-full rounded-xl border p-3 text-sm transition-colors duration-150 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15 ${fieldClass}`}
                    />
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-6">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Supporting Documents</h2>
                  <div className={`rounded-xl border-2 border-dashed p-6 text-center ${isDark ? "border-border-dark bg-background-dark" : "border-slate-300 bg-slate-50"}`}>
                    <span className={`material-symbols-outlined text-5xl mb-3 inline-block ${mutedText}`}>upload_file</span>
                    <p className={`font-semibold mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>Upload your credentials</p>
                    <p className={`text-sm mb-4 ${mutedText}`}>PDF, DOC, or IMAGE files up to 5MB</p>
                    <input
                      type="file"
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          documents: e.target.files[0],
                        }))
                      }
                      className="hidden"
                      id="fileInput"
                    />
                    <button
                      onClick={() => document.getElementById("fileInput").click()}
                      className={`rounded-xl px-6 py-2 text-sm font-semibold transition-colors duration-150 ${primaryButton}`}
                    >
                      Select File
                    </button>
                  </div>
                  {formData.documents && (
                    <div className={`flex items-center gap-2 rounded-xl p-3 ${isDark ? "border border-border-dark bg-background-dark" : "border border-slate-200 bg-slate-50"}`}>
                      <span className="material-symbols-outlined text-primary">check_circle</span>
                      <span className={isDark ? "text-white" : "text-slate-900"}>{formData.documents.name}</span>
                    </div>
                  )}
                  <div className={`rounded-xl p-4 ${isDark ? "border border-border-dark bg-background-dark" : "border border-slate-200 bg-slate-50"}`}>
                    <p className={`text-sm ${mutedText}`}>
                      We accept certificates, degrees, or work experience documents
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-6">
                  <h2 className={`text-2xl font-bold mb-6 ${isDark ? "text-white" : "text-slate-900"}`}>Review Your Application</h2>
                  <div className="space-y-4">
                    {[
                      ["Full Name", formData.fullName || "Not provided"],
                      ["Email", formData.email || "Not provided"],
                      ["Expertise", formData.expertise || "Not provided"],
                      ["Hourly Rate", `$${formData.hourlyRate || "0"}/hour`],
                    ].map(([label, value]) => (
                      <div key={label} className={`rounded-xl p-4 ${isDark ? "border border-border-dark bg-background-dark" : "border border-slate-200 bg-slate-50"}`}>
                        <p className={`text-sm mb-1 ${mutedText}`}>{label}</p>
                        <p className={`font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-info/20 bg-info/5 p-4 dark:border-info/25 dark:bg-info/10">
                    <p className="font-semibold text-info">All information verified and ready to submit</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4">
              <button
                onClick={handlePrevStep}
                disabled={activeStep === 1}
                className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors ${
                  activeStep === 1
                    ? isDark
                      ? "bg-border-dark text-text-secondary-dark cursor-not-allowed"
                      : "bg-slate-200 text-slate-400 cursor-not-allowed"
                    : isDark
                      ? softButton
                      : softButton
                }`}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Previous
              </button>
              {activeStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  className={`flex flex-1 items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors duration-150 ${primaryButton}`}
                >
                  Next
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmitApplication}
                  className={`flex flex-1 items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors duration-150 ${primaryButton}`}
                >
                  <span className="material-symbols-outlined">check</span>
                  Submit Application
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
