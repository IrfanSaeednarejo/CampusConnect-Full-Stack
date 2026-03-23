import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserProfile, updateUserProfile } from "../../redux/slices/userSlice";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";
import Card from "../../components/common/Card";
import ProfilePageHeader from "../../components/profile/ProfilePageHeader";

export default function EditProfile() {
  const { user, updateUser } = useAuth();
  const userProfile = useSelector(selectUserProfile);
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    name: user?.name || userProfile?.name || "",
    email: user?.email || userProfile?.email || "",
    department: userProfile?.department || "",
    year: userProfile?.year || "",
    bio: userProfile?.bio || "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update user in AuthContext
      if (updateUser) {
        updateUser({ name: form.name, email: form.email });
      }

      // Update Redux store
      dispatch(updateUserProfile(form));

      showSuccess("Profile updated successfully!");
      setTimeout(() => navigate("/profile/view"), 500);
    } catch (error) {
      showError("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <ProfilePageHeader
        title="Edit Profile"
        onBack={() => navigate("/profile/view")}
      />

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture Section */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Profile Picture
            </h2>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#238636] to-[#1f6feb] flex items-center justify-center text-white text-2xl font-bold">
                {form.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-[#238636] text-white rounded-lg hover:bg-[#2ea043] transition-colors text-sm font-medium"
              >
                Change Photo
              </button>
            </div>
          </Card>

          {/* Basic Information */}
          <Card padding="p-6">
            <h2 className="text-lg font-semibold text-white mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <FormField
                label="Full Name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />

              <FormField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
              />

              <FormField
                label="Department"
                name="department"
                type="text"
                value={form.department}
                onChange={handleChange}
                placeholder="e.g., Computer Science"
              />

              <FormField
                label="Year"
                name="year"
                type="select"
                value={form.year}
                onChange={handleChange}
              >
                <option value="">Select year</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
                <option value="graduate">Graduate</option>
              </FormField>

              <FormField
                label="Bio"
                name="bio"
                type="textarea"
                value={form.bio}
                onChange={handleChange}
                rows={4}
                placeholder="Tell us about yourself..."
              />
            </div>
          </Card>

          {/* Action Buttons */}
          <FormActions
            onCancel={() => navigate("/profile/view")}
            onSubmit={handleSubmit}
            cancelText="Cancel"
            submitText="Save Changes"
            loading={loading}
            className="justify-end"
          />
        </form>
      </div>
    </div>
  );
}
