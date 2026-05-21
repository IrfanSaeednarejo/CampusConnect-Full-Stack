import { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updatePreferencesThunk, changePasswordThunk } from "../../redux/slices/authSlice";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";
import { useTheme } from "../../hooks/useTheme";
import { isValidThemePreference } from "../../utils/themeHelpers";
import { useLanguage } from "../../hooks/useLanguage";

export default function AccountSettings() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { themePreference, effectiveTheme, setThemePreference } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const isDark = effectiveTheme === "dark";
  const [savedPreference, setSavedPreference] = useState(() =>
    isValidThemePreference(user?.preferences?.theme) ? user.preferences.theme : themePreference,
  );
  const [savedLanguage, setSavedLanguage] = useState(user?.preferences?.language || language);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    if (user?.preferences?.language) {
      setSavedLanguage(user.preferences.language);
    }
  }, [user?.preferences?.language]);

  useEffect(() => {
    if (isValidThemePreference(user?.preferences?.theme)) {
      setSavedPreference(user.preferences.theme);
      return;
    }

    setSavedPreference((currentPreference) =>
      isValidThemePreference(currentPreference) ? currentPreference : themePreference,
    );
  }, [themePreference, user?.preferences?.theme]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "theme") {
      setThemePreference(value);
      return;
    }

    if (name === "language") {
      setLanguage(value);
    }
  };

  const handlePwdChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
    setPasswordErrors((current) => ({ ...current, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(updatePreferencesThunk({
        theme: themePreference,
        language,
      })).unwrap();
      setSavedPreference(themePreference);
      setSavedLanguage(language);
      showSuccess(t("accountSettings.updatedSuccess"));
    } catch (error) {
      showError(error || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const validatePasswordForm = () => {
    const nextErrors = {};

    if (!passwordForm.oldPassword.trim()) nextErrors.oldPassword = t("accountSettings.passwordRequired");
    if (!passwordForm.newPassword.trim()) nextErrors.newPassword = t("accountSettings.passwordRequired");
    if (!passwordForm.confirmPassword.trim()) nextErrors.confirmPassword = t("accountSettings.passwordRequired");

    if (passwordForm.newPassword && passwordForm.newPassword.length < 8) {
      nextErrors.newPassword = t("accountSettings.passwordMin");
    }

    if (passwordForm.oldPassword && passwordForm.newPassword && passwordForm.oldPassword === passwordForm.newPassword) {
      nextErrors.newPassword = t("accountSettings.passwordDifferent");
    }

    if (
      passwordForm.newPassword &&
      passwordForm.confirmPassword &&
      passwordForm.newPassword !== passwordForm.confirmPassword
    ) {
      nextErrors.confirmPassword = t("accountSettings.passwordMismatch");
    }

    setPasswordErrors(nextErrors);
    return nextErrors;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (pwdLoading) return;

    const errors = validatePasswordForm();
    if (Object.keys(errors).length > 0) {
      const firstError = Object.values(errors)[0];
      showError(firstError);
      return;
    }

    setPwdLoading(true);
    try {
      await dispatch(changePasswordThunk({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      })).unwrap();
      setPasswordErrors({});
      setPasswordForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      showSuccess(t("accountSettings.passwordChanged"));
      navigate("/login", { replace: true });
    } catch (error) {
      showError(error || "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-300 ${
        isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"
      }`}
    >
      <ProfilePageHeader
        title={t("accountSettings.title")}
        onBack={() => navigate("/profile/view")}
      />

      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card padding="p-6" isDark={isDark}>
            <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>{t("accountSettings.appearance")}</h2>
            <div className="space-y-4">
              <FormField
                label={t("accountSettings.theme")}
                name="theme"
                type="select"
                value={themePreference}
                onChange={handleChange}
                isDark={isDark}
              >
                <option value="dark">{t("accountSettings.theme.dark")}</option>
                <option value="light">{t("accountSettings.theme.light")}</option>
                <option value="system">{t("accountSettings.theme.system")}</option>
              </FormField>
              <FormField
                label={t("accountSettings.language")}
                name="language"
                type="select"
                value={language}
                onChange={handleChange}
                isDark={isDark}
              >
                <option value="en">{t("accountSettings.language.english")}</option>
                <option value="ur">{t("accountSettings.language.urdu")}</option>
              </FormField>
            </div>
          </Card>
          
          <FormActions
            onCancel={() => {
              setThemePreference(savedPreference);
              setLanguage(savedLanguage);
              navigate("/profile/view");
            }}
            onSubmit={handleSubmit}
            cancelText={t("common.cancel")}
            submitText={t("accountSettings.saveDisplay")}
            loadingText={t("common.loading")}
            loading={loading}
            className="justify-end"
          />
        </form>

        <form onSubmit={handlePasswordSubmit} className="space-y-6">
          <Card padding="p-6" isDark={isDark}>
            <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>{t("accountSettings.changePassword")}</h2>
            <div className="space-y-4">
              <FormField
                label={t("accountSettings.currentPassword")}
                name="oldPassword"
                type="password"
                required
                value={passwordForm.oldPassword}
                onChange={handlePwdChange}
                error={passwordErrors.oldPassword}
                inputClassName="locale-ltr"
                isDark={isDark}
              />
              <FormField
                label={t("accountSettings.newPassword")}
                name="newPassword"
                type="password"
                required
                value={passwordForm.newPassword}
                onChange={handlePwdChange}
                error={passwordErrors.newPassword}
                inputClassName="locale-ltr"
                isDark={isDark}
              />
              <FormField
                label={t("accountSettings.confirmNewPassword")}
                name="confirmPassword"
                type="password"
                required
                value={passwordForm.confirmPassword}
                onChange={handlePwdChange}
                error={passwordErrors.confirmPassword}
                inputClassName="locale-ltr"
                isDark={isDark}
              />
            </div>
          </Card>

          <FormActions
            submitText={t("accountSettings.changePassword")}
            loadingText={t("common.loading")}
            loading={pwdLoading}
            disabled={pwdLoading}
            className="justify-end"
            hideCancel
            onSubmit={handlePasswordSubmit}
          />
        </form>
      </div>
    </div>
  );
}
