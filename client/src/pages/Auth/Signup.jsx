import React, { useState } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, setRole, selectRole, selectIsAuthenticated } from "../../redux/slices/authSlice";
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
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // ── Already logged in → skip signup page ──
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const initialRole = location.state?.role || selectedRole || VALID_ROLES.STUDENT;

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: initialRole,
    avatar: null,
  });

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, avatar: file });
      setAvatarPreview(URL.createObjectURL(file));
      setErrors({ ...errors, avatar: "" });
    }
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
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("displayName", form.displayName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      if (form.avatar) {
        formData.append("avatar", form.avatar);
      }

      const resultAction = await dispatch(registerUser(formData));

      if (registerUser.fulfilled.match(resultAction)) {
        navigate("/onboarding/welcome", { replace: true });
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
      <AuthCard className="max-w-md w-full rounded-xl border-[#3d5246] p-8 flex flex-col items-center gap-6">
        <div className="flex w-full flex-col gap-2 text-center">
          <p className="text-white text-3xl font-black leading-tight tracking-tight">
            Create Your Account
          </p>
          <p className="text-[#9eb7a9] text-sm">
            Join CampusConnect and unlock your potential.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4">
          <div className="flex flex-col items-center gap-2">
            <div 
              className="w-24 h-24 rounded-full border-2 border-dashed border-[#3d5246] flex items-center justify-center overflow-hidden bg-[#1c2620] cursor-pointer"
              onClick={() => document.getElementById('avatar-upload').click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-3xl text-[#9eb7a9]">add_a_photo</span>
              )}
            </div>
            <input 
              id="avatar-upload"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
            <p className="text-xs text-[#9eb7a9]">Upload Profile Picture (Required)</p>
            {errors.avatar && <p className="text-red-500 text-xs">{errors.avatar}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              name="firstName"
              placeholder="First"
              type="text"
              value={form.firstName}
              onChange={handleChange}
              error={errors.firstName}
            />
            <FormField
              label="Last Name"
              name="lastName"
              placeholder="Last"
              type="text"
              value={form.lastName}
              onChange={handleChange}
              error={errors.lastName}
            />
          </div>

          <FormField
            label="Display Name"
            name="displayName"
            placeholder="Unique username"
            type="text"
            value={form.displayName}
            onChange={handleChange}
            error={errors.displayName}
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

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Password"
              name="password"
              placeholder="Min 8 chars"
              type="password"
              value={form.password}
              onChange={handleChange}
              error={errors.password}
            />
            <FormField
              label="Confirm"
              name="confirmPassword"
              placeholder="Match pass"
              type="password"
              value={form.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>

          <div className="flex flex-col gap-4 pt-2">
            <FormActions
              onSubmit={handleSubmit}
              submitText="Sign Up"
              submitVariant="primary"
              className="w-full"
            />
            <p className="text-center text-sm text-[#9eb7a9]">
              Already have an account?{" "}
              <button
                type="button"
                className="font-bold text-[#1dc964] hover:underline"
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
