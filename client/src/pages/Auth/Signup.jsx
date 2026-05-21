import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, selectRole } from "../../redux/slices/authSlice";
import { validateSignupForm, VALID_ROLES } from "../../utils/authValidator";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export default function Signup() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const selectedRole = useSelector(selectRole);

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
    <AuthShell className="items-center justify-center px-4 py-8">
      <AuthCard className="w-full max-w-5xl overflow-hidden">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div
            className={`relative hidden overflow-hidden border-r p-10 lg:flex lg:flex-col ${
              isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"
            }`}
          >

            <div className="relative flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-black shadow-[0_12px_30px_rgba(29,201,100,0.18)] ${
                  isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-primary"
                }`}
              >
                CN
              </div>
              <div>
                <p className={`text-sm uppercase tracking-[0.32em] ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                  CampusNexus
                </p>
                <p className={`text-xl font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                  Build your campus identity
                </p>
              </div>
            </div>

            <div className="relative mt-12 space-y-5">
              <span
                className={`inline-flex rounded-full border px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] ${
                  isDark ? "border-primary/20 bg-primary/10 text-primary" : "border-primary/20 bg-primary/10 text-primary"
                }`}
              >
                Student-first onboarding
              </span>
              <h1 className={`max-w-md text-4xl font-black leading-tight ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                Create your profile once and take it across notes, mentoring, events, and societies.
              </h1>
              <p className={`max-w-lg text-sm leading-7 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                This refresh updates only the interface. Your sign-up flow, validation, and account creation logic stay exactly the same.
              </p>
            </div>

            <div className="relative mt-auto grid gap-4 pt-12 sm:grid-cols-3">
              {[
                { value: "01", label: "Create your identity" },
                { value: "02", label: "Join your campus circle" },
                { value: "03", label: "Start with a polished profile" },
              ].map((item) => (
                <div
                  key={item.value}
                  className={`rounded-2xl border p-4 backdrop-blur-sm ${
                    isDark ? "border-border-dark bg-background-dark/60" : "border-border-light bg-surface-light/80"
                  }`}
                >
                  <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isDark ? "text-primary" : "text-primary"}`}>
                    {item.value}
                  </p>
                  <p className={`mt-3 text-sm leading-6 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
              <div className="flex flex-col gap-3">
                <span
                  className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                    isDark ? "border-primary/20 bg-primary/10 text-primary" : "border-primary/20 bg-primary/10 text-primary"
                  }`}
                >
                  Create account
                </span>
                <div className="space-y-2">
                  <p className={`text-3xl font-black leading-tight tracking-tight ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                    Create Your Account
                  </p>
                  <p className={`max-w-lg text-sm leading-6 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    Join CampusNexus with a cleaner layout and a more polished sign-up experience.
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
                <div className={`rounded-[24px] border p-5 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-surface-light/80"}`}>
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div
                      className={`group relative flex h-24 w-24 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-[28px] border border-dashed transition-colors ${
                        isDark
                          ? "border-border-dark bg-background-dark hover:border-primary"
                          : "border-border-light bg-surface-light hover:border-primary"
                      }`}
                      onClick={() => document.getElementById("avatar-upload").click()}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className={`material-symbols-outlined text-3xl transition-colors ${isDark ? "text-text-secondary-dark group-hover:text-text-primary-dark" : "text-text-secondary-light group-hover:text-text-primary-light"}`}>
                          add_a_photo
                        </span>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                        Profile picture
                      </p>
                      <p className={`mt-1 text-sm leading-6 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                        Add a clear avatar so your account feels ready from day one.
                      </p>
                      <button
                        type="button"
                        onClick={() => document.getElementById("avatar-upload").click()}
                        className={getButtonClassName({
                          variant: "outline",
                          size: "sm",
                          isDark,
                          className: "mt-3",
                        })}
                      >
                        Choose image
                      </button>
                      <input
                        id="avatar-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                      {errors.avatar && (
                        <p className="mt-3 text-xs text-red-500">{errors.avatar}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="First Name"
                    name="firstName"
                    placeholder="First"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    error={errors.firstName}
                    isDark={isDark}
                  />
                  <FormField
                    label="Last Name"
                    name="lastName"
                    placeholder="Last"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    error={errors.lastName}
                    isDark={isDark}
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
                  helpText="This is how other students will recognize you across CampusNexus."
                  isDark={isDark}
                />

                <FormField
                  label="Email Address"
                  name="email"
                  placeholder="Enter your email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={errors.email}
                  isDark={isDark}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    label="Password"
                    name="password"
                    placeholder="Min 8 chars"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    error={errors.password}
                    isDark={isDark}
                  />
                  <FormField
                    label="Confirm Password"
                    name="confirmPassword"
                    placeholder="Match password"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    error={errors.confirmPassword}
                    isDark={isDark}
                  />
                </div>

                <div className={`rounded-[24px] border p-5 ${isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-surface-light/80"}`}>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>Selected role</p>
                      <p className={`mt-1 text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                        Account setup will continue with your current role selection.
                      </p>
                    </div>
                    <span
                      className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                        isDark ? "border-success/25 bg-success/10 text-green-200" : "border-success/25 bg-success/10 text-success"
                      }`}
                    >
                      {form.role}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pt-2">
                  <FormActions
                    onSubmit={handleSubmit}
                    submitText="Sign Up"
                    submitVariant="primary"
                    className="w-full"
                    isDark={isDark}
                  />
                  <p className={`text-center text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                    Already have an account?{" "}
                    <button
                      type="button"
                      className={getButtonClassName({
                        variant: "ghost",
                        size: "sm",
                        isDark,
                        className: "h-auto min-w-0 px-1 font-medium text-info hover:text-primary",
                      })}
                      onClick={() => navigate("/login")}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
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
            ? "cursor-not-allowed border-[#30363d] bg-[#0d1117] opacity-60"
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
        <span className="text-base font-medium leading-normal text-white">
          {label}
        </span>
      </label>
      {disabled && disabledReason && (
        <p className="px-4 text-xs leading-normal text-[#8b949e]">
          {disabledReason}
        </p>
      )}
    </div>
  );
}
