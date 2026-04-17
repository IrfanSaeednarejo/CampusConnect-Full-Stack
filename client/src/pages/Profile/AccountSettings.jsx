import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updatePreferencesThunk, changePasswordThunk } from "../../redux/slices/authSlice";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";

export default function AccountSettings() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [settings, setSettings] = useState({
    theme: user?.preferences?.theme || "dark",
    language: user?.preferences?.language || "en",
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm({ ...passwordForm, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updatePreferencesThunk({
        theme: settings.theme,
        language: settings.language
      })).unwrap();
      showSuccess("Account settings updated successfully!");
    } catch (error) {
      showError(error || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showError("New passwords do not match!");
    }
    setPwdLoading(true);
    try {
      await dispatch(changePasswordThunk({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      })).unwrap();
      showSuccess("Password changed! Please log in again.");
      navigate("/login");
    } catch (error) {
      showError(error || "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      <ProfilePageHeader
        title="Account Settings"
        onBack={() => navigate("/profile/view")}
      />

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Appearance & Localization</h2>
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
                <option value="system">System</option>
              </FormField>
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
            </div>
          </Card>
          
          <FormActions
            onCancel={() => navigate("/profile/view")}
            onSubmit={handleSubmit}
            cancelText="Cancel"
            submitText="Save Display Settings"
            loading={loading}
            className="justify-end"
          />
        </form>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Change Password</h2>
            <div className="space-y-4">
              <FormField
                label="Current Password"
                name="oldPassword"
                type="password"
                required
                value={passwordForm.oldPassword}
                onChange={handlePwdChange}
              />
              <FormField
                label="New Password"
                name="newPassword"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={handlePwdChange}
              />
              <FormField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={handlePwdChange}
              />
            </div>
          </Card>

          <FormActions
            submitText="Change Password"
            loading={pwdLoading}
            className="justify-end"
            hideCancel
            onSubmit={handlePasswordSubmit}
          />
        </form>
      </div>
    </div>
  );
}
