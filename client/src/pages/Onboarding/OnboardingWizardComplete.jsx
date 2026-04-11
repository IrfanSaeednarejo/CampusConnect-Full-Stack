import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { completeOnboarding as completeOnboardingRedux } from "../../redux/slices/authSlice";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { completeOnboarding as completeOnboardingApi } from "../../api/userApi";
import Button from "../../components/common/Button";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";

export default function OnboardingWizardComplete() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { role, user, completeOnboarding: completeOnboardingContext } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoToDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      // ✅ Persist onboarding completion to the DATABASE via API
      await completeOnboardingApi(user?.id, {
        roleSelected: role || "student",
        completedSteps: ["welcome", "profile-setup", "notifications-setup", "complete"],
      });

      // Update Redux and Context (in-memory) state
      dispatch(completeOnboardingRedux());
      completeOnboardingContext();

      // Route user to appropriate dashboard based on role
      const dashboards = {
        student: "/student/dashboard",
        mentor: "/mentor/dashboard",
        society_head: "/society/dashboard",
        admin: "/admin/dashboard",
      };

      const dashboardUrl = dashboards[role] || "/";
      navigate(dashboardUrl, { replace: true });
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // Even if the API call fails, still let the user proceed
      // and mark locally so they don't get stuck
      dispatch(completeOnboardingRedux());
      completeOnboardingContext();
      setError("Profile saved locally. Redirecting...");

      const dashboards = {
        student: "/student/dashboard",
        mentor: "/mentor/dashboard",
        society_head: "/society/dashboard",
        admin: "/admin/dashboard",
      };
      setTimeout(() => navigate(dashboards[role] || "/", { replace: true }), 1000);
    } finally {
      setLoading(false);
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
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
            <span className="material-symbols-outlined text-6xl text-primary">
              check
            </span>
          </div>

          {/* Headline + Body */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-text-primary">
              You're all set!
            </h1>
            <p className="max-w-xs text-base text-text-primary/80">
              Your profile is ready. Explore your dashboard to get started.
            </p>
          </div>

          {error && (
            <p className="text-sm text-yellow-600">{error}</p>
          )}

          {/* Go to Dashboard Button */}
          <div className="w-full pt-4">
            <Button
              onClick={handleGoToDashboard}
              variant="primary"
              className="w-full h-12 text-base"
              disabled={loading}
            >
              {loading ? "Setting up..." : "Go to Dashboard"}
            </Button>
          </div>
        </OnboardingCard>
      </main>
    </OnboardingShell>
  );
}
