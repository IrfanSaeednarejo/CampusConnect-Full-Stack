import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerAsMentorThunk, selectMentoringActionLoading } from "../../redux/slices/mentoringSlice";
import { useAuth } from "../../contexts/AuthContext";

export default function MentorRegistration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectMentoringActionLoading);
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    bio: "",
    expertiseStr: "",
    category: "technical",
    hourlyRate: 0,
    currency: "PKR",
  });
  const [errorText, setErrorText] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    setErrorText("");
    if (currentStep === 1 && !formData.bio.trim()) {
      setErrorText("Bio is required.");
      return;
    }
    if (currentStep === 2 && !formData.expertiseStr.trim()) {
      setErrorText("At least one area of expertise is required.");
      return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setErrorText("");
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setErrorText("");
    const expertiseArray = formData.expertiseStr
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const payload = {
      bio: formData.bio,
      expertise: expertiseArray,
      categories: [formData.category],
      hourlyRate: Number(formData.hourlyRate),
      currency: formData.currency,
    };

    try {
      await dispatch(registerAsMentorThunk(payload)).unwrap();
      navigate("/dashboard");
    } catch (err) {
      setErrorText(err || "Failed to submit application");
    }
  };

  const progressPercentage = useMemo(() => (currentStep / 3) * 100, [currentStep]);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-4 lg:px-10 py-10">
      <div className="flex flex-col w-full max-w-4xl mx-auto gap-8">
        
        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <p className="text-[#e6edf3] text-3xl font-bold tracking-tight">Become a Mentor</p>
          <p className="text-[#8b949e] text-base">Share your expertise and guide students towards success.</p>
        </div>

        {/* Progress Bar */}
        <div className="flex flex-col gap-3">
          <div className="flex w-full justify-between px-2 text-sm font-medium">
            <span className={currentStep >= 1 ? "text-white" : "text-[#8b949e]"}>1. Personal Bio</span>
            <span className={currentStep >= 2 ? "text-white" : "text-[#8b949e]"}>2. Specialization</span>
            <span className={currentStep >= 3 ? "text-white" : "text-[#8b949e]"}>3. Pricing & Review</span>
          </div>
          <div className="rounded-full bg-[#21262d] h-2 overflow-hidden">
            <div className="h-full bg-[#3fb950] transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>

        {errorText && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-md text-red-500 text-sm">
            {errorText}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Container */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <div className="flex flex-col gap-6 rounded-xl border border-[#30363d] bg-[#161b22] p-6 lg:p-8">
              
              {/* Step 1: Bio */}
              {currentStep === 1 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="text-xl font-bold text-white mb-2">Step 1: Introduction</h3>
                  <label className="flex flex-col gap-2">
                    <p className="text-[#e6edf3] text-sm font-medium">Professional Bio</p>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      className="form-input flex w-full min-w-0 resize-none rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#3fb950] border border-[#30363d] bg-[#0d1117] h-32 placeholder:text-[#8b949e] px-4 py-3 text-sm"
                      placeholder="Write a brief bio about yourself, your background, and what you aim to achieve as a mentor..."
                    />
                  </label>
                  <p className="text-xs text-[#8b949e]">Max 500 characters. Make a good first impression!</p>
                </div>
              )}

              {/* Step 2: Expertise */}
              {currentStep === 2 && (
                <div className="flex flex-col gap-4 animate-fadeIn">
                  <h3 className="text-xl font-bold text-white mb-2">Step 2: Areas of Expertise</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex flex-col gap-2 md:col-span-2">
                      <p className="text-[#e6edf3] text-sm font-medium">Primary Category</p>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="form-input flex w-full rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#3fb950] border border-[#30363d] bg-[#0d1117] h-10 px-3 text-sm appearance-none"
                      >
                        <option value="academic">Academic</option>
                        <option value="career">Career Guidance</option>
                        <option value="technical">Technical / Coding</option>
                        <option value="wellness">Wellness & Mental Health</option>
                        <option value="entrepreneurship">Entrepreneurship</option>
                        <option value="creative">Creative Arts</option>
                        <option value="professional">Professional Development</option>
                        <option value="other">Other</option>
                      </select>
                    </label>
                    
                    <label className="flex flex-col gap-2 md:col-span-2 mt-2">
                      <p className="text-[#e6edf3] text-sm font-medium">Specific Skills (Comma Separated)</p>
                      <input
                        type="text"
                        name="expertiseStr"
                        value={formData.expertiseStr}
                        onChange={handleInputChange}
                        className="form-input flex w-full rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#3fb950] border border-[#30363d] bg-[#0d1117] h-10 px-4 text-sm placeholder:text-[#8b949e]"
                        placeholder="e.g. React, Node.js, Resume Review, Interview Prep"
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Pricing */}
              {currentStep === 3 && (
                <div className="flex flex-col gap-6 animate-fadeIn">
                  <h3 className="text-xl font-bold text-white mb-2">Step 3: Details & Confirmation</h3>
                  
                  <div className="grid grid-cols-2 gap-4 auto-cols-auto mb-2">
                    <label className="flex flex-col gap-2">
                      <p className="text-[#e6edf3] text-sm font-medium">Hourly Rate</p>
                      <input
                        type="number"
                        min="0"
                        name="hourlyRate"
                        value={formData.hourlyRate}
                        onChange={handleInputChange}
                        className="form-input flex w-full rounded-lg text-white focus:outline-none focus:ring-1 focus:ring-[#3fb950] border border-[#30363d] bg-[#0d1117] h-10 px-4 text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-2">
                      <p className="text-[#e6edf3] text-sm font-medium">Currency</p>
                      <input
                        type="text"
                        name="currency"
                        disabled
                        value={formData.currency}
                        className="form-input flex w-full rounded-lg text-[#8b949e] border border-[#30363d] bg-[#0d1117]/50 h-10 px-4 text-sm cursor-not-allowed"
                      />
                    </label>
                  </div>

                  <div className="border border-[#30363d] rounded-lg p-5 bg-[#0d1117]/50">
                    <h4 className="text-white font-semibold mb-3">Application Summary</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-[#8b949e]">Name:</span> <span className="text-white ml-2">{user?.profile?.firstName} {user?.profile?.lastName}</span></p>
                      <p><span className="text-[#8b949e]">Category:</span> <span className="text-white ml-2 capitalize">{formData.category}</span></p>
                      <p><span className="text-[#8b949e]">Skills:</span> <span className="text-white ml-2">{formData.expertiseStr}</span></p>
                      <p><span className="text-[#8b949e]">Rate:</span> <span className="text-white ml-2">{formData.hourlyRate == 0 ? 'Free' : `${formData.currency} ${formData.hourlyRate}/hr`}</span></p>
                    </div>
                  </div>
                  <p className="text-[#8b949e] text-xs">
                    By submitting, your profile will be sent to campus administrators for verification. You will be notified once approved.
                  </p>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={() => navigate("/dashboard")}
                className="text-sm font-medium text-[#8b949e] hover:text-[#e6edf3] transition-colors"
              >
                Cancel
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 1 || loading}
                  className="px-5 py-2 h-10 rounded-lg bg-[#21262d] text-white text-sm font-semibold hover:bg-[#30363d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Back
                </button>
                <button
                  onClick={currentStep === 3 ? handleSubmit : handleNext}
                  disabled={loading}
                  className="px-6 py-2 h-10 rounded-lg bg-[#238636] text-white text-sm font-semibold hover:bg-[#2ea043] transition-colors disabled:opacity-50 flex items-center justify-center min-w-[100px]"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : currentStep === 3 ? (
                    "Submit Application"
                  ) : (
                    "Next Step"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Info Aside */}
          <aside className="lg:col-span-1">
            <div className="flex flex-col gap-4 rounded-xl border border-[#30363d] bg-[#161b22] p-6 sticky top-6">
              <div className="w-10 h-10 rounded-lg bg-[#e3b341]/10 flex items-center justify-center mb-2">
                <span className="material-symbols-outlined text-[#e3b341]">verified</span>
              </div>
              <h4 className="text-white text-base font-bold">Verification Process</h4>
              <p className="text-[#8b949e] text-sm leading-relaxed">
                To maintain the quality of our mentorship program, all applications are manually reviewed by campus administrators.
              </p>
              <ul className="text-[#8b949e] text-sm mt-2 space-y-3">
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3fb950] shrink-0">check_circle</span>
                  Ensure your bio is professional and detailed.
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3fb950] shrink-0">check_circle</span>
                  List actionable skills that you can teach others.
                </li>
                <li className="flex gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3fb950] shrink-0">check_circle</span>
                  Applications are typically reviewed within 48 hours.
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
