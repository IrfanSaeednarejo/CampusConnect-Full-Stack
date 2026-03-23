import { useAuth } from "@/contexts/AuthContext.jsx";
import { useSelector } from "react-redux";
import { selectUserProfile } from "../../redux/slices/userSlice";
import { Link, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";

export default function ViewProfile() {
  const { user, role } = useAuth();
  const userProfile = useSelector(selectUserProfile);
  const navigate = useNavigate();

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <ProfilePageHeader
        title="My Profile"
        onBack={() => navigate(-1)}
        action={
          <Link
            to="/profile/edit"
            className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors text-sm font-medium"
          >
            Edit Profile
          </Link>
        }
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Card */}
        <Card padding="p-6" className="mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#238636] to-[#1f6feb] flex items-center justify-center text-white text-3xl font-bold"
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {user?.name || userProfile?.name || "User"}
              </h2>
              <p className="text-[#8b949e] mb-4">
                {user?.email || userProfile?.email || "email@example.com"}
              </p>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-[#1f6feb]/20 text-[#58a6ff] rounded-full text-sm font-medium capitalize">
                  {role || "Student"}
                </span>
                {userProfile?.department && (
                  <span className="px-3 py-1 bg-[#238636]/20 text-[#3fb950] rounded-full text-sm font-medium">
                    {userProfile.department}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Bio */}
          {userProfile?.bio && (
            <div className="mt-6 pt-6 border-t border-[#30363d]">
              <h3 className="text-sm font-semibold text-[#8b949e] mb-2">Bio</h3>
              <p className="text-[#c9d1d9]">{userProfile.bio}</p>
            </div>
          )}
        </Card>

        {/* Settings Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/profile/account-settings"
            className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#8b949e] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#8b949e]">
                manage_accounts
              </span>
              <div>
                <h3 className="font-semibold text-white">Account Settings</h3>
                <p className="text-sm text-[#8b949e]">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile/privacy-settings"
            className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#8b949e] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#8b949e]">
                shield
              </span>
              <div>
                <h3 className="font-semibold text-white">Privacy Settings</h3>
                <p className="text-sm text-[#8b949e]">
                  Control who can see your information
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile/notification-preferences"
            className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#8b949e] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#8b949e]">
                notifications
              </span>
              <div>
                <h3 className="font-semibold text-white">
                  Notification Preferences
                </h3>
                <p className="text-sm text-[#8b949e]">
                  Customize your notifications
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile/delete-account"
            className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 hover:border-[#da3633] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[#da3633]">
                delete_forever
              </span>
              <div>
                <h3 className="font-semibold text-[#da3633]">Delete Account</h3>
                <p className="text-sm text-[#8b949e]">
                  Permanently remove your account
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
