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
import {
  validateAccountUniqueness,
  createMockAccount,
} from "../../utils/accountService";
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
    role: initialRole, // Default to selected role or student
  });

  const [errors, setErrors] = useState({});

  // Sync role from role selection or stored role when available
  React.useEffect(() => {
    if (locationRole && form.role !== locationRole) {
      setForm((prev) => ({ ...prev, role: locationRole }));
      return;
    }
    if (!locationRole && selectedRole && form.role !== selectedRole) {
      setForm((prev) => ({ ...prev, role: selectedRole }));
    }
  }, [locationRole, selectedRole, form.role]);

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // STEP 1: Check account uniqueness (email and username)
    const uniquenessCheck = validateAccountUniqueness(form.email, form.fullName);
    if (!uniquenessCheck.isValid) {
      // Display uniqueness error(s)
      showError(uniquenessCheck.errors[0]); // Show first error
      setErrors({ email: uniquenessCheck.errors[0] });
      return;
    }

    // STEP 2: Create account in mock system
    // In production, this would be a backend POST /api/auth/signup
    const accountCreation = createMockAccount({
      email: form.email,
      fullName: form.fullName,
      password: form.password,
      role: form.role,
    });

    if (!accountCreation.success) {
      showError(accountCreation.error || "Unable to create account");
      return;
    }

    // STEP 3: Create user data for Redux store and Context
    const userData = {
      user: {
        id: accountCreation.account.id,
        name: form.fullName,
        email: form.email,
        avatar: "",
        department: "",
      },
      role: form.role,
      token: "mock-signup-token-" + Date.now(),
    };

    // STEP 4: Dispatch Redux actions to store auth and user data
    dispatch(loginSuccess(userData));
    dispatch(setRole(form.role));
    dispatch(setUserProfile({
      id: userData.user.id,
      name: form.fullName,
      email: form.email,
      avatar: "",
      department: "",
    }));

    // STEP 5: Update AuthContext as well for immediate access
    contextLogin(userData.user, userData.token, form.role);

    // Show success notification and navigate to onboarding
    showSuccess("Account created successfully! Redirecting to onboarding...");
    setTimeout(() => {
      navigate("/onboarding/welcome");
    }, 500);
  };

  return (
    <AuthShell className="items-center justify-center bg-[#111714] p-4">
      <AuthCard className="max-w-md rounded-xl border-[#3d5246] p-8 flex flex-col items-center gap-8">
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
              submitText="Sign Up"
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
        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${
          disabled
            ? "border-[#30363d] bg-[#0d1117] opacity-60 cursor-not-allowed"
            : checked
              ? "border-[#1dc964] bg-[#1c2620] ring-2 ring-[#1dc964]/50"
              : "border-[#3d5246] bg-[#1c2620]"
        }`}
      >
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="form-radio h-5 w-5 border-[#9eb7a9] bg-transparent text-[#1dc964] focus:ring-[#1dc964]/50 focus:ring-offset-0 focus:ring-offset-transparent disabled:opacity-50"
        />
        <span className="text-white text-base font-medium leading-normal">
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
