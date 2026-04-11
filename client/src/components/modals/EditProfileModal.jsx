import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useSelector, useDispatch } from "react-redux";
import { selectUserProfile, updateUserProfile } from "../../redux/slices/userSlice";
import { updateAccountDetails, updateAcademicInfo } from "../../api/authApi";
import { updateMentorProfile, getMyMentorProfile } from "../../api/mentoringApi";
import FormField from "@/components/common/FormField";

export default function EditProfileModal({ closeModal }) {
  const { user, updateUser } = useAuth();
  const userProfile = useSelector(selectUserProfile);
  const { showSuccess, showError } = useNotification();
  const dispatch = useDispatch();

  const [form, setForm] = useState({
    firstName: user?.profile?.firstName || "",
    lastName: user?.profile?.lastName || "",
    displayName: user?.profile?.displayName || "",
    email: user?.email || "",
    department: user?.academic?.department || "",
    degree: user?.academic?.degree || "",
    semester: user?.academic?.semester || "",
    cgpa: user?.academic?.cgpa || "",
    bio: user?.profile?.bio || "",
    expertise: [],
  });
  const [skillInput, setSkillInput] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMentorProfile = async () => {
      try {
        const res = await getMyMentorProfile();
        if (res.success && res.data) {
          setForm(prev => ({
            ...prev,
            expertise: res.data.expertise || []
          }));
        }
      } catch (err) {
        console.error("Failed to fetch mentor profile:", err);
      }
    };
    fetchMentorProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleAddSkill = (e) => {
    if ((e.key === "Enter" || e.key === ",") && skillInput.trim()) {
      e.preventDefault();
      const newSkill = skillInput.trim().replace(/,$/, "");
      if (!form.expertise.includes(newSkill)) {
        setForm({ ...form, expertise: [...form.expertise, newSkill] });
      }
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setForm({
      ...form,
      expertise: form.expertise.filter(s => s !== skillToRemove)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateAccountDetails({
        displayName: form.displayName,
        firstName: form.firstName,
        lastName: form.lastName,
        bio: form.bio,
      });

      await updateAcademicInfo({
        department: form.department,
        degree: form.degree,
        semester: parseInt(form.semester),
        cgpa: parseFloat(form.cgpa),
      });

      await updateMentorProfile({
        expertise: form.expertise,
        bio: form.bio,
      });

      if (updateUser) {
        updateUser({ 
          ...user,
          profile: { ...user.profile, displayName: form.displayName, firstName: form.firstName, lastName: form.lastName },
          email: form.email 
        });
      }

      showSuccess("Profile updated successfully!");
      closeModal();
    } catch (error) {
      console.error("Profile update error:", error);
      showError(error?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-background/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={closeModal}
      />
      
      {/* Side-Drawer */}
      <div className="relative w-full max-w-xl bg-surface h-full shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-500 ease-out">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-background/50">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Edit Profile</h2>
            <p className="text-text-secondary text-sm">Update your public information</p>
          </div>
          <button 
            onClick={closeModal}
            className="p-2 text-text-secondary hover:text-white rounded-full hover:bg-[#C7D2FE] transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
<section>
            <h3 className="text-primary text-xs font-bold uppercase tracking-wider mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <FormField
                label="First Name"
                name="firstName"
                type="text"
                value={form.firstName}
                onChange={handleChange}
                required
                className="bg-background border-border"
              />
              <FormField
                label="Last Name"
                name="lastName"
                type="text"
                value={form.lastName}
                onChange={handleChange}
                required
                className="bg-background border-border"
              />
            </div>
            <div className="space-y-5">
              <FormField
                label="Display Name"
                name="displayName"
                type="text"
                value={form.displayName}
                onChange={handleChange}
                required
                placeholder="How you'll appear to students"
                className="bg-background border-border"
              />
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                disabled
                className="bg-background border-border opacity-60 cursor-not-allowed"
                title="Email cannot be changed here"
              />
            </div>
          </section>

<section>
            <h3 className="text-primary text-xs font-bold uppercase tracking-wider mb-4">Academic Details</h3>
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField
                  label="Degree"
                  name="degree"
                  type="text"
                  value={form.degree}
                  onChange={handleChange}
                  placeholder="e.g. BS"
                  className="bg-background border-border"
                />
                <FormField
                  label="Department"
                  name="department"
                  type="text"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g. Computer Science"
                  className="bg-background border-border"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-text-primary">Semester</label>
                  <input
                    type="number"
                    name="semester"
                    value={form.semester}
                    onChange={handleChange}
                    min="1"
                    max="10"
                    placeholder="1-10"
                    className="w-full bg-background border border-border rounded-lg p-2.5 text-text-primary outline-none focus:border-primary transition-colors"
                  />
                </div>
                <FormField
                  label="CGPA"
                  name="cgpa"
                  type="number"
                  step="0.01"
                  min="0"
                  max="4"
                  value={form.cgpa}
                  onChange={handleChange}
                  placeholder="0.00 - 4.00"
                  className="bg-background border-border"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-primary text-xs font-bold uppercase tracking-wider mb-4">Expertise & Skills</h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 mb-2">
                {form.expertise.map((skill, index) => (
                  <span 
                    key={index}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary text-xs font-medium rounded-full animate-in zoom-in-95 duration-200"
                  >
                    {skill}
                    <button 
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:text-text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-text-secondary text-lg">
                  psychology
                </span>
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                  placeholder="Add expertise (e.g. React, UX Design)..."
                  className="w-full bg-background border border-border rounded-lg py-2.5 pl-10 pr-4 text-text-primary outline-none focus:border-primary transition-colors"
                />
              </div>
              <p className="text-[11px] text-text-secondary italic">Press Enter or use commas to add multiple skills.</p>
            </div>
          </section>

          <section>
            <h3 className="text-primary text-xs font-bold uppercase tracking-wider mb-4">About Me</h3>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-text-primary">Short Bio</label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={5}
                placeholder="Tell students about your experience..."
                className="w-full bg-background border border-border rounded-lg p-3 text-text-primary outline-none focus:border-primary transition-colors resize-none"
              />
              <p className="text-[11px] text-text-secondary italic">This will be displayed on your mentor profile.</p>
            </div>
          </section>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border bg-background/50 flex gap-4">
          <button
            type="button"
            onClick={closeModal}
            className="flex-1 px-4 py-2 border border-border text-white rounded-lg hover:bg-[#C7D2FE] transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-[2] px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-[#112118] border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined text-base">save</span>
            )}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
