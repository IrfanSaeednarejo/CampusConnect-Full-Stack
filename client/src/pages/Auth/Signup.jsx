import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, setRole, selectRole } from "../../redux/slices/authSlice";
import { setUserProfile } from "../../redux/slices/userSlice";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
  validateSignupForm,
  VALID_ROLES,
} from "../../utils/authValidator";
import { signup as signupApi } from "../../api/authApi";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const selectedRole = useSelector(selectRole);
  const { login: contextLogin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const locationRole = location.state?.role;
  const initialRole = locationRole || selectedRole || VALID_ROLES.STUDENT;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync role from role-selection page or Redux on initial mount only.
  // IMPORTANT: Do NOT include form.role in deps — it causes an infinite
  // reset loop where every radio-button click re-triggers the effect.
  React.useEffect(() => {
    const incomingRole = locationRole || selectedRole;
    if (incomingRole) {
      setForm((prev) => ({ ...prev, role: incomingRole }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  // Use secure validation from authValidator
  const validate = () => {
    const validation = validateSignupForm(form);
    return validation.errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Build FormData for the backend (supports file uploads)
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("roles", form.role);

      // Split fullName into firstName and lastName for the backend
      const nameParts = form.fullName.trim().split(/\s+/);
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);

      // Generate a displayName from fullName
      const displayName = form.fullName.trim().toLowerCase().replace(/\s+/g, ".");
      formData.append("displayName", displayName);

      // Call the real backend API
      const response = await signupApi(formData);

      // Backend returns: { statusCode, data: { ...userObject }, message, success }
      const user = response.data;
      

      // Determine the user's primary role
      const userRole = user?.roles?.[0] || form.role;

      // Store only the role choice in Redux so it pre-fills the login form if needed,
      // but DO NOT auto-login, forcing the user to use the /login page.
      dispatch(setRole(userRole));

      showSuccess("Account created successfully! Please log in.");
      setTimeout(() => {
        navigate("/login");
      }, 500);
    } catch (error) {
      console.error("Signup error occurred");
      const errorMessage = error?.message || "Unable to create account. Please try again.";
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell className="items-center justify-center bg-[#0d1117] p-4">
      <AuthCard className="max-w-md rounded-2xl border-white/5 p-8 flex flex-col items-center gap-8 glass shadow-2xl">
        {/* Page Heading */}
        <div className="flex w-full flex-col gap-3 text-center">
          <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
            Create Your Account
          </p>
          <p className="text-[#9eb7a9] text-base font-normal leading-normal">
            Join CampusConnect and unlock powerful tools for campus success.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
          {/* Text Fields */}
          <div className="flex flex-col gap-4">
            <FormField
              label="Full Name"
              name="fullName"
              placeholder="Enter your full name"
              type="text"
              value={form.fullName}
              onChange={handleChange}
              error={errors.fullName}
            />
            <FormField
              label="Email Address"
              name="email"
              placeholder="Enter your email"
              type="email"
              value={form.email}
              onChange={handleChange}
              error={errors.email}
            />
            <FormField
              label="Password"
              name="password"
              placeholder="minimum 8 characters"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
            <FormField
              label="Confirm Password"
              name="confirmPassword"
              placeholder="Re-enter your password"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>

          {/* Role Selector */}
          <div className="flex flex-col gap-2">
            <p className="text-white text-base font-medium leading-normal">
              Select Your Role
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <RoleRadio
                name="role"
                value={VALID_ROLES.STUDENT}
                label="Student"
                checked={form.role === VALID_ROLES.STUDENT}
                onChange={handleChange}
              />
              <RoleRadio
                name="role"
                value={VALID_ROLES.MENTOR}
                label="Mentor"
                checked={form.role === VALID_ROLES.MENTOR}
                onChange={handleChange}
              />
              <RoleRadio
                name="role"
                value={VALID_ROLES.SOCIETY_HEAD}
                label="Society Head"
                checked={form.role === VALID_ROLES.SOCIETY_HEAD}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-4 pt-4">
            <FormActions
              onSubmit={handleSubmit}
              submitText={isSubmitting ? "Creating account..." : "Sign Up"}
              submitVariant="primary"
              className="flex-col-reverse"
              onCancel={null}
            />
            <p className="text-center text-base font-normal leading-normal text-[#9eb7a9]">
              Already have an account?{" "}
              <button
                type="button"
                className="font-medium text-[#1dc964] hover:underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
function RoleRadio({ name, value, label, checked, onChange, disabled = false, disabledReason = "" }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-3 transition-colors whitespace-nowrap text-center ${
          disabled
            ? "border-[#30363d] bg-[#0d1117] opacity-60 cursor-not-allowed"
            : checked
              ? "border-[#1dc964] bg-[#1c2620] ring-2 ring-[#1dc964]/50"
              : "border-[#3d5246] bg-[#1c2620] hover:border-[#1dc964]/40"
        }`}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="form-radio h-4 w-4 shrink-0 border-[#9eb7a9] bg-transparent text-[#1dc964] focus:ring-[#1dc964]/50 focus:ring-offset-0 focus:ring-offset-transparent disabled:opacity-50"
        />
        <span className="text-white text-sm font-medium leading-normal">
          {label}
        </span>
      </label>
      {disabled && disabledReason && (
        <p className="text-[#8b949e] text-xs leading-normal px-4">
          {disabledReason}
        </p>
      )}
    </div>
  );
}
