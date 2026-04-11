import { useEffect, useState } from "react";
import { getCurrentUser } from "@/api/authApi";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";

export default function ViewProfile() {
  const { user: authUser, role } = useAuth();
  const navigate = useNavigate();

  // Real backend data integration
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getCurrentUser();
        // Fallback to the nested profile object if present
        setProfileData(data.profile || data);
      } catch (error) {
        console.error("Failed to load full profile data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const getDashboardRoute = () => {
    switch (role?.toLowerCase()) {
      case "student": return "/student/dashboard";
      case "mentor": return "/mentor/dashboard";
      case "admin": return "/admin/dashboard";
      case "society_head": return "/society/dashboard";
      default: return "/";
    }
  };

  const handleBack = () => {
    // Attempt to go back, or fallback to dashboard if opened in new tab
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(getDashboardRoute());
    }
  };

  // Combine fresh data with auth fallback
  const displayUser = profileData || authUser || {};
  const displayName = displayUser.displayName || displayUser.name || displayUser.firstName || "User";
  const email = displayUser.email || authUser?.email || "email@example.com";
  const department = displayUser.department || displayUser.major || authUser?.department;
  const bio = displayUser.bio || displayUser.about || "";

  return (
    <div className="w-full bg-background text-text-primary min-h-screen">
      {/* Header */}
      <ProfilePageHeader
        title="My Profile"
        onBack={handleBack}
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(getDashboardRoute())}
              className="px-4 py-2 bg-surface border border-border text-text-primary rounded-lg hover:bg-surface-hover transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">dashboard</span>
              Return to Dashboard
            </button>
            <Link
              to="/profile/edit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Edit Profile
            </Link>
          </div>
        }
      />

      {/* Content */}
      <div className="max-w-4xl mx-auto p-6">
        {/* Profile Card */}
        <Card padding="p-6" className="mb-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div
              className="w-24 h-24 rounded-full bg-gradient-to-br from-[#4F46E5] to-[#1f6feb] flex items-center justify-center text-white text-3xl font-bold"
            >
              {displayName.charAt(0).toUpperCase()}
            </div>

            {/* Info */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text-primary mb-1">
                {displayName}
              </h2>
              <p className="text-text-secondary mb-4">
                {email}
              </p>
              <div className="flex items-center gap-4">
                <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium capitalize">
                  {role || "Student"}
                </span>
                {department && (
                  <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-medium">
                    {department}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Bio */}
          {bio && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-semibold text-text-secondary mb-2">Bio</h3>
              <p className="text-text-primary">{bio}</p>
            </div>
          )}
        </Card>

        {/* Settings Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            to="/profile/account-settings"
            className="bg-surface border border-border rounded-lg p-4 hover:border-[#475569] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-text-secondary">
                manage_accounts
              </span>
              <div>
                <h3 className="font-semibold text-text-primary">Account Settings</h3>
                <p className="text-sm text-text-secondary">
                  Manage your account preferences
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile/privacy-settings"
            className="bg-surface border border-border rounded-lg p-4 hover:border-[#475569] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-text-secondary">
                shield
              </span>
              <div>
                <h3 className="font-semibold text-text-primary">Privacy Settings</h3>
                <p className="text-sm text-text-secondary">
                  Control who can see your information
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile/notification-preferences"
            className="bg-surface border border-border rounded-lg p-4 hover:border-[#475569] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-text-secondary">
                notifications
              </span>
              <div>
                <h3 className="font-semibold text-text-primary">
                  Notification Preferences
                </h3>
                <p className="text-sm text-text-secondary">
                  Customize your notifications
                </p>
              </div>
            </div>
          </Link>

          <Link
            to="/profile/delete-account"
            className="bg-surface border border-border rounded-lg p-4 hover:border-[#EF4444] transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-danger">
                delete_forever
              </span>
              <div>
                <h3 className="font-semibold text-danger">Delete Account</h3>
                <p className="text-sm text-text-secondary">
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
