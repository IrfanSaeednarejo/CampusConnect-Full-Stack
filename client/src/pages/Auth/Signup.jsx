import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, setRole, selectRole } from "../../redux/slices/authSlice";
import { setUserProfile } from "../../redux/slices/userSlice";
import {
  validateSignupForm,
  VALID_ROLES,
} from "../../utils/authValidator";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const selectedRole = useSelector(selectRole);

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

    try {
      const resultAction = await dispatch(registerUser({
        email: form.email,
        fullName: form.fullName,
        password: form.password,
        role: form.role,
      }));

      if (registerUser.fulfilled.match(resultAction)) {
        dispatch(setRole(form.role));
        dispatch(setUserProfile({
          id: resultAction.payload.user?.id || resultAction.payload.id,
          name: form.fullName,
          email: form.email,
          avatar: "",
          department: "",
        }));

        setTimeout(() => {
          navigate("/onboarding/welcome");
        }, 500);
      } else {
        setErrors({ email: resultAction.payload || "Registration failed" });
      }
    } catch (err) {
      console.error("Signup error:", err);
      setErrors({ email: "An unexpected error occurred" });
    }
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

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
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
        className={`flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors ${disabled
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
