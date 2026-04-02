import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";

export default function ResetPassword() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    const password = form.password;
    if (!password) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;

    if (strength <= 1)
      return { strength: 1, label: "Weak", color: "bg-red-500" };
    if (strength === 2)
      return { strength: 2, label: "Medium", color: "bg-yellow-500" };
    if (strength === 3)
      return { strength: 3, label: "Good", color: "bg-blue-500" };
    return { strength: 4, label: "Strong", color: "bg-green-500" };
  }, [form.password]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.password) {
      newErrors.password = "Password is required";
    } else if (form.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Password reset logic here
    showSuccess("Password reset successfully! Redirecting to login...");
    setTimeout(() => {
      navigate("/login");
    }, 500);
  };

  return (
    <AuthShell className="bg-background text-[#e6edf3] group/design-root">
      <div className="flex flex-1 items-center justify-center py-5 px-4 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-md flex-col items-center space-y-8">
          {/* Header */}
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-auto text-[#1dc964]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M17.834 16.834l-1.591-1.591M4.5 12.007H2.25m3.166-5.833L4.166 4.584m12.168 0L14.834 6.166m-1.208 9.025L12.007 18M4.166 19.834l1.591-1.591"
                strokeLinecap="round"
                strokeLinejoin="round"
              ></path>
            </svg>
            <h1 className="mt-6 text-3xl font-black tracking-tighter text-[#e6edf3]">
              CampusConnect
            </h1>
          </div>

          {/* Form Card */}
          <AuthCard className="p-8">
            {/* Headings */}
            <div className="flex flex-col gap-2 mb-6">
              <p className="text-[#e6edf3] text-2xl font-bold leading-tight">
                Reset Your Password
              </p>
              <p className="text-text-secondary text-sm font-normal leading-normal">
                Create a new, strong password for your account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {/* New Password */}
                <div className="flex flex-col">
                  <FormField
                    label="New Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your new password"
                    error={errors.password}
                  />
                  {/* Toggle password visibility */}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-9 text-text-secondary hover:text-[#e6edf3]"
                    style={{ marginTop: "2.5rem" }}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                  {/* Password Strength Indicator */}
                  {form.password && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="h-1 flex-1 rounded-full bg-[#30363d] overflow-hidden">
                        <div
                          className={`h-1 ${passwordStrength.color} transition-all`}
                          style={{
                            width: `${(passwordStrength.strength / 4) * 100}%`,
                          }}
                        ></div>
                      </div>
                      <p
                        className={`text-xs ${passwordStrength.color.replace("bg-", "text-")}`}
                      >
                        {passwordStrength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col relative">
                  <FormField
                    label="Confirm New Password"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your new password"
                    error={errors.confirmPassword}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-9 text-text-secondary hover:text-[#e6edf3]"
                    style={{ marginTop: "2.5rem" }}
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showConfirmPassword ? "visibility" : "visibility_off"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Reset Button */}
              <FormActions
                onSubmit={handleSubmit}
                submitText="Reset Password"
                submitVariant="primary"
                className="flex-col-reverse"
                onCancel={null}
              />
            </form>
          </AuthCard>

          {/* Sign In Link */}
          <p className="text-center text-sm text-text-secondary">
            Remember your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium text-[#1dc964] hover:underline cursor-pointer"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
