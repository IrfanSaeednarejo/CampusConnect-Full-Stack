import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectScheduledSessions, selectCompletedSessions, setScheduledSessions, setCompletedSessions } from "../../redux/slices/mentoringSlice";
import Avatar from "../../components/common/Avatar";

export default function MentorSessions() {
  const dispatch = useDispatch();
  const scheduledSessions = useSelector(selectScheduledSessions);
  const completedSessions = useSelector(selectCompletedSessions);
  
  const [activeTab, setActiveTab] = useState("scheduled");

  useEffect(() => {
    if (scheduledSessions.length === 0) {
      dispatch(setScheduledSessions([
        {
          id: 1,
          menteeName: "Alex Smith",
          menteeImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAoh2dm9kXtseO36Q-qmCVmiIvo0kg46vpTEwoKYtotuUj11oiF8d5fv3LhTXev-_DYGW1xxQS5nWYViknI2g6YqiILi0slmnBJ4XTQ-C0N1WaPrxGmVzlaWwy9kiX9ELFiiVjcX-b8aT8IZwiuPPJtsmlx1ir8rmVDoolvXTUpHJJzk0UAf_r6nZ-s_Rp6a81c77019UiR25At_M_ORcZY34ZD4Nki2ZS9sVDSkQ0O5l2CJBjtOA5zGBZpPXi0fEOVrSxvLuBJgIk",
          date: "Oct 26, 2024",
          time: "14:00 - 14:45",
          status: "scheduled",
        },
        {
          id: 2,
          menteeName: "Jessica Wu",
          menteeImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDEkgBrMOeBBYtbugCRWClURSTYPntxKQ0OOomtzUTwxdS8Lhlpj9J3QV3WSJQCqNx9g2MY60l9xZMkKXyPw0uRK6V8_ZiNWyzCpYKDDwFODaElzwGJneWWhEJHUexmcHwFWD8TShT7K4ctTEee509YXejS09rB9rT9VtGQFQaV313YVKap32WR8JBR8w9okv_H68dG4iek3fUZGgP8at19Hc2BBETPXHBoBUmAKRgP1w7O0ozNLGzOxoxvYk-K0G3d94-u_4uTyJ0",
          date: "Nov 2, 2024",
          time: "10:00 - 10:45",
          status: "scheduled",
        },
      ]));
    }
  }, [dispatch, scheduledSessions.length]);

  useEffect(() => {
    if (completedSessions.length === 0) {
      dispatch(setCompletedSessions([
        {
          id: 3,
          menteeName: "Mike Johnson",
          menteeImage:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDmljS6lrfmGIdfB66YlX3S4bUSSp2bRVZX5kltZVwL0i2D2XMxOzSpMcyLiItyrD36mlgDyOCXrpkR2ayORebmt0pft3FKpkz6ZW6TGEU9idhaY2qNpjdMfh6B_wf42yuZ5Rmrk3NUd6teT0bDnYR23mQdrCK_3CAZLN1DA4O5LMxi0dsFFRzJmbHwimD6dLPExQfMpe1x9SAk6a49sCv-2LGuEqrgyRmMwYJtDkuRA9LPLLe2DMQdqCxRbfFbDiQoyU14kwGUsYo",
          date: "Sep 15, 2024",
          time: "16:00 - 16:45",
          status: "completed",
        },
      ]));
    }
  }, [dispatch, completedSessions.length]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#0d1117]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#30363d] px-6 py-3 sm:px-10 lg:px-20">
          <div className="flex items-center gap-4 text-[#c9d1d9]">
            <div className="size-5 text-[#238636]">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em]">
              CampusConnect
            </h2>
          </div>

          <div className="hidden md:flex items-center gap-9">
            <a
              href="/student/dashboard"
              className="text-sm font-medium leading-normal text-[#8b949e] hover:text-[#c9d1d9]"
            >
              Dashboard
            </a>
            <a
              href="/events"
              className="text-sm font-medium leading-normal text-[#8b949e] hover:text-[#c9d1d9]"
            >
              Events
            </a>
            <a
              href="#"
              className="text-sm font-medium leading-normal text-[#c9d1d9]"
            >
              My Sessions
            </a>
            <a
              href="#"
              className="text-sm font-medium leading-normal text-[#8b949e] hover:text-[#c9d1d9]"
            >
              Network
            </a>
            <a
              href="#"
              className="text-sm font-medium leading-normal text-[#8b949e] hover:text-[#c9d1d9]"
            >
              Resources
            </a>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-4 bg-[#238636] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#238636]/90 hidden sm:flex">
              <span className="truncate">Create Event</span>
            </button>
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 bg-[#161b22] text-[#c9d1d9] hover:bg-[#30363d] gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
            </button>
            <Avatar
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBksv8micjGH5CGfuhv7CKbIdjKfrb2-9rDpFGoSkxv3nXzN3jMFzG47--q9jstHmfRO4wELYEKDSOGqJIO7c56WumB3RSYioXJInuS6wkJzn62Vro8AmrJ6iLxjUgM_oq5SrMrpuQwLAOmCT_azUe_u931ReH6fjwAHEMZL1YXnQdK3dBPCYT_VXPh1NbRjMHdFgk_k6vhbzpQzFeiFtMW7yONpgMHZxbqNn8-AoXayT9l8OBFwwXU-N2kBinAAh7rY__oCTnm7Lc"
              size="9"
              border={true}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex w-full flex-1 justify-center py-5 sm:py-8 lg:py-12">
          <div className="layout-content-container flex w-full max-w-5xl flex-1 flex-col px-4 sm:px-6">
            {/* Page Heading */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <p className="text-4xl font-black leading-tight tracking-[-0.033em] min-w-72 text-[#c9d1d9]">
                My Sessions
              </p>
            </div>

            {/* Tabs */}
            <div className="pb-3 mt-4">
              <div className="flex border-b border-[#30363d] px-4 gap-8">
                <button
                  onClick={() => setActiveTab("scheduled")}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === "scheduled"
                      ? "border-b-[#238636]"
                      : "border-b-transparent"
                  }`}
                >
                  <p
                    className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                      activeTab === "scheduled"
                        ? "text-[#c9d1d9]"
                        : "text-[#8b949e] hover:text-[#c9d1d9]"
                    }`}
                  >
                    Scheduled Sessions
                  </p>
                </button>
                <button
                  onClick={() => setActiveTab("completed")}
                  className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 ${
                    activeTab === "completed"
                      ? "border-b-[#238636]"
                      : "border-b-transparent"
                  }`}
                >
                  <p
                    className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                      activeTab === "completed"
                        ? "text-[#c9d1d9]"
                        : "text-[#8b949e] hover:text-[#c9d1d9]"
                    }`}
                  >
                    Completed Sessions
                  </p>
                </button>
              </div>
            </div>

            {/* Sessions List */}
            <div className="mt-6 flex flex-col gap-4">
              {activeTab === "scheduled" &&
                scheduledSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col md:flex-row gap-4 bg-[#161b22] rounded-lg p-4 md:items-center border border-[#30363d]"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-[60px] w-[60px]"
                        style={{
                          backgroundImage: `url("${session.menteeImage}")`,
                        }}
                      ></div>
                      <div className="flex flex-1 flex-col justify-center">
                        <p className="text-base font-medium leading-normal text-[#c9d1d9]">
                          {session.menteeName}
                        </p>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          <p className="text-sm font-normal leading-normal text-[#8b949e] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">
                              calendar_today
                            </span>{" "}
                            {session.date}
                          </p>
                          <p className="text-sm font-normal leading-normal text-[#8b949e] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">
                              schedule
                            </span>{" "}
                            {session.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 gap-3 flex-wrap justify-start md:justify-end mt-4 md:mt-0">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#30363d] text-[#c9d1d9] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#39414c]">
                        <span className="truncate">View Details</span>
                      </button>
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#238636] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#238636]/90">
                        <span className="truncate">Join Session</span>
                      </button>
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-transparent text-[#8b949e] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#161b22] hover:text-[#c9d1d9]">
                        <span className="truncate">Send Reminder</span>
                      </button>
                    </div>
                  </div>
                ))}

              {activeTab === "completed" &&
                completedSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col md:flex-row gap-4 bg-[#161b22] rounded-lg p-4 md:items-center border border-[#30363d] opacity-60"
                  >
                    <div className="flex flex-1 items-center gap-4">
                      <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-[60px] w-[60px]"
                        style={{
                          backgroundImage: `url("${session.menteeImage}")`,
                        }}
                      ></div>
                      <div className="flex flex-1 flex-col justify-center">
                        <p className="text-base font-medium leading-normal text-[#c9d1d9]">
                          {session.menteeName}
                        </p>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          <p className="text-sm font-normal leading-normal text-[#8b949e] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">
                              calendar_today
                            </span>{" "}
                            {session.date}
                          </p>
                          <p className="text-sm font-normal leading-normal text-[#8b949e] flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-base">
                              schedule
                            </span>{" "}
                            {session.time}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-1 gap-3 flex-wrap justify-start md:justify-end mt-4 md:mt-0">
                      <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#30363d] text-[#c9d1d9] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#39414c]">
                        <span className="truncate">Submit Feedback</span>
                      </button>
                    </div>
                  </div>
                ))}

              {/* Empty State */}
              <div className="flex flex-col items-center justify-center gap-4 text-center bg-[#161b22] rounded-lg p-10 mt-8 border-2 border-dashed border-[#30363d]">
                <span className="material-symbols-outlined text-5xl text-[#8b949e]">
                  event_busy
                </span>
                <p className="text-lg font-bold text-[#c9d1d9]">
                  No session bookings.
                </p>
                <p className="text-sm text-[#8b949e]">
                  Set your availability to get started!
                </p>
                <button className="mt-2 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#238636] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#238636]/90">
                  <span className="truncate">Set Availability</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
