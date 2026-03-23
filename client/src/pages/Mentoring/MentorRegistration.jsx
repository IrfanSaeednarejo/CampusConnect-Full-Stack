import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";

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

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] bg-[#0d1117] overflow-x-hidden">
      {/* TopNavBar */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#30363d] px-10 py-3">
        <div className="flex items-center gap-4">
          <div className="size-6 text-[#238636]">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                fill="currentColor"
              ></path>
            </svg>
          </div>
          <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
            CampusConnect
          </h2>
        </div>

        <div className="flex flex-1 justify-end gap-8">
          <div className="flex items-center gap-9">
            <a
              href="/events"
              className="text-white text-sm font-medium leading-normal"
            >
              Events
            </a>
            <a
              href="#"
              className="text-white text-sm font-medium leading-normal"
            >
              Mentors
            </a>
            <a
              href="#"
              className="text-white text-sm font-medium leading-normal"
            >
              Networking
            </a>
            <a
              href="#"
              className="text-white text-sm font-medium leading-normal"
            >
              Societies
            </a>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => navigate("/signup")}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#238636] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Sign Up</span>
            </button>
            <button
              onClick={() => navigate("/login")}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#161b22] text-white text-sm font-bold leading-normal tracking-[0.015em]"
            >
              <span className="truncate">Log In</span>
            </button>
          </div>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ7TIKlVGpDEXB29COR5tJCLcIMOmhyaboLy69WfRQwPw_watuTV5XeUvDYTxhHbp8fzqLJxZDUS4cwwWWWYSgrhFIO_UAlqCtSEs766mr_SRn6u4NLQR7dnhRBYsq3_LFlq8xMTDMwlPs9jLeNLd_6p8ARGh3Evf7EVGqdsa3FzsSWeXUGa77evqMsOGzSKnpdpgx3fN8FrYs0s6ocMZocM1ZmH-GRCOGjEgAcYdxzkEiPwSpDBV6VP2inmcWIxgNjs299f1nRCU"
            size="10"
          />
        </div>
      </header>

      <div className="layout-container flex h-full grow flex-col">
        <main className="px-4 lg:px-10 flex flex-1 justify-center py-10">
          <div className="layout-content-container flex flex-col w-full max-w-5xl flex-1 gap-8">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                  Mentor Registration
                </p>
                <p className="text-[#c9d1d9] text-base font-normal leading-normal">
                  Share your expertise and help students succeed on campus.
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex flex-col gap-3">
              <div className="flex w-full justify-between px-2 text-sm font-medium text-[#c9d1d9]">
                <span
                  className={currentStep >= 1 ? "text-white" : "text-[#8b949e]"}
                >
                  1. Personal Info
                </span>
                <span
                  className={currentStep >= 2 ? "text-white" : "text-[#8b949e]"}
                >
                  2. Expertise
                </span>
                <span
                  className={currentStep >= 3 ? "text-white" : "text-[#8b949e]"}
                >
                  3. Profile Details
                </span>
                <span
                  className={currentStep >= 4 ? "text-white" : "text-[#8b949e]"}
                >
                  4. Review
                </span>
              </div>
              <div className="rounded bg-[#161b22] h-2">
                <div
                  className="h-2 rounded bg-[#238636]"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Container */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <div className="flex flex-col gap-6 rounded-lg border border-[#30363d] bg-[#161b22] p-6">
                  <h3 className="text-xl font-bold text-white">
                    {currentStep === 1 && "Step 1: Personal Information"}
                    {currentStep === 2 && "Step 2: Expertise"}
                    {currentStep === 3 && "Step 3: Profile Details"}
                    {currentStep === 4 && "Step 4: Review & Submit"}
                  </h3>

                  {/* Step 1: Personal Info */}
                  {currentStep === 1 && (
                    <div className="flex flex-col gap-4">
                      <label className="flex flex-col gap-2">
                        <p className="text-white text-sm font-medium">
                          Full Name
                        </p>
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#238636]/50 border border-[#30363d] bg-[#0d1117] focus:border-[#238636] h-12 placeholder:text-[#c9d1d9]/50 px-3 text-base font-normal leading-normal"
                          placeholder="Enter your full name"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <p className="text-white text-sm font-medium">Email</p>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#238636]/50 border border-[#30363d] bg-[#0d1117] focus:border-[#238636] h-12 placeholder:text-[#c9d1d9]/50 px-3 text-base font-normal leading-normal"
                          placeholder="Enter your email"
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <p className="text-white text-sm font-medium">
                          Phone Number
                        </p>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#238636]/50 border border-[#30363d] bg-[#0d1117] focus:border-[#238636] h-12 placeholder:text-[#c9d1d9]/50 px-3 text-base font-normal leading-normal"
                          placeholder="Enter your phone number"
                        />
                      </label>
                    </div>
                  )}

                  {/* Step 2: Expertise */}
                  {currentStep === 2 && (
                    <div className="flex flex-col gap-4">
                      <label className="flex flex-col gap-2">
                        <p className="text-white text-sm font-medium">
                          Areas of Expertise
                        </p>
                        <textarea
                          name="expertise"
                          value={formData.expertise}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#238636]/50 border border-[#30363d] bg-[#0d1117] focus:border-[#238636] h-32 placeholder:text-[#c9d1d9]/50 px-3 py-3 text-base font-normal leading-normal"
                          placeholder="List your areas of expertise (e.g., Python, Data Science, Web Development)"
                        />
                      </label>
                      <p className="text-sm text-[#8b949e]">
                        Separate multiple areas with commas
                      </p>
                    </div>
                  )}

                  {/* Step 3: Profile Details */}
                  {currentStep === 3 && (
                    <div className="flex flex-col gap-4">
                      <label className="flex flex-col gap-2">
                        <p className="text-white text-sm font-medium">Bio</p>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#238636]/50 border border-[#30363d] bg-[#0d1117] focus:border-[#238636] h-32 placeholder:text-[#c9d1d9]/50 px-3 py-3 text-base font-normal leading-normal"
                          placeholder="Write a brief bio about yourself..."
                        />
                      </label>
                      <label className="flex flex-col gap-2">
                        <p className="text-white text-sm font-medium">
                          Availability
                        </p>
                        <select
                          name="availability"
                          value={formData.availability}
                          onChange={handleInputChange}
                          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#238636]/50 border border-[#30363d] bg-[#0d1117] focus:border-[#238636] h-12 placeholder:text-[#c9d1d9]/50 px-3 text-base font-normal leading-normal"
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
                      <div className="border border-[#30363d] rounded-lg p-4">
                        <h4 className="text-white font-bold mb-4">
                          Review Your Information
                        </h4>
                        <div className="space-y-3 text-sm">
                          <p>
                            <span className="text-[#8b949e]">Full Name:</span>{" "}
                            <span className="text-white">
                              {formData.fullName || "Not provided"}
                            </span>
                          </p>
                          <p>
                            <span className="text-[#8b949e]">Email:</span>{" "}
                            <span className="text-white">
                              {formData.email || "Not provided"}
                            </span>
                          </p>
                          <p>
                            <span className="text-[#8b949e]">Phone:</span>{" "}
                            <span className="text-white">
                              {formData.phone || "Not provided"}
                            </span>
                          </p>
                          <p>
                            <span className="text-[#8b949e]">Expertise:</span>{" "}
                            <span className="text-white">
                              {formData.expertise || "Not provided"}
                            </span>
                          </p>
                          <p>
                            <span className="text-[#8b949e]">
                              Availability:
                            </span>{" "}
                            <span className="text-white capitalize">
                              {formData.availability || "Not provided"}
                            </span>
                          </p>
                        </div>
                      </div>
                      <p className="text-[#8b949e] text-sm">
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
                    className="text-sm font-bold leading-normal tracking-[0.015em] text-white hover:text-[#238636]"
                  >
                    Cancel
                  </button>
                  <div className="flex gap-4">
                    <button
                      onClick={handleBack}
                      disabled={currentStep === 1}
                      className={`flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#161b22] border border-[#30363d] text-white text-sm font-bold leading-normal tracking-[0.015em] ${
                        currentStep === 1
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-[#21262d]"
                      }`}
                    >
                      <span className="truncate">Back</span>
                    </button>
                    <button
                      onClick={
                        currentStep === 4
                          ? () => navigate("/mentor-dashboard")
                          : handleNext
                      }
                      className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-[#238636] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#2ea043]"
                    >
                      <span className="truncate">
                        {currentStep === 4 ? "Submit" : "Next"}
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Info Box */}
              <aside className="lg:col-span-1">
                <div className="flex flex-1 flex-col items-start justify-between gap-4 rounded-lg border border-[#30363d] bg-[#161b22] p-5">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white">
                      info
                    </span>
                    <p className="text-white text-base font-bold leading-tight">
                      Application Review
                    </p>
                  </div>
                  <p className="text-[#c9d1d9] text-sm font-normal leading-normal">
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
