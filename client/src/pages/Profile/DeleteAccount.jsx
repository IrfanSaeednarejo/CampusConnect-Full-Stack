import { useState } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { deleteAccountThunk } from "../../redux/slices/authSlice";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";
import FormField from "@/components/common/FormField";

export default function DeleteAccount() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      <ProfilePageHeader
        title="Delete Account"
        onBack={() => navigate("/profile/view")}
      />

      <div className="max-w-2xl mx-auto p-6">
        {!showConfirmation ? (
          <div className="space-y-6">
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
                Please enter your password to confirm deletion:
              </p>
              <FormField
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </Card>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowConfirmation(false);
                  setPassword("");
                }}
                className="flex-1 px-6 py-3 bg-[#21262d] text-white rounded-lg hover:bg-[#30363d] transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={!password || loading}
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
