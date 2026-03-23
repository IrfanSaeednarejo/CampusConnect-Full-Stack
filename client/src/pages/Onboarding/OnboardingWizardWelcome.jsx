import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";

export default function OnboardingWizardWelcome() {
  const navigate = useNavigate();

  const handleStart = () => {
    // Navigate to the next onboarding step (Profile Setup)
    navigate("/onboarding/profile-setup");
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
            Nice to meet you!
          </h1>
          <p className="mt-3 text-[#8b949e] text-base font-normal leading-normal">
            Let’s personalize your experience on CampusConnect.
          </p>
        </div>

        {/* Start Button */}
        <div className="w-full max-w-xs">
          <Button
            onClick={handleStart}
            variant="primary"
            className="w-full h-12 text-base"
          >
            Start
          </Button>
        </div>
      </div>
    </OnboardingShell>
  );
}
