import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import Button from "../../components/common/Button";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";

export default function OnboardingWizardComplete() {
  const navigate = useNavigate();
  const { role, user, completeOnboarding } = useAuth();
  const { showSuccess } = useNotification();

  const handleGoToDashboard = async () => {
    try {
      // Mark onboarding as complete in Backend, Redux and Context
      await completeOnboarding({ 
        isComplete: true, 
        completedSteps: ['welcome', 'profile', 'notifications', 'complete'],
        roleSelected: role || 'student'
      });

      showSuccess(`Welcome to CampusConnect, ${user?.profile?.firstName || 'User'}!`);
      
      // All users go to the unified dashboard
      navigate("/dashboard", { replace: true });
    } catch (err) {
      console.error("Onboarding completion failed:", err);
    }
  };

  return (
    <OnboardingShell>
      <main className="flex w-full max-w-lg flex-col items-center justify-center">
        <OnboardingCard className="flex w-full flex-col items-center gap-8" padding="p-6 sm:p-10">
          {/* Wizard Progress Bar */}
          <div className="w-full">
            <OnboardingProgress
              currentStep={4}
              totalSteps={4}
              label="Step 4 of 4: Complete"
              className="mt-0"
            />
          </div>

          {/* Large Icon */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#238636]/20">
            <span className="material-symbols-outlined text-6xl text-[#238636]">
              check
            </span>
          </div>

          {/* Headline + Body */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-[#c9d1d9]">
              You're all set!
            </h1>
            <p className="max-w-xs text-base text-[#c9d1d9]/80">
              Your profile is ready. Explore your dashboard to get started.
            </p>
          </div>

          {/* Go to Dashboard Button */}
          <div className="w-full pt-4">
            <Button
              onClick={handleGoToDashboard}
              variant="primary"
              className="w-full h-12 text-base"
            >
              Go to Dashboard
            </Button>
          </div>
        </OnboardingCard>
      </main>
    </OnboardingShell>
  );
}
