import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { updateAccountDetails } from "../../api/authApi";
import FormActions from "../../components/common/FormActions";
import OnboardingShell from "../../components/onboarding/OnboardingShell";
import OnboardingCard from "../../components/onboarding/OnboardingCard";
import OnboardingProgress from "../../components/onboarding/OnboardingProgress";
import OnboardingOptionRow from "../../components/onboarding/OnboardingOptionRow";

export default function NotificationsSetup() {
  const navigate = useNavigate();
  const { updateUser } = useAuth();

  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsReminders, setSmsReminders] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    try {
      // Persist notification preferences to backend
      await updateAccountDetails({
        preferences: {
          emailUpdates: emailNotifications,
          smsReminders: smsReminders,
          notifications: emailNotifications || smsReminders,
        },
      });
      // Update context
      updateUser({
        preferences: {
          emailUpdates: emailNotifications,
          smsReminders,
          notifications: emailNotifications || smsReminders,
        },
      });
    } catch (err) {
      console.error("Failed to save notification preferences:", err);
      // Continue anyway — don't block onboarding
    } finally {
      setSaving(false);
    }
    navigate("/onboarding/complete");
  };

  return (
    <OnboardingShell>
      <OnboardingCard className="w-full max-w-xl flex flex-col gap-8" padding="p-6 sm:p-8">
        {/* Progress Bar */}
        <OnboardingProgress
          currentStep={3}
          totalSteps={4}
          textClassName="text-text-secondary text-sm font-medium"
        />

        {/* Page Heading */}
        <div className="flex flex-col gap-2">
          <p className="text-text-primary text-3xl font-black tracking-[-0.03em]">
            Enable Notifications
          </p>
          <p className="text-text-secondary text-base">
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
          submitText={saving ? "Saving..." : "Finish Setup"}
          cancelText="Skip for now"
          onSubmit={handleFinish}
          onCancel={() => navigate("/onboarding/complete")}
          disabled={saving}
        />
      </OnboardingCard>
    </OnboardingShell>
  );
}
