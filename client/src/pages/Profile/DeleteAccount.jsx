import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";

export default function DeleteAccount() {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      showError("Please type DELETE to confirm account deletion");
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Clear auth state
      dispatch(logoutAction());
      if (logout) {
        logout();
      }

      showSuccess("Your account has been deleted successfully");
      setTimeout(() => navigate("/"), 500);
    } catch (error) {
      showError("Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <ProfilePageHeader
        title="Delete Account"
        onBack={() => navigate("/profile/view")}
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        {!showConfirmation ? (
          <div className="space-y-6">
            {/* Warning Card */}
            <Card padding="p-6" className="bg-[#da3633]/10 border-[#da3633]">
              <div className="flex gap-4">
                <span className="material-symbols-outlined text-[#da3633] text-3xl">
                  warning
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-[#da3633] mb-2">
                    Warning: This action is irreversible
                  </h2>
                  <p className="text-[#c9d1d9]">
                    Deleting your account will permanently remove all your data
                    and cannot be undone.
                  </p>
                </div>
              </div>
            </Card>

            {/* What will be deleted */}
            <Card padding="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
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
                  <li key={index} className="flex items-center gap-3 text-[#c9d1d9]">
                    <span className="material-symbols-outlined text-[#da3633]">
                      close
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {/* Alternatives */}
            <Card padding="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Consider These Alternatives
              </h3>
              <div className="space-y-3">
                <div className="p-4 bg-[#0d1117] rounded-lg">
                  <h4 className="font-medium text-white mb-1">
                    Deactivate temporarily
                  </h4>
                  <p className="text-sm text-[#8b949e]">
                    Hide your profile without losing your data
                  </p>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-lg">
                  <h4 className="font-medium text-white mb-1">
                    Adjust privacy settings
                  </h4>
                  <p className="text-sm text-[#8b949e]">
                    Control who can see your information
                  </p>
                </div>
                <div className="p-4 bg-[#0d1117] rounded-lg">
                  <h4 className="font-medium text-white mb-1">
                    Manage notifications
                  </h4>
                  <p className="text-sm text-[#8b949e]">
                    Reduce notification frequency
                  </p>
                </div>
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/profile/view")}
                className="flex-1 px-6 py-3 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors font-medium"
              >
                Keep My Account
              </button>
              <button
                onClick={() => setShowConfirmation(true)}
                className="flex-1 px-6 py-3 bg-[#da3633] text-white rounded-lg hover:bg-[#b62324] transition-colors font-medium"
              >
                Continue to Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Confirmation Card */}
            <Card padding="p-6" className="border-[#da3633]">
              <h2 className="text-lg font-semibold text-white mb-4">
                Confirm Account Deletion
              </h2>
              <p className="text-[#c9d1d9] mb-4">
                Are you absolutely sure you want to delete your account for{" "}
                <span className="font-semibold text-white">
                  {user?.email || "your account"}
                </span>
                ?
              </p>
              <p className="text-[#c9d1d9] mb-6">
                Type <span className="font-mono font-bold text-[#da3633]">DELETE</span> to confirm:
              </p>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type DELETE here"
                className="w-full px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-white focus:outline-none focus:border-[#da3633]"
              />
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmText("");
                }}
                className="flex-1 px-6 py-3 bg-[#21262d] text-white rounded-lg hover:bg-[#30363d] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || loading}
                className="flex-1 px-6 py-3 bg-[#da3633] text-white rounded-lg hover:bg-[#b62324] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
