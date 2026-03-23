import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

const APPLICATION_STEPS = [
  { id: 1, title: "Personal Info", icon: "person" },
  { id: 2, title: "Expertise", icon: "school" },
  { id: 3, title: "Documents", icon: "description" },
  { id: 4, title: "Review", icon: "done_all" },
];

export default function MentorApplication() {
  const navigate = useNavigate();
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
    if (activeStep < 4) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmitApplication = () => {
    alert("Application submitted successfully!");
    navigate("/verification-pending");
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                Become a Mentor
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                Share your expertise and help students grow
              </p>
            </div>

            {/* Progress Indicator */}
            <div className="mb-10">
              <div className="flex justify-between mb-6">
                {APPLICATION_STEPS.map((step) => (
                  <div
                    key={step.id}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${
                        activeStep >= step.id
                          ? "bg-[#1dc964] text-[#112118]"
                          : "bg-[#30363d] text-[#9eb7a9]"
                      }`}
                    >
                      <span className="material-symbols-outlined">
                        {step.icon}
                      </span>
                    </div>
                    <span
                      className={`text-sm font-medium ${activeStep >= step.id ? "text-white" : "text-[#9eb7a9]"}`}
                    >
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
              <div className="h-2 bg-[#30363d] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#1dc964] transition-all"
                  style={{ width: `${(activeStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-8 bg-[#161b22] border border-[#30363d] rounded-xl mb-6">
              {activeStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-white text-2xl font-bold mb-6">
                    Personal Information
                  </h2>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none placeholder:text-[#9eb7a9]"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none placeholder:text-[#9eb7a9]"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Bio *
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself..."
                      className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none placeholder:text-[#9eb7a9] resize-none"
                      rows="4"
                    ></textarea>
                  </div>
                </div>
              )}

              {activeStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-white text-2xl font-bold mb-6">
                    Your Expertise
                  </h2>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Main Expertise *
                    </label>
                    <input
                      type="text"
                      name="expertise"
                      value={formData.expertise}
                      onChange={handleInputChange}
                      placeholder="e.g., Web Development, Data Science..."
                      className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none placeholder:text-[#9eb7a9]"
                    />
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Years of Experience *
                    </label>
                    <select
                      name="yearsExperience"
                      value={formData.yearsExperience}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none"
                    >
                      <option value="">Select years of experience</option>
                      <option value="0-2">0-2 years</option>
                      <option value="2-5">2-5 years</option>
                      <option value="5-10">5-10 years</option>
                      <option value="10+">10+ years</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-white font-semibold mb-2">
                      Hourly Rate ($) *
                    </label>
                    <input
                      type="number"
                      name="hourlyRate"
                      value={formData.hourlyRate}
                      onChange={handleInputChange}
                      placeholder="50"
                      className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none placeholder:text-[#9eb7a9]"
                    />
                  </div>
                </div>
              )}

              {activeStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-white text-2xl font-bold mb-6">
                    Supporting Documents
                  </h2>
                  <div className="p-6 border-2 border-dashed border-[#30363d] rounded-lg text-center">
                    <span className="material-symbols-outlined text-5xl text-[#9eb7a9] mb-3 inline-block">
                      upload_file
                    </span>
                    <p className="text-white font-semibold mb-2">
                      Upload your credentials
                    </p>
                    <p className="text-[#9eb7a9] text-sm mb-4">
                      PDF, DOC, or IMAGE files up to 5MB
                    </p>
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
                      onClick={() =>
                        document.getElementById("fileInput").click()
                      }
                      className="px-6 py-2 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Select File
                    </button>
                  </div>
                  {formData.documents && (
                    <div className="p-3 bg-[#0d1117] rounded-lg flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#1dc964]">
                        check_circle
                      </span>
                      <span className="text-white">
                        {formData.documents.name}
                      </span>
                    </div>
                  )}
                  <div className="p-4 bg-[#0d1117] rounded-lg">
                    <p className="text-[#9eb7a9] text-sm">
                      💡 We accept certificates, degrees, or work experience
                      documents
                    </p>
                  </div>
                </div>
              )}

              {activeStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-white text-2xl font-bold mb-6">
                    Review Your Application
                  </h2>
                  <div className="space-y-4">
                    <div className="p-4 bg-[#0d1117] rounded-lg">
                      <p className="text-[#9eb7a9] text-sm mb-1">Full Name</p>
                      <p className="text-white font-semibold">
                        {formData.fullName || "Not provided"}
                      </p>
                    </div>
                    <div className="p-4 bg-[#0d1117] rounded-lg">
                      <p className="text-[#9eb7a9] text-sm mb-1">Email</p>
                      <p className="text-white font-semibold">
                        {formData.email || "Not provided"}
                      </p>
                    </div>
                    <div className="p-4 bg-[#0d1117] rounded-lg">
                      <p className="text-[#9eb7a9] text-sm mb-1">Expertise</p>
                      <p className="text-white font-semibold">
                        {formData.expertise || "Not provided"}
                      </p>
                    </div>
                    <div className="p-4 bg-[#0d1117] rounded-lg">
                      <p className="text-[#9eb7a9] text-sm mb-1">Hourly Rate</p>
                      <p className="text-white font-semibold">
                        ${formData.hourlyRate || "0"}/hour
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-[#1dc964]/10 border border-[#1dc964] rounded-lg">
                    <p className="text-[#1dc964] font-semibold">
                      ✓ All information verified and ready to submit
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handlePrevStep}
                disabled={activeStep === 1}
                className={`flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors ${
                  activeStep === 1
                    ? "bg-[#30363d] text-[#9eb7a9] cursor-not-allowed"
                    : "bg-[#30363d] text-white hover:bg-[#404851]"
                }`}
              >
                <span className="material-symbols-outlined">arrow_back</span>
                Previous
              </button>
              {activeStep < 4 ? (
                <button
                  onClick={handleNextStep}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity flex-1"
                >
                  Next
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                </button>
              ) : (
                <button
                  onClick={handleSubmitApplication}
                  className="flex items-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity flex-1"
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
