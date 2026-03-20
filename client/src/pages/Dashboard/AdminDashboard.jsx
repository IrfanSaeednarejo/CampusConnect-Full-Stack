import { useState } from "react";
import Switch from "@/components/common/Switch";

export default function AdminDashboard() {
  const [accountStatus, setAccountStatus] = useState("active");
  const [permissions, setPermissions] = useState({
    createSocieties: true,
    manageEvents: true,
    accessMentoring: true,
    joinEvents: true,
    postForums: false,
  });

  const handlePermissionChange = (key) => {
    setPermissions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-white">User Administration</h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage user details, roles, and actions for Alani Sharma.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - User Profile & Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 flex flex-col items-center">
              <img
                alt="Alani Sharma"
                className="w-28 h-28 rounded-full mb-4 ring-2 ring-offset-4 ring-offset-[#161b22] ring-[#238636]"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBj205jPYUbzbQvUsmETK0mVepYmXPux5bWzjsVMEPZQsrqnpcgRxBcyq7XuC7S5vsQR2-ZyDoTzz8A16eDTJaj6hdZDcof28vFdws3cHgwNktCRh5FaevNkxW1n7BICos5R7vr_893I3NKG0yvnEZ_ZTJUXxVUgb4nnqQdp-s5YRWpNKUkViaZ3tzmXKYpmxWdZtKJ_eCErYuZjED_YSWTkhDiPOieqmz7EILOlVdxV6l8wxzas29yRxFgNzPdNUeVcNJ_VhSbfno"
              />
              <h2 className="text-2xl font-bold text-white">Alani Sharma</h2>
              <p className="text-[#8b949e]">@alani.s</p>
              <span className="mt-3 text-xs font-medium bg-green-900/50 text-[#238636] py-1 px-3 rounded-full border border-green-700/50">
                Mentor
              </span>

              {/* User Info */}
              <div className="w-full text-left mt-6 space-y-3 text-sm">
                <div className="flex items-center">
                  <span className="text-[#8b949e] mr-3">🏷️</span>
                  <span>
                    ID: <span className="font-mono text-white">USR-84392</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#8b949e] mr-3">✉️</span>
                  <a
                    className="text-[#58a6ff] hover:underline"
                    href="mailto:alani.sharma@campus.edu"
                  >
                    alani.sharma@campus.edu
                  </a>
                </div>
                <div className="flex items-center">
                  <span className="text-[#8b949e] mr-3">📅</span>
                  <span>
                    Joined: <span className="text-white">Oct 15, 2022</span>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#8b949e] mr-3">⏱️</span>
                  <span>
                    Last Login:{" "}
                    <span className="text-white">Mar 10, 2024, 9:15 AM</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Account Information
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm text-white">
                    <span className="mr-2">✓</span>
                    Account Status
                  </label>
                  <div className="relative">
                    <select
                      value={accountStatus}
                      onChange={(e) => setAccountStatus(e.target.value)}
                      className="text-sm font-semibold bg-[#161b22] border border-[#30363d] rounded-md py-1 pl-2 pr-8 appearance-none focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff] text-[#238636]"
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="banned">Banned</option>
                    </select>
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-base text-[#8b949e] pointer-events-none">
                      ▼
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-white">
                    <span className="mr-2">📧</span>
                    Email Verified
                  </span>
                  <span className="text-sm font-semibold text-[#58a6ff]">
                    Verified
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center text-sm text-white">
                    <span className="mr-2">👥</span>
                    Society Memberships
                  </span>
                  <span className="text-sm font-semibold text-white">3</span>
                </div>
              </div>
            </div>

            {/* Admin Notes */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Admin Notes
              </h3>
              <div className="space-y-4">
                <div className="border-l-2 border-[#30363d] pl-4">
                  <p className="text-sm text-[#c9d1d9]">
                    User reported for spamming event comments. Placed on watch
                    list.
                  </p>
                  <p className="text-xs text-[#8b949e] mt-1">
                    Admin D. Chen - Mar 01, 2024
                  </p>
                </div>
                <div className="border-l-2 border-[#30363d] pl-4">
                  <p className="text-sm text-[#c9d1d9]">
                    Followed up on mentor application. All checks passed.
                  </p>
                  <p className="text-xs text-[#8b949e] mt-1">
                    Admin E. Carter - Nov 15, 2023
                  </p>
                </div>
              </div>

              <textarea
                className="mt-4 w-full bg-[#0d1117] border border-[#30363d] rounded-md p-2 text-sm text-white placeholder:text-[#8b949e] focus:ring-1 focus:ring-[#58a6ff] focus:border-[#58a6ff]"
                placeholder="Add a new note..."
                rows="3"
              />
              <button className="mt-2 w-full text-center text-sm bg-gray-700/50 hover:bg-gray-700 border border-[#30363d] rounded-md py-2 transition-colors text-white">
                Add Note
              </button>
            </div>
          </div>

          {/* Right Column - Actions & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Admin Actions */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Admin Actions
                </h3>
                <div title="All admin actions are logged and secured.">
                  <span className="text-[#8b949e] cursor-help">ℹ️</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <button className="flex items-center justify-center p-3 bg-gray-700/50 hover:bg-gray-700 border border-[#30363d] rounded-md transition-colors text-sm text-white">
                  <span className="mr-2">🔐</span>
                  Reset Password
                </button>

                <button className="flex items-center justify-center p-3 bg-gray-700/50 hover:bg-gray-700 border border-[#30363d] rounded-md transition-colors text-sm text-white">
                  <span className="mr-2">👤</span>
                  Edit Profile
                </button>

                <button className="flex items-center justify-center p-3 bg-[#238636]/10 hover:bg-[#238636]/20 border border-[#238636]/50 rounded-md transition-colors text-sm text-[#238636]">
                  <span className="mr-2">⚙️</span>
                  Change Role
                </button>

                <button className="flex items-center justify-center p-3 bg-yellow-900/20 hover:bg-yellow-900/30 border border-yellow-700/50 rounded-md transition-colors text-sm text-yellow-400">
                  <span className="mr-2">⏸️</span>
                  Suspend User
                </button>

                <button className="flex items-center justify-center p-3 bg-red-900/20 hover:bg-red-900/30 border border-red-700/50 rounded-md transition-colors text-sm text-red-400">
                  <span className="mr-2">🗑️</span>
                  Delete User
                </button>
              </div>
            </div>

            {/* Role History */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Role History
              </h3>
              <div className="relative pl-6 border-l-2 border-[#30363d] space-y-6">
                <div className="relative">
                  <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-[#238636] ring-4 ring-[#161b22]"></div>
                  <p className="text-sm text-white">
                    Promoted to <span className="font-semibold">Mentor</span>
                  </p>
                  <p className="text-xs text-[#8b949e] mt-1">
                    November 20, 2023
                  </p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[35px] top-1 h-4 w-4 rounded-full bg-[#8b949e] ring-4 ring-[#161b22]"></div>
                  <p className="text-sm text-white">
                    Joined as <span className="font-semibold">Student</span>
                  </p>
                  <p className="text-xs text-[#8b949e] mt-1">
                    October 15, 2022
                  </p>
                </div>
              </div>
            </div>

            {/* Permissions & Access Control */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Permissions & Access Control
                </h3>
                <button className="text-sm text-[#58a6ff] hover:underline">
                  Save Changes
                </button>
              </div>

              <div className="space-y-4">
                {/* Permission 1 */}
                <div className="flex items-center justify-between p-3 bg-[#0d1117] rounded-md border border-[#30363d]">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Can create societies
                    </p>
                    <p className="text-xs text-[#8b949e]">
                      Allow user to create and manage new student societies.
                    </p>
                  </div>
                  <Switch
                    checked={permissions.createSocieties}
                    onChange={() => handlePermissionChange("createSocieties")}
                  />
                </div>

                {/* Permission 2 */}
                <div className="flex items-center justify-between p-3 bg-[#0d1117] rounded-md border border-[#30363d]">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Can manage events
                    </p>
                    <p className="text-xs text-[#8b949e]">
                      Allow user to create, edit, and delete events for their
                      societies.
                    </p>
                  </div>
                  <Switch
                    checked={permissions.manageEvents}
                    onChange={() => handlePermissionChange("manageEvents")}
                  />
                </div>

                {/* Permission 3 */}
                <div className="flex items-center justify-between p-3 bg-[#0d1117] rounded-md border border-[#30363d]">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Can access mentoring features
                    </p>
                    <p className="text-xs text-[#8b949e]">
                      Allow user to act as a mentor and be discoverable by
                      students.
                    </p>
                  </div>
                  <Switch
                    checked={permissions.accessMentoring}
                    onChange={() => handlePermissionChange("accessMentoring")}
                  />
                </div>

                {/* Permission 4 */}
                <div className="flex items-center justify-between p-3 bg-[#0d1117] rounded-md border border-[#30363d]">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Can join events
                    </p>
                    <p className="text-xs text-[#8b949e]">
                      Allow user to register for and participate in campus
                      events.
                    </p>
                  </div>
                  <Switch
                    checked={permissions.joinEvents}
                    onChange={() => handlePermissionChange("joinEvents")}
                  />
                </div>

                {/* Permission 5 */}
                <div className="flex items-center justify-between p-3 bg-[#0d1117] rounded-md border border-[#30363d]">
                  <div>
                    <p className="text-sm font-medium text-white">
                      Can post in forums
                    </p>
                    <p className="text-xs text-[#8b949e]">
                      Allow user to create threads and reply in discussion
                      forums.
                    </p>
                  </div>
                  <Switch
                    checked={permissions.postForums}
                    onChange={() => handlePermissionChange("postForums")}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
