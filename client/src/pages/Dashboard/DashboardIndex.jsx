// Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar.jsx"; // unified shared Sidebar

const DashboardIndex = ({ profile }) => {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-surface-dark/80 backdrop-blur-sm lg:hidden">
        <div className="container mx-auto flex items-center justify-between whitespace-nowrap px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <div
              className="flex items-center gap-4 text-text-primary-dark cursor-pointer"
              onClick={() => navigate("/")}
            >
              <div className="size-6 text-primary">
                <svg
                  fill="none"
                  viewBox="0 0 48 48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <h2 className="text-text-primary-dark text-lg font-bold tracking-[-0.015em]">
                CampusConnect
              </h2>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-end gap-4">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 border border-border-dark bg-surface-dark text-text-primary-dark hover:bg-border-dark text-sm font-bold px-2.5">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
            </button>
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-border-dark"
              style={{
                backgroundImage: `url(${
                  profile?.picture || "/default-avatar.png"
                })`,
              }}
              onClick={() => navigate("/profile")}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar profile={profile} />

        {/* Dashboard Content */}
        <div className="flex flex-col flex-1">
          {/* Desktop Header */}
          <header className="sticky top-0 z-50 w-full border-b border-border-dark bg-surface-dark/80 backdrop-blur-sm hidden lg:block bg-black text-white">
            <div className="container mx-auto flex items-center justify-end whitespace-nowrap px-4 py-3 sm:px-6 lg:px-8">
              <div className="flex flex-1 items-center justify-end gap-4">
                <label className="hidden flex-col min-w-40 !h-10 max-w-64 sm:flex">
                  <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                    <div className="text-white flex border border-border-dark bg-black items-center justify-center pl-3 rounded-l-lg border-r-0">
                      <span className="material-symbols-outlined text-xl">
                        search
                      </span>
                    </div>
                    <input
                      className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-text-primary-dark focus:outline-0 focus:ring-1 focus:ring-primary border border-border-dark bg-background-dark h-full placeholder:text-text-secondary-dark px-2 rounded-l-none border-l-0 text-sm font-normal leading-normal"
                      placeholder="Search..."
                    />
                  </div>
                </label>
                <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 border border-border-dark bg-surface-dark text-text-primary-dark hover:bg-border-dark text-sm font-bold px-2.5">
                  <span className="material-symbols-outlined text-xl">
                    notifications
                  </span>
                </button>
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-border-dark"
                  style={{
                    backgroundImage: `url(${
                      profile?.picture || "/default-avatar.png"
                    })`,
                  }}
                  onClick={() => navigate("/profile")}
                />
              </div>
            </div>
          </header>

          {/* Main Dashboard Section */}
          <main className="layout-container flex h-full grow flex-col bg-black text-white">
            <div className="container mx-auto flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
              <div className="layout-content-container flex w-full flex-col max-w-7xl flex-1">
                {/* Welcome */}
                <div className="mb-8">
                  <p className="text-text-primary-dark text-4xl font-black leading-tight tracking-[-0.033em]">
                    Welcome back, {profile?.name || "User"}!
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                  {/* Left Column */}
                  <div className="flex flex-col gap-6 lg:col-span-2">
                    {/* Upcoming Events */}
                    <div className="flex flex-col rounded-lg border bg-gray-900 bg-surface-dark">
                      <div className="border-b border-border-dark px-4 pb-3 pt-5 sm:px-6">
                        <h2 className="text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em]">
                          Upcoming Events
                        </h2>
                      </div>
                      <div className="flex flex-col divide-y divide-border-dark">
                        {/* Example Event */}
                        <EventItem
                          title="CS Society: Hackathon Kick-off"
                          date="Oct 26, 2024, 6:00 PM"
                        />
                        <EventItem
                          title="Alumni Mentorship Mixer"
                          date="Nov 2, 2024, 7:30 PM"
                        />
                        <EventItem
                          title="Final Year Project Showcase"
                          date="Nov 15, 2024, 10:00 AM"
                        />
                      </div>
                    </div>

                    {/* My Mentoring */}
                    <div className="flex flex-col rounded-lg border border-border-dark bg-surface-dark bg-gray-900">
                      <div className="border-b border-border-dark px-4 pb-3 pt-5 sm:px-6">
                        <h2 className="text-text-primary-dark text-[22px] font-bold leading-tight tracking-[-0.015em]">
                          My Mentoring
                        </h2>
                      </div>
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col items-start gap-4 rounded-lg border border-border-dark bg-black p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex items-center gap-4">
                            <div
                              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-12"
                              style={{
                                backgroundImage:
                                  'url("https://lh3.googleusercontent.com/aida-public/AB6AXuA93M4OEVTPSalVWpPg6oniNGkZhlm5SOXDGwxRtAc0Tx-kZ-wozDOkRBZZACWY3_axtayHpazxzohQLZ36P3GPz8s_D40_VhjpsSPxkZnooS6hQ_sTGil0ZNcJGE-CysBHzX6-Uf4sw7z1MDdFvvo6_Y-NzAVy_N44J7sL5JB65EEDIpSnpMj1pk3CQs1Em-3UtF2FCbykoay5NVQpmdFK_lDlB5H9tNcZoRcQCJCGH637Co8KUnklFzVhUzyFhDkEbNXlS_kaOyg")',
                              }}
                            />
                            <div>
                              <p className="font-semibold text-text-primary-dark">
                                Career Advice with Dr. Chen
                              </p>
                              <p className="text-sm text-text-secondary-dark">
                                Tomorrow, 3:00 PM
                              </p>
                            </div>
                          </div>
                          <div className="flex w-full gap-2 sm:w-auto">
                            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-border-dark bg-surface-dark px-4 py-2 text-sm font-semibold text-text-primary-dark hover:bg-border-dark sm:w-auto">
                              Join Call
                            </button>
                            <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-transparent bg-transparent px-4 py-2 text-sm font-semibold text-text-secondary-dark hover:underline sm:w-auto">
                              Reschedule
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3 rounded-lg border border-border-dark bg-surface-dark p-4 sm:p-6">
                      <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg h-10 bg-green-600 text-white text-sm font-bold hover:bg-green-800">
                        <span className="material-symbols-outlined text-xl">
                          add_circle
                        </span>
                        <span>Create Event</span>
                      </button>
                      <button className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-border-dark bg-surface-dark text-text-primary-dark text-sm font-bold hover:bg-border-dark">
                        <span className="material-symbols-outlined text-xl">
                          person_search
                        </span>
                        <span>Find a Mentor</span>
                      </button>
                    </div>
                    <RecentActivity />
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

// Event Item Component
const EventItem = ({ title, date }) => (
  <div className="flex items-center gap-4 px-4 min-h-[72px] py-3 justify-between sm:px-6">
    <div className="flex flex-1 items-center gap-4 overflow-hidden">
      <div className="text-text-primary-dark flex items-center justify-center rounded-lg bg-border-dark shrink-0 size-12">
        <span className="material-symbols-outlined">event</span>
      </div>
      <div className="flex flex-col justify-center overflow-hidden">
        <p className="text-text-primary-dark text-base font-medium leading-normal truncate">
          {title}
        </p>
        <p className="text-text-secondary-dark text-sm font-normal leading-normal truncate">
          {date}
        </p>
      </div>
    </div>
    <button className="text-sm font-medium leading-normal text-green-600 hover:underline shrink-0">
      View Details
    </button>
  </div>
);

// Recent Activity Component
const RecentActivity = () => (
  <div className="flex flex-col rounded-lg border border-border-dark bg-surface-dark">
    <div className="border-b border-border-dark px-4 pb-3 pt-5 sm:px-6">
      <h3 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
        Recent Activity
      </h3>
    </div>
    <div className="flex flex-col divide-y divide-border-dark">
      <ActivityItem
        img="https://lh3.googleusercontent.com/aida-public/AB6AXuBnUqFlqtncpo8A-RQPe27lJ_WS8g54tjvBgnIBzcU1Ll7bgw_L2wwGvNZwV7bieV0IZw0IfSjxpDCFUfR3b_T2R9xfAy8PMbfzRXydNPMEmlPz3-_JKNv1tq9Q0GVVlvQVA5FvEL16uDt_dvB3dS1jQekuwt9VXLhsYoGg9mD_SMm9K90_dyc4T1DbRnSwcnemQS558OEoqhtnigYeMBdJ5urG5yfYGtoocbPc4LAtc8AaONwphWDbI-75skX0De7_uDfP-oJDZyA"
        text={
          <>
            <span className="font-semibold">Sarah L.</span> posted in{" "}
            <span className="font-semibold text-green-600">
              Biotech Innovators
            </span>
          </>
        }
        time="2 hours ago"
      />
      <ActivityItem
        img="https://lh3.googleusercontent.com/aida-public/AB6AXuBG8getaXNBPqeoxobLHq4-ezIUQo4TqQ12EPt6maLD--AHUCwHOGgjn2v88p1YabN6wufKDZIU5_kJsHYrin-B8jV4grph9u5sShOAsbbyO3x1iQ4aPYRcqJP7Y6S87a8Lyfe2aq5pNyGP2h2_whIXY8OpnbPDqwQ2mQyF7Pb1xkkt14pL5OehhiTmz9K9dptvHuOB5uMFG0UUMbeBVQSF-sVXyLlEKUpkwq1PABi0oaflwkycL-DgS5ErKi_BzaHE93Kx6ZBiqMw"
        text={
          <>
            <span className="font-semibold">Mike R.</span> is now connected with{" "}
            <span className="font-semibold">David Chen</span>
          </>
        }
        time="Yesterday"
      />
      <ActivityItem
        icon="campaign"
        text={
          <>
            New announcement in{" "}
            <span className="font-semibold text-green-600">CS Society</span>
          </>
        }
        time="3 days ago"
      />
    </div>
  </div>
);

const ActivityItem = ({ img, icon, text, time }) => (
  <div className="flex items-start gap-4 p-4 sm:p-6">
    {img ? (
      <div
        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-8 shrink-0 mt-1"
        style={{ backgroundImage: `url(${img})` }}
      />
    ) : (
      <div className="text-text-primary-dark flex items-center justify-center rounded-full bg-border-dark size-8 shrink-0 mt-1">
        <span className="material-symbols-outlined text-lg">{icon}</span>
      </div>
    )}
    <div className="flex flex-col">
      <p className="text-sm text-text-primary-dark">{text}</p>
      <p className="text-xs text-text-secondary-dark">{time}</p>
    </div>
  </div>
);

export default DashboardIndex;
