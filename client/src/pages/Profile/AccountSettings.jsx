import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserPreferences, setUserPreferences } from "../../redux/slices/userSlice";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";
import Card from "../../components/common/Card";
import ToggleRow from "../../components/common/ToggleRow";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";

export default function AccountSettings() {
  const userPreferences = useSelector(selectUserPreferences);
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    theme: userPreferences?.theme || "dark",
    language: "en",
    timezone: "UTC-5",
    emailUpdates: userPreferences?.emailUpdates ?? true,
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update Redux store
      dispatch(setUserPreferences(settings));

      showSuccess("Account settings updated successfully!");
    } catch (error) {
      console.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <ProfilePageHeader
        title="Account Settings"
        onBack={() => navigate("/profile/view")}
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Appearance */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Appearance</h2>
            <div className="space-y-4">
              <FormField
                label="Theme"
                name="theme"
                type="select"
                value={settings.theme}
                onChange={handleChange}
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="auto">Auto</option>
              </FormField>
            </div>
          </Card>

          {/* Localization */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Localization
            </h2>
            <div className="space-y-4">
              <FormField
                label="Language"
                name="language"
                type="select"
                value={settings.language}
                onChange={handleChange}
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </FormField>

              <FormField
                label="Timezone"
                name="timezone"
                type="select"
                value={settings.timezone}
                onChange={handleChange}
              >
                <option value="UTC-8">Pacific Time (UTC-8)</option>
                <option value="UTC-7">Mountain Time (UTC-7)</option>
                <option value="UTC-6">Central Time (UTC-6)</option>
                <option value="UTC-5">Eastern Time (UTC-5)</option>
                <option value="UTC+0">UTC</option>
              </FormField>
            </div>
          </Card>

          {/* Email Preferences */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Email Preferences
            </h2>
            <div className="space-y-4">
              <ToggleRow
                label="Email Updates"
                description="Receive updates about your account via email"
                checked={settings.emailUpdates}
                onChange={() => handleToggle("emailUpdates")}
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <FormActions
            onCancel={() => navigate("/profile/view")}
            onSubmit={handleSubmit}
            cancelText="Cancel"
            submitText="Save Changes"
            loading={loading}
            className="justify-end"
          />
        </form>
      </div>
    </div>
  );
}
