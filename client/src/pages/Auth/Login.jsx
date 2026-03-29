import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "../../redux/slices/authSlice";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import { useAuth } from "@/contexts/AuthContext.jsx";
import {
  validateLoginForm,
  getGenericAuthError,
  getDashboardRoute,
} from "../../utils/authValidator";
import { login as loginApi } from "../../api/authApi";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { login: contextLogin } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const validate = () => {
    const validation = validateLoginForm(form);
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
    dispatch(loginStart());

    try {
      // Call the real backend API
      const response = await loginApi({
        email: form.email,
        password: form.password,
      });

      // Backend returns: { statusCode, data: { user, accessToken, refreshToken }, message }
      const { user, accessToken } = response.data.data;

      // Determine the user's primary role (backend returns roles as an array)
      const userRole = user.roles?.[0] || "student";

      // Create auth data for Redux
      const authData = {
        user: {
          id: user._id,
          name: user.profile?.displayName || user.profile?.firstName || "User",
          email: user.email,
          avatar: user.profile?.avatar || "",
          department: user.profile?.department || "",
        },
        role: userRole,
        token: accessToken,
      };

      // Store in Redux
      dispatch(loginSuccess(authData));

      // Store in AuthContext
      contextLogin(authData.user, authData.token, authData.role);

      showSuccess("Login successful! Redirecting...");

      // Navigate to appropriate dashboard
      const dashboardUrl = getDashboardRoute(userRole);
      setTimeout(() => {
        navigate(dashboardUrl);
      }, 500);
    } catch (error) {
      console.error("Login error occurred");
      const errorMessage = error?.message || getGenericAuthError();
      dispatch(loginFailure(errorMessage));
      showError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell className="h-auto bg-[#0d1117] group/design-root overflow-x-hidden">
      <div className="px-4 flex flex-1 justify-center items-center py-10">
        <div className="layout-content-container flex flex-col w-full max-w-[384px] flex-1">
            {/* Header */}
            <div className="flex flex-col items-center gap-4 text-center mb-8">
              <div className="w-16 h-16 rounded-full bg-[#238636] flex items-center justify-center shadow-2xl shadow-[#238636]/40 border border-white/10 glass">
                <svg
                  className="w-8 h-8"
                  fill="white"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="white" />
                </svg>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[#c9d1d9] text-2xl font-semibold leading-tight tracking-[-0.033em]">
                  Sign In to CampusConnect
                </p>
                <p className="text-[#8b949e] text-sm font-normal leading-normal">
                  Enter your credentials to access your personalized campus
                  experience.
                </p>
              </div>
            </div>

            {/* Form */}
            <AuthCard className="p-8 glass border-white/5 shadow-2xl">
              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Email */}
                <FormField
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  error={errors.email}
                />

                {/* Password */}
                <div className="flex flex-col w-full">
                  <div className="flex justify-between items-baseline mb-2">
                    <p className="text-[#c9d1d9] text-sm font-medium leading-normal">
                      Password
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate("/forgot-password")}
                      className="text-[#58a6ff] text-xs font-normal leading-normal hover:underline"
                    >
                      Forgot your password?
                    </button>
                  </div>
                  <FormField
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    error={errors.password}
                  />
                </div>

                {/* Sign In Button */}
                <FormActions
                  onSubmit={handleSubmit}
                  submitText={isSubmitting ? "Signing in..." : "Sign in"}
                  submitVariant="primary"
                  className="flex-col-reverse"
                  onCancel={null}
                />
              </form>
            </AuthCard>

            {/* Sign Up Link */}
            <div className="flex justify-center mt-6 p-4 border border-[#30363d] rounded-lg">
              <p className="text-[#8b949e] text-sm">
                New to CampusConnect?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="text-[#58a6ff] hover:underline cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </div>
        </div>
      </div>
    </AuthShell>
  );
}
