import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updatePreferencesThunk } from "../../redux/slices/authSlice";
import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";
import Card from "../../components/common/Card";
import ToggleRow from "../../components/common/ToggleRow";

export default function NotificationPreferences() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [notifications, setNotifications] = useState({
    email: user?.preferences?.notifications?.email ?? true,
    push: user?.preferences?.notifications?.push ?? true,
    inApp: user?.preferences?.notifications?.inApp ?? true,
    digest: user?.preferences?.notifications?.digest ?? false,
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await dispatch(updatePreferencesThunk({ notifications })).unwrap();
      showSuccess("Notification preferences updated successfully!");
    } catch (error) {
      showError(error || "Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      <PageHeader
        title="Notification Preferences"
        onBack={() => navigate("/profile/view")}
      />

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Notification Channels
            </h2>
            <div className="divide-y divide-[#30363d]">
              <ToggleRow
                label="Email Notifications"
                description="Receive notifications via email"
                checked={notifications.email}
                onChange={() => handleToggle("email")}
              />
              <ToggleRow
                label="Push Notifications"
                description="Receive browser push notifications"
                checked={notifications.push}
                onChange={() => handleToggle("push")}
              />
              <ToggleRow
                label="In-App Notifications"
                description="Receive alerts inside the CampusNexus app"
                checked={notifications.inApp}
                onChange={() => handleToggle("inApp")}
              />
              <ToggleRow
                label="Daily Digest"
                description="Receive a daily summary of missed notifications"
                checked={notifications.digest}
                onChange={() => handleToggle("digest")}
              />
            </div>
          </Card>

          <FormActions
            onCancel={() => navigate("/profile/view")}
            onSubmit={handleSubmit}
            cancelText="Cancel"
            submitText={loading ? "Saving..." : "Save Changes"}
            loading={loading}
            className="justify-end"
          />
        </form>
      </div>
    </div>
  );
}
