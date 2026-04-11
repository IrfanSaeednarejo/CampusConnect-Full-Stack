import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { updateAccountDetails } from "../../api/authApi";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const [bio, setBio] = useState("");
  const [department, setDepartment] = useState("");
  const [saving, setSaving] = useState(false);
  const maxBio = 250;

  const handleSkip = () => {
    navigate("/onboarding/notifications-setup");
  };

  const handleNext = async () => {
    // If user entered data, persist it to the backend
    if (bio || department) {
      setSaving(true);
      try {
        await updateAccountDetails({
          bio,
          department,
        });
        // Also update the local AuthContext so the UI reflects immediately
        updateUser({ department, bio });
      } catch (err) {
        console.error("Failed to save profile:", err);
        // Continue anyway — don't block onboarding
      } finally {
        setSaving(false);
      }
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
              <h1 className="text-xl font-bold text-text-primary">
                Set Up Your Profile
              </h1>
              <div className="group relative flex items-center">
                <span className="material-symbols-outlined cursor-help text-text-secondary">
                  help
                </span>
                <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded-md bg-surface border border-border px-3 py-1 text-xs text-text-primary transition-all duration-150 group-hover:scale-100">
                  You can update your details anytime in your profile settings.
                </div>
              </div>
            </div>
            <OnboardingProgress
              currentStep={2}
              totalSteps={4}
              textClassName="text-text-secondary text-sm font-normal"
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
              <h2 className="text-base font-medium text-text-primary">
                Profile Photo
              </h2>
              <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-border px-6 py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-text-secondary">
                  cloud_upload
                </span>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-lg font-bold text-text-primary">
                    Drag &amp; drop
                  </p>
                  <p className="text-sm text-text-secondary">or click to upload</p>
                </div>
                <button className="flex h-10 cursor-pointer items-center justify-center overflow-hidden rounded-lg bg-surface hover:bg-surface-hover border border-border px-4 text-sm font-bold text-text-primary transition-colors">
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
            submitText={saving ? "Saving..." : "Next"}
            cancelText="Skip"
            onSubmit={handleNext}
            onCancel={handleSkip}
            disabled={saving}
          />
        </div>
      </OnboardingCard>
    </OnboardingShell>
  );
}
