import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";
import MentorWidget from "@/components/dashboard/MentorWidget";

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState("");

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#30363d] px-6 py-3 lg:px-10 bg-[#0d1117]">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-4 text-white">
              <svg
                className="size-6 text-[#1dc964]"
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                  fill="currentColor"
                ></path>
              </svg>
              <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                CampusNexus
              </h2>
            </div>

            {/* Search Bar */}
            <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                <div className="text-[#9eb7a9] flex border-none bg-[#161b22] items-center justify-center pl-4 rounded-l-lg border-r-0">
                  <span className="material-symbols-outlined text-xl">
                    search
                  </span>
                </div>
                <input
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#161b22] focus:border-none h-full placeholder:text-[#9eb7a9] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  placeholder="Search"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
              </div>
            </label>
          </div>

          {/* Right Side Navigation */}
          <div className="flex flex-1 justify-end gap-6 lg:gap-8">
            <div className="hidden lg:flex items-center gap-8">
              <button
                onClick={() => navigate("/mentor-mentees")}
                className="text-white text-sm font-medium leading-normal hover:text-[#1dc964] transition-colors"
              >
                Mentees
              </button>
              <button
                onClick={() => navigate("/mentor-events")}
                className="text-white text-sm font-medium leading-normal hover:text-[#1dc964] transition-colors"
              >
                Events
              </button>
              <button
                onClick={() => navigate("/mentor-profile-view")}
                className="text-white text-sm font-medium leading-normal hover:text-[#1dc964] transition-colors"
              >
                Profile
              </button>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/mentor-notifications")}
                className="flex min-w-[40px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-2 bg-transparent text-white hover:bg-[#161b22] transition-colors relative group"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-1 right-1 w-2 h-2 bg-[#ef4444] rounded-full"></span>
              </button>
              <Avatar
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgjnv-ixtGxRDh4QEaPBNUdMjXlCgO4Di7YsyjQZ_I21EDiOSRocUjGni8cViV_CJzUNuTwbKO6qL2ELKucJviHvtTGb5IoWrvryA6QiSKES--KcSvqsDWZ1KpSuZmk0lwuAdXOoKx29-hTfGzUVjUFmMfKN8ePF2jbbETEb-ZJ4sbGp0i5zNnzNhdXDhOyG5SRDAgKbhgIsTZDf5Qvwv7Du7ImY-uPgAE-OPeOuTdAxD6cykLE_jM18XdA4t_EU_5vQrYK9XVePg"
                size="10"
                border={true}
                hover={true}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-6xl flex-1">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
              <div className="flex min-w-72 flex-col gap-2">
                <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                  Mentor Portal
                </p>
                <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                  Manage your sessions, ratings, and mentee feedback.
                </p>
              </div>
              <button
                onClick={() => navigate("/mentor-profile")}
                className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-[#1dc964] text-[#112118] text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined mr-2">
                  calendar_add_on
                </span>
                <span className="truncate">Set Your Availability</span>
              </button>
            </div>

            {/* Widgets Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Sessions (2 columns) */}
              <MentorWidget
                title="Upcoming Sessions"
                actionLabel="View All"
                actionIcon="arrow_forward"
                onAction={() => navigate("/my-sessions")}
                actionClassName="text-[#1dc964] text-sm font-semibold hover:text-white transition-colors flex items-center gap-1"
                className="lg:col-span-2"
              >
                <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
                  <div className="text-[#1dc964]">
                    <span
                      className="material-symbols-outlined inline-block"
                      style={{ fontSize: "64px" }}
                    >
                      event_busy
                    </span>
                  </div>
                  <div className="flex max-w-[480px] flex-col items-center gap-2">
                    <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                      No sessions yet
                    </p>
                    <p className="text-[#9eb7a9] text-sm font-normal leading-normal max-w-[480px]">
                      Once a student books a session, it will appear here!
                    </p>
                  </div>
                </div>
              </MentorWidget>

              {/* Earnings Overview */}
              <MentorWidget
                title="Earnings Overview"
                actionIcon="arrow_forward"
                onAction={() => navigate("/earnings")}
                actionClassName="text-[#1dc964] text-sm font-semibold hover:text-white transition-colors"
              >
                <div className="flex flex-col gap-6 flex-1">
                  <div className="flex flex-col gap-2">
                    <p className="text-[#9eb7a9] text-sm">Total Earnings</p>
                    <p className="text-white text-4xl font-bold tracking-tight">
                      $0.00
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-[#9eb7a9] text-sm">Sessions Completed</p>
                    <p className="text-white text-2xl font-bold">0</p>
                  </div>
                  <div className="mt-auto">
                    <button
                      onClick={() => navigate("/earnings")}
                      className="flex w-full min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#30363d] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#404851] transition-colors gap-2"
                    >
                      <span className="material-symbols-outlined">
                        account_balance_wallet
                      </span>
                      <span className="truncate">Withdraw Earnings</span>
                    </button>
                  </div>
                </div>
              </MentorWidget>

              {/* Pending Feedback */}
              <MentorWidget
                title="Pending Feedback"
                actionIcon="arrow_forward"
                onAction={() => navigate("/feedback")}
                actionClassName="text-[#1dc964] text-sm font-semibold hover:text-white transition-colors"
              >
                <div
                  className="flex flex-col items-center justify-center gap-6 py-10 text-center cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate("/feedback")}
                >
                  <div className="text-[#1dc964]">
                    <span
                      className="material-symbols-outlined inline-block"
                      style={{ fontSize: "64px" }}
                    >
                      rate_review
                    </span>
                  </div>
                  <div className="flex max-w-[480px] flex-col items-center gap-2">
                    <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                      All Caught Up!
                    </p>
                    <p className="text-[#9eb7a9] text-sm font-normal leading-normal max-w-[480px]">
                      You have no pending feedback requests.
                    </p>
                  </div>
                </div>
              </MentorWidget>

              {/* Recent Mentee Ratings (2 columns) */}
              <MentorWidget
                title="Recent Mentee Ratings"
                actionLabel="View All"
                actionIcon="arrow_forward"
                onAction={() => navigate("/my-sessions")}
                actionClassName="text-[#1dc964] text-sm font-semibold hover:text-white transition-colors flex items-center gap-1"
                className="lg:col-span-2"
              >
                <div className="flex flex-col items-center justify-center gap-6 py-10 text-center">
                  <div className="text-[#1dc964]">
                    <span
                      className="material-symbols-outlined inline-block"
                      style={{ fontSize: "64px" }}
                    >
                      star_outline
                    </span>
                  </div>
                  <div className="flex max-w-[480px] flex-col items-center gap-2">
                    <p className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
                      No ratings yet
                    </p>
                    <p className="text-[#9eb7a9] text-sm font-normal leading-normal max-w-[480px]">
                      Your mentee ratings will appear here after completed
                      sessions.
                    </p>
                  </div>
                </div>
              </MentorWidget>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
