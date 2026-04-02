import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setRole } from "../../redux/slices/authSlice";
import AuthShell from "../../components/auth/AuthShell";
import Button from "../../components/common/Button";

export default function RoleSelection() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
      return; // Button is disabled, but double-check
    }
    
    // Store selected role in Redux
    dispatch(setRole(selectedRole));
    
    // Navigate to signup with role in state as backup
    navigate("/signup", { state: { role: selectedRole } });
  };

  return (
    <AuthShell className="h-auto items-center justify-center overflow-x-hidden p-4 bg-background group/design-root">
      <div className="flex flex-col items-center justify-center py-10">
          {/* Header */}
          <div className="flex flex-col items-center gap-4 text-center mb-8">
            <svg
              className="h-12 w-12 text-primary"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path>
            </svg>
            <div className="flex flex-col gap-2">
              <p className="text-text-primary text-3xl font-bold leading-tight tracking-[-0.033em]">
                Choose Your Role
              </p>
              <p className="text-text-secondary text-base font-normal leading-normal max-w-lg">
                Select the role that best describes you. You can always change
                this later in your profile settings.
              </p>
            </div>
          </div>

          {/* Role Selection Cards */}
          <div className="layout-content-container w-full max-w-2xl flex flex-col gap-4">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleRoleSelect(role.id)}
                className={`flex flex-col gap-4 p-6 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedRole === role.id
                    ? "border-primary bg-[#1c2620]"
                    : "border-border bg-surface hover:border-border/80"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex gap-4 items-start flex-1">
                    <div className="text-4xl">{role.icon}</div>
                    <div className="flex flex-col gap-1 text-left">
                      <p className="text-text-primary text-lg font-bold leading-tight">
                        {role.title}
                      </p>
                      <p className="text-text-secondary text-sm font-normal leading-normal">
                        {role.description}
                      </p>
                    </div>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                      selectedRole === role.id
                        ? "border-primary bg-primary"
                        : "border-border"
                    }`}
                  >
                    {selectedRole === role.id && (
                      <svg
                        className="w-4 h-4 text-white"
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

          {/* Action Buttons */}
          <div className="layout-content-container w-full max-w-2xl flex flex-col gap-4 mt-8">
            <Button
              onClick={handleContinue}
              disabled={!selectedRole}
              variant="primary"
              className="w-full h-12 text-base"
            >
              Continue
            </Button>
            <Button
              onClick={() => navigate("/login")}
              variant="secondary"
              className="w-full h-12 text-base"
            >
              Back to Login
            </Button>
          </div>

          {/* Already have an account */}
          <div className="mt-8 text-center">
            <p className="text-text-secondary text-base">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                className="text-primary hover:underline cursor-pointer font-medium"
              >
                Sign in
              </button>
            </p>
          </div>
      </div>
    </AuthShell>
  );
}
