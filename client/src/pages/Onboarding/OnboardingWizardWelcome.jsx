import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import Button from "../../components/common/Button";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import CampusSelector from "../../components/campus/CampusSelector";
import { useState } from "react";

export default function OnboardingWizardWelcome() {
  const navigate = useNavigate();
  const { user, completeOnboarding } = useAuth();
  const [selectedCampus, setSelectedCampus] = useState("");

  const handleStart = async () => {
    if (!selectedCampus || selectedCampus === "REQUEST_NEW") return;

    // Detect if the value is a MongoDB ObjectId (exists in DB) or a custom name (request)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(selectedCampus);

    try {
      const payload = { 
        completedSteps: ['welcome']
      };

      if (isObjectId) {
        payload.campusId = selectedCampus;
      } else {
        payload.requestedCampusName = selectedCampus;
      }

      await completeOnboarding(payload);
      // Navigate to the next onboarding step (Profile Setup)
      navigate("/onboarding/profile-setup");
    } catch (err) {
      console.error("Failed to start onboarding:", err);
      // Still navigate so user isn't stuck
      navigate("/onboarding/profile-setup");
    }
  };

  return (
    <OnboardingShell>
      <div className="flex w-full max-w-lg flex-col items-center justify-center text-center">
        {/* Progress Indicator */}
        <div className="mb-4">
          <OnboardingProgress
            currentStep={1}
            totalSteps={4}
            showBar={false}
            textClassName="text-[#8b949e] text-sm font-normal leading-normal"
          />
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-[#c9d1d9] text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
            Nice to meet you, <span className="text-[#58a6ff] capitalize">{user?.profile?.firstName || 'there'}!</span>
          </h1>
          <p className="mt-3 text-[#8b949e] text-base font-normal leading-normal">
            Let’s personalize your experience on CampusNexus.
          </p>
        </div>

        {/* Campus Selection */}
        <div className="w-full max-w-sm mb-8 text-left">
          <CampusSelector 
             value={selectedCampus} 
             onChange={setSelectedCampus} 
          />
        </div>

        {/* Start Button */}
        <div className="w-full max-w-xs">
          <Button
            onClick={handleStart}
            variant="primary"
            className="w-full h-12 text-base"
            disabled={!selectedCampus}
          >
            Start
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
