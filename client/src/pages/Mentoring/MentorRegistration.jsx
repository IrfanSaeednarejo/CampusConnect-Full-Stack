import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import { applyAsMentor } from "../../api/mentoringApi";

export default function MentorRegistration() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    expertise: [],
    bio: "",
    availability: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = useMemo(
    () => (currentStep / 4) * 100,
    [currentStep]
  );

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);

      const payload = {
        bio: formData.bio,
        expertise: typeof formData.expertise === 'string'
          ? formData.expertise.split(',').map(s => s.trim()).filter(Boolean)
          : formData.expertise,
        categories: ["technical"], // Default for now
        hourlyRate: 0,
        currency: "PKR",
        availability: [], // They will set this on the next page
      };

      if (!payload.expertise.length) {
        throw new Error("Please enter at least one area of expertise.");
      }

      console.log("[MentorRegistration] Submitting payload:", payload);
      const response = await applyAsMentor(payload);
      console.log("[MentorRegistration] Success response:", response);
      navigate("/mentor/dashboard");
    } catch (err) {
      console.error("[MentorRegistration] Full error object:", err);
      // Extract message from various error shapes
      const errorMessage =
        err?.response?.data?.message ||    // Axios error with backend response
        err?.data?.message ||              // Already unwrapped by API layer
        err?.message ||                    // Standard error or ApiError
        "Something went wrong. Please try again.";
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-text-primary bg-background overflow-x-hidden">


      <div className="layout-container flex h-full grow flex-col">
        <main className="px-4 lg:px-10 flex flex-1 justify-center py-10">
          <div className="layout-content-container flex flex-col w-full max-w-5xl flex-1 gap-8">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-text-primary text-4xl font-black leading-tight tracking-[-0.033em]">
                  Mentor Registration
                </p>
                <p className="text-text-primary text-base font-normal leading-normal">
                  Share your expertise and help students succeed on campus.
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex w-full justify-between px-2 text-sm font-medium text-text-primary">
                <span
                  className={currentStep >= 1 ? "text-text-primary" : "text-text-secondary"}
                >
                  1. Personal Info
                </span>
                <span
                  className={currentStep >= 2 ? "text-text-primary" : "text-text-secondary"}
                >
                  2. Expertise
                </span>
                <span
                  className={currentStep >= 3 ? "text-text-primary" : "text-text-secondary"}
                >
                  3. Profile Details
                </span>
                <span
                  className={currentStep >= 4 ? "text-text-primary" : "text-text-secondary"}
                >
                  4. Review
                </span>
              </div>
              <div className="rounded bg-surface h-2">
                <div
                  className="h-2 rounded bg-primary"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Container */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex flex-col gap-6 rounded-lg border border-border bg-surface p-6">
                  <h3 className="text-xl font-bold text-text-primary">
                    {currentStep === 1 && "Step 1: Personal Information"}
                    {currentStep === 2 && "Step 2: Expertise"}
                    {currentStep === 3 && "Step 3: Profile Details"}
                    {currentStep === 4 && "Step 4: Review & Submit"}
                  </h3>

                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="flex flex-col gap-4">
                      <label className="flex flex-col gap-2">
                        <p className="text-text-primary text-sm font-medium">
                          Full Name
                        </p>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-12 placeholder:text-text-primary/50 px-3 text-base font-normal leading-normal"
                          placeholder="Enter your full name"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <p className="text-text-primary text-sm font-medium">Email</p>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-12 placeholder:text-text-primary/50 px-3 text-base font-normal leading-normal"
                          placeholder="Enter your email"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <p className="text-text-primary text-sm font-medium">
                          Phone Number
                        </p>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-12 placeholder:text-text-primary/50 px-3 text-base font-normal leading-normal"
                          placeholder="Enter your phone number"
                        />
                      </label>
                    </div>
                  )}

                  {/* Step 2: Expertise */}
                  {currentStep === 2 && (
                    <div className="flex flex-col gap-4">
                      <label className="flex flex-col gap-2">
                        <p className="text-text-primary text-sm font-medium">
                          Areas of Expertise
                        </p>
                        <textarea
                          name="expertise"
                          value={formData.expertise}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-32 placeholder:text-text-primary/50 px-3 py-3 text-base font-normal leading-normal"
                          placeholder="List your areas of expertise (e.g., Python, Data Science, Web Development)"
                        />
                      </label>
                      <p className="text-sm text-text-secondary">
                        Separate multiple areas with commas
                      </p>
                    </div>
                  )}

                  {/* Step 3: Profile Details */}
                  {currentStep === 3 && (
                    <div className="flex flex-col gap-4">
                      <label className="flex flex-col gap-2">
                        <p className="text-text-primary text-sm font-medium">Bio</p>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-32 placeholder:text-text-primary/50 px-3 py-3 text-base font-normal leading-normal"
                          placeholder="Write a brief bio about yourself..."
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <p className="text-text-primary text-sm font-medium">
                          Availability
                        </p>
                        <select
                          name="availability"
                          value={formData.availability}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-border bg-background focus:border-primary h-12 placeholder:text-text-primary/50 px-3 text-base font-normal leading-normal"
                        >
                          <option value="">Select your availability</option>
                          <option value="weekdays">Weekdays</option>
                          <option value="weekends">Weekends</option>
                          <option value="flexible">Flexible</option>
                        </select>
                      </label>
                    </div>
                  )}

                  {/* Step 4: Review */}
                  {currentStep === 4 && (
                    <div className="flex flex-col gap-6">
                      <div className="border border-border rounded-lg p-4">
                        <h4 className="text-text-primary font-bold mb-4">
                          Review Your Information
                        </h4>
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="text-text-secondary">Full Name:</span>{" "}
                            <span className="text-text-primary">
                              {formData.fullName || "Not provided"}
                            </span>
                          </p>
                          <p>
                            <span className="text-text-secondary">Email:</span>{" "}
                            <span className="text-text-primary">
                              {formData.email || "Not provided"}
                            </span>
                          </p>
                          <p>
                            <span className="text-text-secondary">Phone:</span>{" "}
                            <span className="text-text-primary">
                              {formData.phone || "Not provided"}
                            </span>
                          </p>
                          <p>
                            <span className="text-text-secondary">Expertise:</span>{" "}
                            <span className="text-text-primary">
                              {formData.expertise || "Not provided"}
                            </span>
                          </p>
                          <p>
                            <span className="text-text-secondary">
                              Availability:
                            </span>{" "}
                            <span className="text-text-primary capitalize">
                              {formData.availability || "Not provided"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <p className="text-text-secondary text-sm">
                        By submitting this form, you agree to our mentorship
                        terms and privacy policy.
                      </p>
                    </div>
                  )}
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => navigate("/")}
                    className="text-sm font-bold leading-normal tracking-[0.015em] text-text-primary hover:text-primary"
                  >
                    Cancel
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 1 || submitting}
                      className={`flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-surface border border-border text-text-primary text-sm font-bold leading-normal tracking-[0.015em] ${currentStep === 1 || submitting
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-surface-hover"
                        }`}
                    >
                      <span className="truncate">Back</span>
                    </button>
                    <button
                      onClick={
                        currentStep === 4
                          ? handleSubmit
                          : handleNext
                      }
                      disabled={submitting}
                      className={`flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] ${submitting ? 'opacity-50' : 'hover:bg-primary-hover'}`}
                    >
                      <span className="truncate">
                        {submitting ? "Submitting..." : (currentStep === 4 ? "Submit" : "Next")}
                      </span>
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm mt-4">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                      <p className="font-medium">{error}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Box */}
              <aside className="lg:col-span-1">
                <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-lg border border-border bg-surface p-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-text-primary">
                      info
                    </span>
                    <p className="text-text-primary text-base font-bold leading-tight">
                      Application Review
                    </p>
                  </div>
                  <p className="text-text-primary text-sm font-normal leading-normal">
                    All mentor applications are reviewed by campus admins before
                    approval.
                  </p>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
