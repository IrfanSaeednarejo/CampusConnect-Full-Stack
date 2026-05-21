import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRole } from "../../redux/slices/authSlice";
import AuthShell from "../../components/auth/AuthShell";
import Button from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function RoleSelection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const [selectedRole, setSelectedRole] = useState(null);

  const roles = [
    {
      id: "student",
      title: "Student",
      description:
        "Join events, find mentors, and connect with peers to enhance your campus experience.",
      icon: "👨‍🎓",
    },
    {
      id: "mentor",
      title: "Mentor",
      description:
        "Share your expertise, guide junior students, and build meaningful relationships through mentoring.",
      icon: "🎓",
    },
    {
      id: "society_head",
      title: "Society Head",
      description:
        "Lead your society, organize events, manage members, and drive community engagement.",
      icon: "🏛️",
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
  };

  const handleContinue = () => {
    if (!selectedRole) {
      return;
    }

    dispatch(setRole(selectedRole));
    navigate("/signup", { state: { role: selectedRole } });
  };

  return (
    <AuthShell className="group/design-root h-auto items-center justify-center overflow-x-hidden p-4">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <svg
            className={`h-12 w-12 ${isDark ? "text-primary-dark" : "text-primary-light"}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
          </svg>
          <div className="flex flex-col gap-2">
            <p className={`text-3xl font-semibold leading-tight tracking-tight ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
              Choose Your Role
            </p>
            <p className={`max-w-[500px] text-base font-normal leading-normal ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              Select the role that best describes you. You can always change
              this later in your profile settings.
            </p>
          </div>
        </div>

        <div className="layout-content-container flex w-full max-w-2xl flex-col gap-4">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => handleRoleSelect(role.id)}
              className={`flex cursor-pointer flex-col gap-4 rounded-lg border-2 p-6 transition-all ${
                selectedRole === role.id
                    ? isDark
                    ? "border-primary-dark bg-primary-dark/10"
                    : "border-primary-light bg-primary-light/10"
                  : isDark
                    ? "border-border-dark bg-surface-dark hover:border-border-dark/80"
                    : "border-border-light bg-surface-light hover:border-border-light/80"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex flex-1 items-start gap-4">
                  <div className="text-4xl">{role.icon}</div>
                  <div className="flex flex-col gap-1 text-left">
                    <p className={`text-lg font-semibold leading-tight ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
                      {role.title}
                    </p>
                    <p className={`text-sm font-normal leading-normal ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
                      {role.description}
                    </p>
                  </div>
                </div>
                <div
                  className={`mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                    selectedRole === role.id
                      ? `${isDark ? "border-primary-dark bg-primary-dark" : "border-primary-light bg-primary-light"}`
                      : isDark
                        ? "border-border-dark"
                        : "border-border-light"
                  }`}
                >
                  {selectedRole === role.id && (
                    <svg
                      className="h-4 w-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="layout-content-container mt-8 flex w-full max-w-2xl flex-col gap-4">
          <Button
            onClick={handleContinue}
            disabled={!selectedRole}
            variant="primary"
            className="h-12 w-full text-base"
          >
            Continue
          </Button>
          <Button
            onClick={() => navigate("/login")}
            variant="secondary"
            className="h-12 w-full text-base"
          >
            Back to Login
          </Button>
        </div>

        <div className="mt-8 text-center">
          <p className={`text-base ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className={`cursor-pointer font-medium hover:underline ${isDark ? "text-primary-dark" : "text-primary-light"}`}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </AuthShell>
  );
}
