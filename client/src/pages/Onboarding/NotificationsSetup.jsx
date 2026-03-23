import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setUserPreferences } from "../../redux/slices/userSlice";
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

  const handleFinish = () => {
    // Save notification preferences to Redux
    dispatch(setUserPreferences({
      emailUpdates: emailNotifications,
      smsReminders: smsReminders,
      notifications: emailNotifications || smsReminders,
    }));
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
