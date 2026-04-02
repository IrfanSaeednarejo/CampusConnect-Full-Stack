import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectUserProfile, updateUserProfile } from "../../redux/slices/userSlice";
import { updateAccountDetails, updateAcademicInfo } from "../../api/authApi";
import { getAllCampuses } from "../../api/campusApi";
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
  
  const [campuses, setCampuses] = useState([]);

  const [form, setForm] = useState({
    name: user?.name || userProfile?.name || "",
    email: user?.email || userProfile?.email || "",
    department: userProfile?.department || "",
    year: userProfile?.year || "",
    bio: userProfile?.bio || "",
    campusId: user?.campusId || userProfile?.campusId || "",
  });

  useEffect(() => {
    const fetchCampuses = async () => {
      try {
        const res = await getAllCampuses();
        setCampuses(res.data?.campuses || []);
      } catch (err) {
        console.error("Failed to fetch campuses:", err);
      }
    };
    fetchCampuses();
  }, []);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call the real backend API to persist the profile update
      await updateAccountDetails({
        displayName: form.name,
        firstName: form.name.split(' ')[0],
        lastName: form.name.split(' ').slice(1).join(' '),
        bio: form.bio,
        campusId: form.campusId,
      });

      // Also persist academic updates (department/year)
      if (form.department || form.year) {
        await updateAcademicInfo({
          department: form.department,
          semester: form.year === "graduate" ? 0 : parseInt(form.year) * 2,
        });
      }

      // Update user in AuthContext with fresh data
      if (updateUser) {
        updateUser({
          name: form.name,
          email: form.email,
          campusId: form.campusId
        });
      }

      // Update Redux store
      dispatch(updateUserProfile(form));

      showSuccess("Profile updated successfully!");

      // Redirect back — mentors go to mentor profile, others to general profile
      const isMentor = user?.role === 'mentor' || userProfile?.role === 'mentor';
      setTimeout(() => navigate(isMentor ? "/mentor-profile-view" : "/profile/view"), 500);
    } catch (error) {
      console.error("Profile update error:", error);
      showError(error?.message || "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-background text-text-primary min-h-screen">
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
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors text-sm font-medium"
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

              <FormField
                label="Campus"
                name="campusId"
                type="select"
                value={form.campusId}
                onChange={handleChange}
                required
              >
                <option value="">Select your campus</option>
                {campuses.map((campus) => (
                  <option key={campus._id} value={campus._id}>
                    {campus.name}
                  </option>
                ))}
              </FormField>
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
