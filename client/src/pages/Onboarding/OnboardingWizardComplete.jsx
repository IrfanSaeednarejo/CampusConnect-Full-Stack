import React from "react";
import { useNavigate } from "react-router-dom";

export default function OnboardingWizardComplete() {
  const navigate = useNavigate();

  return (
    <div className="bg-background-dark font-display min-h-screen flex items-center justify-center p-4">
      <main className="flex w-full max-w-lg flex-col items-center justify-center">
        <div className="flex w-full flex-col items-center gap-8 rounded-lg border border-border-dark bg-container-dark p-6 sm:p-10">
          {/* Wizard Progress Bar */}
          <div className="w-full">
            <div className="flex justify-between">
              <p className="text-sm font-medium text-text-light/80">
                Step 4 of 4: Complete
              </p>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-border-dark">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>

          {/* Large Icon */}
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
            <span className="material-symbols-outlined text-6xl text-primary">
              check
            </span>
          </div>

          {/* Headline + Body */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-text-light">
              You’re all set!
            </h1>
            <p className="max-w-xs text-base text-text-light/80">
              Your profile is ready. Explore your dashboard to get started.
            </p>
          </div>

          {/* Go to Dashboard Button */}
          <div className="w-full pt-4">
            <button
              onClick={() => navigate("/dashboard/generalDashboard")}
              className="flex h-12 w-full items-center justify-center rounded-lg bg-button-primary-bg text-base font-bold text-button-primary-text hover:bg-button-primary-hover-bg transition-colors"
            >
              <span className="truncate">Go to Dashboard</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
