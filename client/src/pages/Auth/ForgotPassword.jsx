// src/pages/Auth/ForgotPassword.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification } from "@/contexts/NotificationContext.jsx";
import AuthCard from "../../components/auth/AuthCard";
import AuthShell from "../../components/auth/AuthShell";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

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

    // Send password reset email logic here
    setSubmitted(true);
    showSuccess(`Password reset link sent to ${email}`);
    setTimeout(() => {
      navigate("/login");
    }, 1500);
  };

  return (
    <AuthShell className="h-auto items-center justify-center overflow-x-hidden p-4 bg-background group/design-root">
      <div className="flex flex-col items-center justify-center py-10">
        {/* Header with Icon */}
        <div className="flex flex-col items-center gap-4 text-center">
          <svg
            className="h-10 w-10 text-primary"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2ZM8.41 17.41 12 13.83l3.59 3.58L17 16l-3.59-3.59L17 8.83 15.59 7.41 12 11.01 8.41 7.41 7 8.83l3.59 3.58L7 16l1.41 1.41Z"></path>
          </svg>
          <p className="font-bold text-text-primary text-lg">CampusConnect</p>
        </div>

        {/* Form Container */}
        <div className="layout-content-container mt-8 flex w-full max-w-sm flex-col">
          <AuthCard className="p-6 sm:p-8">
            {/* Headings */}
            <div className="flex flex-col gap-3">
              <p className="text-text-primary text-2xl font-bold leading-tight">
                Forgot Your Password?
              </p>
              <p className="text-text-secondary text-sm font-normal leading-normal">
                Enter your registered email and we'll send you instructions to
                reset your password.
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
              {/* Email Input */}
              <FormField
                label="Email Address"
                name="email"
                type="email"
                value={email}
                onChange={handleChange}
                placeholder="e.g., yourname@university.edu"
                error={error}
              />

              {/* Submit Button */}
              <FormActions
                onSubmit={handleSubmit}
                submitText={submitted ? "Link Sent!" : "Send Reset Link"}
                submitVariant="primary"
                disabled={submitted}
                className="flex-col-reverse"
                onCancel={null}
              />
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-primary text-sm font-normal leading-normal hover:underline cursor-pointer"
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
