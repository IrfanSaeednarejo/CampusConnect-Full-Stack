import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ProfileSetup() {
  const navigate = useNavigate();

  const [bio, setBio] = useState("");
  const maxBio = 250;

  return (
    <div className="bg-cc-bg font-display min-h-screen w-full flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-xl border border-cc-border bg-cc-bg-card p-6 md:p-8">
        <div className="flex flex-col gap-8">
          {/* Header + Progress */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-cc-text-primary">
                Set Up Your Profile
              </h1>

              {/* Help Tooltip */}
              <div className="group relative flex items-center">
                <span className="material-symbols-outlined cursor-help text-cc-text-secondary">
                  help
                </span>
                <div className="absolute bottom-full left-1/2 mb-2 w-max -translate-x-1/2 scale-0 transform rounded-md bg-gray-900 px-3 py-1 text-xs text-white transition-all duration-150 group-hover:scale-100">
                  You can update your details anytime in your profile settings.
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="h-2 w-full rounded-full bg-cc-border">
                <div
                  className="h-2 rounded-full bg-cc-primary"
                  style={{ width: "50%" }}
                ></div>
              </div>
              <p className="text-sm text-cc-text-secondary">Step 2 of 4</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-6">
            {/* Major / Department */}
            <label className="flex flex-col gap-2">
              <p className="text-base font-medium text-cc-text-primary">
                Add your major/department
              </p>

              <select className="form-select w-full rounded-lg border border-cc-border bg-[#0d1117] p-3 text-cc-text-primary placeholder:text-cc-text-secondary focus:border-cc-primary focus:outline-none focus:ring-1 focus:ring-cc-primary">
                <option disabled selected>
                  e.g., Computer Science
                </option>
                <option>Computer Science</option>
                <option>Electrical Engineering</option>
                <option>Business Administration</option>
                <option>Mechanical Engineering</option>
                <option>Fine Arts</option>
              </select>
            </label>

            {/* Profile Photo Upload */}
            <div className="flex flex-col gap-2">
              <h2 className="text-base font-medium text-cc-text-primary">
                Profile Photo
              </h2>

              <div className="flex flex-col items-center gap-6 rounded-lg border-2 border-dashed border-cc-border px-6 py-10 text-center">
                <span className="material-symbols-outlined text-4xl text-cc-text-secondary">
                  cloud_upload
                </span>

                <div className="flex flex-col items-center gap-1">
                  <p className="text-lg font-bold text-cc-text-primary">
                    Drag & drop
                  </p>
                  <p className="text-sm text-cc-text-secondary">
                    or click to upload
                  </p>
                </div>

                <button className="flex h-10 cursor-pointer items-center justify-center rounded-lg bg-gray-700 px-4 text-sm font-bold text-cc-text-primary hover:bg-gray-600">
                  Upload Photo
                </button>
              </div>
            </div>

            {/* Short Bio */}
            <label className="flex flex-col gap-2">
              <div className="flex justify-between">
                <p className="text-base font-medium text-cc-text-primary">
                  Short Bio
                </p>
                <p className="text-sm text-cc-text-secondary">
                  {bio.length}/{maxBio}
                </p>
              </div>

              <textarea
                maxLength={maxBio}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="form-textarea min-h-32 w-full resize-none rounded-lg border border-cc-border bg-[#0d1117] p-3 text-cc-text-primary placeholder:text-cc-text-secondary focus:border-cc-primary focus:outline-none focus:ring-1 focus:ring-cc-primary"
                placeholder="Tell us a bit about yourself..."
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-col-reverse items-center gap-3 border-t border-cc-border pt-6 sm:flex-row sm:justify-end">
            <button
              onClick={() => navigate("/onboarding/NotificationsSetup")}
              className="flex h-10 w-full sm:w-auto items-center justify-center rounded-lg bg-transparent px-4 text-sm font-bold text-cc-text-primary hover:bg-white/10"
            >
              Skip
            </button>

            <button
              onClick={() => navigate("/onboarding/NotificationsSetup")}
              className="flex h-10 w-full sm:w-auto items-center justify-center rounded-lg bg-cc-primary px-4 text-sm font-bold text-white hover:opacity-90"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
