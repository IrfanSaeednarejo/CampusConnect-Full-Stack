import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserPreferences, setUserPreferences } from "../../redux/slices/userSlice";
import PageHeader from "../../components/common/PageHeader";
import FormActions from "../../components/common/FormActions";
import Card from "../../components/common/Card";
import ToggleRow from "../../components/common/ToggleRow";

export default function NotificationPreferences() {
  const userPreferences = useSelector(selectUserPreferences);
  const { showSuccess } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [preferences, setPreferences] = useState({
    emailNotifications: userPreferences?.notifications ?? true,
    pushNotifications: true,
    events: true,
    mentoring: true,
    societies: true,
    messages: true,
    studyGroups: true,
    announcements: true,
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setPreferences({ ...preferences, [key]: !preferences[key] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update Redux store
      dispatch(setUserPreferences({ notifications: preferences.emailNotifications }));

      showSuccess("Notification preferences updated successfully!");
    } catch (error) {
      console.error("Failed to update preferences");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <PageHeader
        title="Notification Preferences"
        onBack={() => navigate("/profile/view")}
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Notifications */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              General Notifications
            </h2>
            <div className="divide-y divide-[#30363d]">
              <ToggleRow
                label="Email Notifications"
                description="Receive notifications via email"
                checked={preferences.emailNotifications}
                onChange={() => handleToggle("emailNotifications")}
              />
              <ToggleRow
                label="Push Notifications"
                description="Receive browser push notifications"
                checked={preferences.pushNotifications}
                onChange={() => handleToggle("pushNotifications")}
              />
            </div>
          </Card>

          {/* Activity Notifications */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Activity Notifications
            </h2>
            <div className="divide-y divide-[#30363d]">
              <ToggleRow
                label="Events"
                description="Notifications about upcoming events"
                checked={preferences.events}
                onChange={() => handleToggle("events")}
              />
              <ToggleRow
                label="Mentoring Sessions"
                description="Notifications about mentoring sessions and requests"
                checked={preferences.mentoring}
                onChange={() => handleToggle("mentoring")}
              />
              <ToggleRow
                label="Societies"
                description="Updates from societies you've joined"
                checked={preferences.societies}
                onChange={() => handleToggle("societies")}
              />
              <ToggleRow
                label="Messages"
                description="New direct messages and chat notifications"
                checked={preferences.messages}
                onChange={() => handleToggle("messages")}
              />
              <ToggleRow
                label="Study Groups"
                description="Updates from your study groups"
                checked={preferences.studyGroups}
                onChange={() => handleToggle("studyGroups")}
              />
              <ToggleRow
                label="Announcements"
                description="Important announcements from campus"
                checked={preferences.announcements}
                onChange={() => handleToggle("announcements")}
              />
            </div>
          </Card>

          {/* Action Buttons */}
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
