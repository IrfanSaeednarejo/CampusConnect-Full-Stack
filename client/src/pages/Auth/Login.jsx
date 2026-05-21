import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, selectPendingAction } from "../../redux/slices/authSlice";
import { validateLoginForm } from "../../utils/authValidator";
import AuthBrand from "../../components/auth/AuthBrand";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const pendingAction = useSelector(selectPendingAction);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

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

    try {
      const resultAction = await dispatch(loginUser({
        email: form.email,
        password: form.password
      }));

      if (loginUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload.user || resultAction.payload;
        const userRoles = user?.roles || [];
        const isAdmin = userRoles.some(role => ["super_admin", "campus_admin", "admin"].includes(role));

        if (!pendingAction) {
          if (isAdmin) {
            navigate('/admin/dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      } else {
        setErrors({ email: resultAction.payload || "Login failed" });
      }
    } catch (error) {
      console.error('Login error occurred', error);
      setErrors({ email: "An unexpected error occurred" });
    }
  };

  return (
    <AuthShell className="h-auto overflow-x-hidden">
      <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="layout-content-container flex w-full max-w-[440px] flex-1 flex-col gap-8">
          <AuthBrand
            title="Sign In to CampusNexus"
            subtitle="Enter your credentials to access your personalized campus experience."
          />

          <AuthCard className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email address"
                error={errors.email}
                isDark={isDark}
              />

              <div className="flex flex-col w-full">
                <div className="flex justify-between items-baseline mb-2">
                  <p className={`text-sm font-medium leading-normal ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                    Password
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className={getButtonClassName({
                      variant: "ghost",
                      size: "sm",
                      isDark,
                      className: "min-w-0 px-0 text-xs font-medium text-info hover:text-primary",
                    })}
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
                  isDark={isDark}
                />
              </div>

              <FormActions
                onSubmit={handleSubmit}
                submitText="Sign in"
                submitVariant="primary"
                submitClassName="h-11 rounded-xl"
                className="pt-2"
                onCancel={null}
                isDark={isDark}
              />
            </form>
          </AuthCard>

          <div
            className={`flex justify-center rounded-2xl border px-5 py-4 ${
              isDark ? "border-border-dark bg-surface-dark/70" : "border-border-light bg-surface-light/80"
            }`}
          >
            <p className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              New to CampusNexus?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className={getButtonClassName({
                  variant: "ghost",
                  size: "sm",
                  isDark,
                  className: "h-auto min-w-0 px-1 text-sm text-info hover:text-primary",
                })}
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
