import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import AuthBrand from "../../components/auth/AuthBrand";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import useHomeTheme from "../../hooks/useHomeTheme";
import { getButtonClassName } from "../../components/common/Button";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showSuccess } = useNotification();
  const isDark = useHomeTheme();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    setError("");
  };

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
      setError("Email is invalid");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setSubmitted(true);
    showSuccess(`Password reset link sent to ${email}`);
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <AuthShell className="h-auto items-center justify-center overflow-x-hidden p-4">
      <div className="flex w-full max-w-[440px] flex-col items-center justify-center py-8 sm:py-12">
        <AuthBrand
          compact
          title="Forgot your password?"
          subtitle="Enter your registered email and we’ll send you instructions to reset your password."
        />

        <div className="layout-content-container mt-8 flex w-full flex-col">
          <AuthCard className="p-6 sm:p-8">
            <div className="flex flex-col gap-3">
              <p className={`text-sm font-normal leading-relaxed ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                We’ll send a secure reset link to the inbox connected to your account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="e.g., yourname@university.edu"
                error={error}
                isDark={isDark}
              />

              <FormActions
                onSubmit={handleSubmit}
                submitText={submitted ? "Link Sent!" : "Send Reset Link"}
                submitVariant="primary"
                disabled={submitted}
                submitClassName="h-11 rounded-xl"
                className="pt-1"
                onCancel={null}
                isDark={isDark}
              />
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={getButtonClassName({
                  variant: "ghost",
                  size: "sm",
                  isDark,
                  className: "h-auto min-w-0 px-2 text-sm text-info hover:text-primary",
                })}
              >
                Back to login
              </button>
            </div>
          </AuthCard>
        </div>
      </div>
    </AuthShell>
  );
}
