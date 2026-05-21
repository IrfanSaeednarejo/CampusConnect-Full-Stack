import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updatePreferencesThunk } from "../../redux/slices/authSlice";
import PageHeader from "../../components/common/PageHeader";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import Card from "../../components/common/Card";
import ToggleRow from "../../components/common/ToggleRow";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function PrivacySettings() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();

  const [privacy, setPrivacy] = useState({
    profileVisibility: user?.preferences?.privacy?.profileVisibility || "public",
    showEmail: user?.preferences?.privacy?.showEmail ?? false,
    showPhone: user?.preferences?.privacy?.showPhone ?? false,
    showOnlineStatus: user?.preferences?.privacy?.showOnlineStatus ?? true,
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
      await dispatch(updatePreferencesThunk({ privacy })).unwrap();
      showSuccess("Privacy settings updated successfully!");
    } catch (error) {
      showError(error || "Failed to update privacy settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0d1117] text-[#c9d1d9]" : "bg-slate-50 text-slate-900"}`}>
      <PageHeader
        title="Privacy Settings"
        onBack={() => navigate("/profile/view")}
      />

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card padding="p-6" isDark={isDark}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Profile Visibility
            </h2>
            <div className="space-y-4">
              <FormField
                label="Who can see your profile?"
                type="select"
                name="profileVisibility"
                value={privacy.profileVisibility}
                onChange={handleChange}
                isDark={isDark}
              >
                <option value="public">Everyone</option>
                <option value="campus">Campus Only</option>
                <option value="connections">Connections Only</option>
              </FormField>

              <div className={`divide-y ${isDark ? "divide-[#30363d]" : "divide-slate-200"}`}>
                <ToggleRow
                  label="Show Email Address"
                  description="Display your email on your public profile"
                  checked={privacy.showEmail}
                  onChange={() => handleToggle("showEmail")}
                  isDark={isDark}
                />
                <ToggleRow
                  label="Show Phone Number"
                  description="Display your phone number on your public profile"
                  checked={privacy.showPhone}
                  onChange={() => handleToggle("showPhone")}
                  isDark={isDark}
                />
                <ToggleRow
                  label="Show Online Status"
                  description="Let others see when you're online"
                  checked={privacy.showOnlineStatus}
                  onChange={() => handleToggle("showOnlineStatus")}
                  isDark={isDark}
                />
              </div>
            </div>
          </Card>

          <FormActions
            onCancel={() => navigate("/profile/view")}
            onSubmit={handleSubmit}
            cancelText="Cancel"
            submitText={loading ? "Saving..." : "Save Changes"}
            loading={loading}
            className="justify-end"
            isDark={isDark}
          />
        </form>
      </div>
    </div>
  );
}
