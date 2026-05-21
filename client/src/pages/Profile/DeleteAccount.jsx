import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteAccountThunk } from "../../redux/slices/authSlice";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";
import FormField from "@/components/common/FormField";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export default function DeleteAccount() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!password) {
      showError("Please enter your password to confirm");
      return;
    }

    setLoading(true);

    try {
      await dispatch(deleteAccountThunk({ password })).unwrap();
      showSuccess("Your account has been deleted successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      showError(error || "Failed to delete account. Incorrect password?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"}`}>
      <ProfilePageHeader
        title="Delete Account"
        onBack={() => navigate("/profile/view")}
      />

      <div className="max-w-2xl mx-auto p-6">
        {!showConfirmation ? (
          <div className="space-y-6">
            <Card padding="p-6" isDark={isDark} className={isDark ? "border-danger/30 bg-danger/10" : "border-danger/20 bg-danger/5"}>
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-3xl text-danger">
                  warning
                </span>
                <div>
                  <h2 className="mb-2 text-lg font-semibold text-danger">
                    Warning: This action is irreversible
                  </h2>
                  <p className={isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}>
                    Deleting your account will permanently remove all your data
                    and cannot be undone.
                  </p>
                </div>
              </div>
            </Card>

            <Card padding="p-6" isDark={isDark}>
              <h3 className={`mb-4 text-lg font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                What will be deleted?
              </h3>
              <ul className="space-y-3">
                {[
                  "Your profile information",
                  "All your posts and comments",
                  "Your event registrations",
                  "Society memberships",
                  "Study group participation",
                  "Mentoring sessions and history",
                  "Direct messages and conversations",
                  "Notes and academic content",
                ].map((item, index) => (
                  <li key={index} className={`flex items-center gap-3 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    <span className="material-symbols-outlined text-danger">
                      close
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex gap-3">
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/profile/view")}
                  className={getButtonClassName({
                    variant: "secondary",
                    size: "lg",
                    isDark,
                    className: "flex-1",
                  })}
                >
                  Keep My Account
                </button>
                <button
                  onClick={() => setShowConfirmation(true)}
                  className={getButtonClassName({
                    variant: "danger",
                    size: "lg",
                    isDark,
                    className: "flex-1",
                  })}
                >
                  Continue to Delete
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <Card padding="p-6" isDark={isDark} className={isDark ? "border-danger/30" : "border-danger/20"}>
              <h2 className={`mb-4 text-lg font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                Confirm Account Deletion
              </h2>
              <p className={`mb-4 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                Are you absolutely sure you want to delete your account for{" "}
                <span className={`font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                  {user?.email || "your account"}
                </span>
                ?
              </p>
              <p className={`mb-6 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                Please enter your password to confirm deletion:
              </p>
              <FormField
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
                isDark={isDark}
              />
            </Card>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setPassword("");
                }}
                className={getButtonClassName({
                  variant: "secondary",
                  size: "lg",
                  isDark,
                  className: "flex-1",
                })}
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!password || loading}
                className={getButtonClassName({
                  variant: "danger",
                  size: "lg",
                  isDark,
                  className: "flex-1",
                })}
              >
                {loading ? "Deleting..." : "Delete My Account"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
