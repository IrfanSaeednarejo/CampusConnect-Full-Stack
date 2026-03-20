import { useState } from "react";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import Card from "../../components/common/Card";
import ToggleRow from "../../components/common/ToggleRow";

export default function PrivacySettings() {
  const { showSuccess } = useNotification();
  const navigate = useNavigate();

  const [privacy, setPrivacy] = useState({
    profileVisibility: "everyone",
    showEmail: false,
    showPhone: false,
    allowMessagesFrom: "everyone",
    showOnlineStatus: true,
    searchableProfile: true,
  });

  const [loading, setLoading] = useState(false);

  const handleToggle = (key) => {
    setPrivacy({ ...privacy, [key]: !privacy[key] });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPrivacy({ ...privacy, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      showSuccess("Privacy settings updated successfully!");
    } catch (error) {
      console.error("Failed to update privacy settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <PageHeader
        title="Privacy Settings"
        onBack={() => navigate("/profile/view")}
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Visibility */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Profile Visibility
            </h2>
            <div className="space-y-4">
              <FormField
                label="Who can see your profile?"
                type="select"
                name="profileVisibility"
                value={privacy.profileVisibility}
                onChange={handleChange}
              >
                <option value="everyone">Everyone</option>
                <option value="campus">Campus Only</option>
                <option value="connections">Connections Only</option>
                <option value="private">Private</option>
              </FormField>

              <div className="divide-y divide-[#30363d]">
                <ToggleRow
                  label="Show Email Address"
                  description="Display your email on your public profile"
                  checked={privacy.showEmail}
                  onChange={() => handleToggle("showEmail")}
                />
                <ToggleRow
                  label="Show Phone Number"
                  description="Display your phone number on your public profile"
                  checked={privacy.showPhone}
                  onChange={() => handleToggle("showPhone")}
                />
                <ToggleRow
                  label="Searchable Profile"
                  description="Allow others to find you through search"
                  checked={privacy.searchableProfile}
                  onChange={() => handleToggle("searchableProfile")}
                />
              </div>
            </div>
          </Card>

          {/* Communication Settings */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Communication
            </h2>
            <div className="space-y-4">
              <FormField
                label="Who can send you messages?"
                type="select"
                name="allowMessagesFrom"
                value={privacy.allowMessagesFrom}
                onChange={handleChange}
              >
                <option value="everyone">Everyone</option>
                <option value="campus">Campus Only</option>
                <option value="connections">Connections Only</option>
                <option value="none">No One</option>
              </FormField>

              <div className="divide-y divide-[#30363d]">
                <ToggleRow
                  label="Show Online Status"
                  description="Let others see when you're online"
                  checked={privacy.showOnlineStatus}
                  onChange={() => handleToggle("showOnlineStatus")}
                />
              </div>
            </div>
          </Card>

          {/* Data & Privacy */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Data & Privacy
            </h2>
            <div className="space-y-3">
              <button
                type="button"
                className="w-full text-left px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg hover:bg-[#21262d] transition-colors"
              >
                <p className="font-medium text-white">Download Your Data</p>
                <p className="text-sm text-[#8b949e]">
                  Request a copy of your data
                </p>
              </button>

              <button
                type="button"
                className="w-full text-left px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-lg hover:bg-[#21262d] transition-colors"
              >
                <p className="font-medium text-white">Manage Data Sharing</p>
                <p className="text-sm text-[#8b949e]">
                  Control what data is shared with third parties
                </p>
              </button>
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
