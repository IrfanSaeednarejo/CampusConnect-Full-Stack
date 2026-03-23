import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../../redux/slices/userSlice";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [bio, setBio] = useState("");
  const [department, setDepartment] = useState("");
  const maxBio = 250;

  const handleSkip = () => {
    navigate("/onboarding/notifications-setup");
  };

  const handleNext = () => {
    // Save profile data to Redux
    if (bio || department) {
      dispatch(updateUserProfile({
        bio,
        department,
      }));
    }
    navigate("/onboarding/notifications-setup");
  };

  return (
    <OnboardingShell className="relative w-full flex-col">
      <OnboardingCard className="w-full max-w-2xl rounded-xl" padding="p-6 md:p-8">
        <div className="flex flex-col gap-8">
          {/* Header and Progress Bar */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[#e6edf3]">
                Set Up Your Profile
              </h1>
              <div className="group relative flex items-center">
                <span className="material-symbols-outlined cursor-help text-[#8b949e]">
                  help
                </span>
                <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded-md bg-gray-900 px-3 py-1 text-xs text-white transition-all duration-150 group-hover:scale-100">
                  You can update your details anytime in your profile settings.
                </div>
              </div>
            </div>
            <OnboardingProgress
              currentStep={2}
              totalSteps={4}
              textClassName="text-[#8b949e] text-sm font-normal"
            />
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            {/* Major/Department */}
            <FormField
              label="Add your major/department"
              name="department"
              type="select"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            >
              <option value="">e.g., Computer Science</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Business Administration">Business Administration</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Fine Arts">Fine Arts</option>
            </FormField>

            {/* Profile Photo */}
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-medium text-[#e6edf3]">
                Profile Photo
              </h2>
              <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-[#30363d] px-6 py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-[#8b949e]">
                  cloud_upload
                </span>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-lg font-bold text-[#e6edf3]">
                    Drag &amp; drop
                  </p>
                  <p className="text-sm text-[#8b949e]">or click to upload</p>
                </div>
                <button className="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-gray-700 px-4 text-sm font-bold text-[#e6edf3] transition-colors hover:bg-gray-600">
                  <span>Upload Photo</span>
                </button>
              </div>
            </div>

            {/* Short Bio */}
            <FormField
              label="Short Bio"
              name="bio"
              type="textarea"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a bit about yourself..."
              maxLength={maxBio}
              helpText={`${bio.length}/${maxBio}`}
              rows={6}
            />
          </div>

          {/* Action Buttons */}
          <FormActions
            submitText="Next"
            cancelText="Skip"
            onSubmit={handleNext}
            onCancel={handleSkip}
          />
        </div>
      </OnboardingCard>
    </OnboardingShell>
  );
}
