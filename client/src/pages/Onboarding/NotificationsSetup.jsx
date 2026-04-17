import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updatePreferencesThunk, completeOnboardingThunk } from "../../redux/slices/authSlice";
import FormActions from "../../components/common/FormActions";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingOptionRow from "../../components/onboarding/OnboardingOptionRow";

export default function NotificationsSetup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);

  const handleFinish = async () => {
    try {
      await dispatch(updatePreferencesThunk({
        notifications: {
          email: emailNotifications,
          push: smsReminders,
          inApp: emailNotifications || smsReminders,
          digest: emailNotifications
        }
      })).unwrap();

      // Update step progress
      await dispatch(completeOnboardingThunk({ completedSteps: ['welcome', 'profile', 'notifications'] })).unwrap();
    } catch (error) {
      console.error("Failed to update notification preferences:", error);
    }
    navigate("/onboarding/complete");
  };

  return (
    <OnboardingShell>
      <OnboardingCard className="w-full max-w-[560px] flex flex-col gap-8" padding="p-6 sm:p-8">
        {/* Progress Bar */}
        <OnboardingProgress
          currentStep={3}
          totalSteps={4}
          textClassName="text-[#8b949e] text-sm font-medium"
        />

        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <p className="text-[#e6edf3] text-3xl font-black tracking-[-0.03em]">
            Enable Notifications
          </p>
          <p className="text-[#8b949e] text-base">
            Get handy alerts for deadlines, events, and updates.
          </p>
        </div>

        {/* Notification List */}
        <div className="flex flex-col gap-4">
          {/* Email Notifications */}
          <OnboardingOptionRow
            icon="mail"
            label="Allow Email Notifications"
            checked={emailNotifications}
            onChange={() => setEmailNotifications(!emailNotifications)}
          />

          {/* SMS Reminders */}
          <OnboardingOptionRow
            icon="sms"
            label="Allow SMS Reminders"
            checked={smsReminders}
            onChange={() => setSmsReminders(!smsReminders)}
          />
        </div>

        {/* Action Buttons */}
        <FormActions
          submitText="Finish Setup"
          cancelText="Skip for now"
          onSubmit={handleFinish}
          onCancel={() => navigate("/onboarding/complete")}
        />
      </OnboardingCard>
    </OnboardingShell>
  );
}
