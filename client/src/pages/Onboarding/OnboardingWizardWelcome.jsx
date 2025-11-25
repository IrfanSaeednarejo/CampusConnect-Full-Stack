// src/pages/OnboardingWizardWelcome.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingWizardWelcome() {
  const navigate = useNavigate();

  const handleStart = () => {
    // Navigate to the next onboarding step (Profile Setup)
    navigate("/onboarding/profileSetup");
  };

  return (
    <div className="bg-background-dark font-display min-h-screen flex items-center justify-center p-4">
      <div className="flex w-full max-w-lg flex-col items-center justify-center text-center">
        {/* Progress Indicator */}
        <div className="mb-4">
          <p className="text-[#8b949e] text-sm font-normal leading-normal">
            Step 1 of 4
          </p>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-[#c9d1d9] text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
            Nice to meet you!
          </h1>
          <p className="mt-3 text-[#8b949e] text-base font-normal leading-normal">
            Let’s personalize your experience on CampusConnect.
          </p>
        </div>

        {/* Start Button */}
        <div className="w-full max-w-xs">
          <button
            onClick={handleStart}
            className="flex w-full min-w-[84px] cursor-pointer items-center justify-center rounded-lg h-12 px-5 bg-primary text-white text-base font-bold tracking-[0.015em] transition-colors hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          >
            <span className="truncate">Start</span>
          </button>
        </div>
      </div>
    </div>
  );
}
