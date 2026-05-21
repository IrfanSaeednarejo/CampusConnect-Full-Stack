import { useState, useRef } from "react";
import { useAuth } from "../../hooks/useAuth.js";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { updateAccountThunk, updateAcademicThunk, updateAvatarThunk } from "../../redux/slices/authSlice";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function EditProfile() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const isDark = useHomeTheme();

  const [accountForm, setAccountForm] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    displayName: user?.profile?.displayName || "",
    bio: user?.profile?.bio || "",
    phone: user?.profile?.phone || "",
  });

  const [academicForm, setAcademicForm] = useState({
    department: user?.academic?.department || "",
    degree: user?.academic?.degree || "",
    semester: user?.academic?.semester || "",
    enrollmentYear: user?.academic?.enrollmentYear || "",
    expectedGraduation: user?.academic?.expectedGraduation || "",
  });

  const [loading, setLoading] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountForm({ ...accountForm, [name]: value });
  };
  
  const handleAcademicChange = (e) => {
    let value = e.target.value;
    if (e.target.type === "number") {
      value = value ? parseInt(value, 10) : "";
    }
    setAcademicForm({ ...academicForm, [e.target.name]: value });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    try {
      await dispatch(updateAvatarThunk(file)).unwrap();
      showSuccess("Profile picture updated!");
    } catch (err) {
      showError(err || "Failed to update profile picture");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Clean up objects to remove empty strings before sending
      const accountUpdates = Object.fromEntries(Object.entries(accountForm).filter(([_, v]) => v !== ""));
      const academicUpdates = Object.fromEntries(Object.entries(academicForm).filter(([_, v]) => v !== ""));

      if (Object.keys(accountUpdates).length > 0) {
        await dispatch(updateAccountThunk(accountUpdates)).unwrap();
      }
      
      if (Object.keys(academicUpdates).length > 0) {
        await dispatch(updateAcademicThunk(academicUpdates)).unwrap();
      }

      showSuccess("Profile updated successfully!");
      navigate("/profile/view");
    } catch (error) {
      showError(error || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const initials = accountForm.firstName ? accountForm.firstName.charAt(0).toUpperCase() : "U";

  return (
    <div className={`w-full min-h-screen transition-colors duration-300 ${isDark ? "bg-[#0d1117] text-[#c9d1d9]" : "bg-slate-50 text-slate-900"}`}>
      <ProfilePageHeader
        title="Edit Profile"
        onBack={() => navigate("/profile/view")}
      />

      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card padding="p-6" isDark={isDark}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Profile Picture
            </h2>
            <div className="flex items-center gap-4">
              {user?.profile?.avatar ? (
                <img src={user.profile.avatar} alt="Avatar" className={`w-20 h-20 rounded-full object-cover border-2 ${isDark ? "border-[#30363d]" : "border-slate-200"}`} />
              ) : (
                <div className={`flex h-20 w-20 items-center justify-center rounded-full border text-2xl font-bold ${isDark ? "border-border-dark bg-primary/15 text-primary" : "border-border-light bg-primary/10 text-primary"}`}>
                  {initials}
                </div>
              )}
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleAvatarUpload} 
              />
              <button
                type="button"
                disabled={avatarUploading}
                onClick={() => fileInputRef.current?.click()}
                className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50 ${isDark ? "bg-primary text-white hover:bg-primary-hover" : "bg-primary text-white hover:bg-primary-hover"}`}
              >
                {avatarUploading ? "Uploading..." : "Change Photo"}
              </button>
            </div>
          </Card>

          <Card padding="p-6" isDark={isDark}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
              Account Information
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  label="First Name"
                  name="firstName"
                  value={accountForm.firstName}
                  onChange={handleAccountChange}
                  isDark={isDark}
                  required
                />
                <FormField
                  label="Last Name"
                  name="lastName"
                  value={accountForm.lastName}
                  onChange={handleAccountChange}
                  isDark={isDark}
                  required
                />
              </div>

              <FormField
                label="Display Name (@username)"
                name="displayName"
                value={accountForm.displayName}
                onChange={handleAccountChange}
                isDark={isDark}
                placeholder="Unique username"
              />
              
              <FormField
                label="Phone Number"
                name="phone"
                value={accountForm.phone}
                onChange={handleAccountChange}
                isDark={isDark}
                placeholder="+1234567890"
              />

              <FormField
                label="Bio"
                name="bio"
                type="textarea"
                value={accountForm.bio}
                onChange={handleAccountChange}
                rows={4}
                isDark={isDark}
                placeholder="Tell us about yourself..."
                maxLength={300}
              />
            </div>
          </Card>

          <Card padding="p-6" isDark={isDark}>
            <h2 className={`text-lg font-semibold mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
              Academic Information
            </h2>
            <div className="space-y-4">
              <FormField
                label="Degree"
                name="degree"
                value={academicForm.degree}
                onChange={handleAcademicChange}
                isDark={isDark}
                placeholder="e.g. BSc Computer Science"
              />
              
              <FormField
                label="Department"
                name="department"
                value={academicForm.department}
                onChange={handleAcademicChange}
                isDark={isDark}
                placeholder="e.g. Computer Science"
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  label="Semester"
                  name="semester"
                  type="number"
                  min="0" max="12"
                  value={academicForm.semester}
                  onChange={handleAcademicChange}
                  isDark={isDark}
                />
                <FormField
                  label="Enrollment Year"
                  name="enrollmentYear"
                  type="number"
                  min="2000" max="2100"
                  value={academicForm.enrollmentYear}
                  onChange={handleAcademicChange}
                  isDark={isDark}
                />
                <FormField
                  label="Expected Grad"
                  name="expectedGraduation"
                  type="number"
                  min="2000" max="2100"
                  value={academicForm.expectedGraduation}
                  onChange={handleAcademicChange}
                  isDark={isDark}
                />
              </div>
            </div>
          </Card>

          <FormActions
            onCancel={() => navigate("/profile/view")}
            onSubmit={handleSubmit}
            cancelText="Cancel"
            submitText="Save Changes"
            loading={loading}
            className="justify-end"
            isDark={isDark}
          />
        </form>
      </div>
    </div>
  );
}
