import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Avatar from "../../components/common/Avatar";
import {
  selectUpcomingEvents,
  setUpcomingEvents,
} from "../../redux/slices/eventSlice";
import {
  selectRegisteredSocieties,
  setRegisteredSocieties,
} from "../../redux/slices/societySlice";

const ACHIEVEMENTS = [
  {
    id: 1,
    icon: "emoji_events",
    title: "Hackathon Winner - Spring 2024",
    description: "Best project in the AI for Social Good category.",
  },
];

export default function StudentProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");

  const upcomingEvents = useSelector(selectUpcomingEvents);
  const societies = useSelector(selectRegisteredSocieties);

  useEffect(() => {
    if (upcomingEvents.length === 0) {
      const mockEvents = [
        {
          id: 1,
          icon: "event",
          title: "AI Ethics Debate",
          time: "Tomorrow at 6 PM",
        },
        {
          id: 2,
          icon: "event",
          title: "Annual Tech Summit",
          time: "Starts in 3 days",
        },
      ];
      dispatch(setUpcomingEvents(mockEvents));
    }

    if (societies.length === 0) {
      const mockSocieties = [
        {
          id: 1,
          name: "AI Society",
          role: "Member",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAHYYsdgElSyd-xauGzVWwe7MR_Z28bNcHt2URplRhxneKuwu1KKWIdVlc7oM_e3SEGDL2GJiOhyl66HebNp7yyRtr6YaOFPOn0q7rIT-Z0aO4T99DPGrMCSd4xROyUmuv41pM_N9YKg0tsyQBICwPZ9pXKJBobPtXj-Qmc4uh-l1KxJXKfFzi1g-eoxuN4jQJXW8sqJv_-y2bt9Izw7CmmA-jf9RVlaltAWR6wu4xQlOhcmnd1csfMsbkemkMzdRmCWZcvtJcwEhA",
        },
        {
          id: 2,
          name: "Debating Club",
          role: "Member",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA5CeuVKkEt85366ovsM9gFP98W-VrjlnfBkcllLm2KV54rCRoD_m4BNoAtEUSuQvcFlytThdRTIO9Z1nXBibQKGdaDAK6LhzpjhmYmbXva2k9oIC8h970iRH-SR6zbL8sHw7xVjy9ZboltlifQlD62MISDAbzDqSzU8FKt2BDFzz0BuTa8mENaA8tE8_wp_k0SwC_eUrxSsx4WPDQksvC4LD4-3ZokmlJRAYp0SCCUueTd_Sw9vg6LsJmch92wQln-EnZaZ9hvjhU",
        },
        {
          id: 3,
          name: "Coding Hub",
          role: "Co-founder",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuCf2pszDHzZ8Hrk883PEi2Cznc1MZx0nBGTczVTe8nxYfIomylA04iCbgpsWtyNy6JV0Ib1LTxtI4XPMlt9g4j3Ft0ppd5lJHw7qbnFL4pS6mXoKfSSvQpP90_ke5lhCaqvTbuIuYfX7SMH_sd3y8qQ532m1LXC_fFdHSY0KsGdCSmXtuKbh0LZk-w1jBIn6MRqd2mjR0Nw2ZipmAXJXshFf6VWAcV9wOgJwFR4SwnqC3JtpDK9tRUS3le1eRWvdcfGPu9NizsZ6bg",
        },
      ];
      dispatch(setRegisteredSocieties(mockSocieties));
    }
  }, [dispatch, upcomingEvents.length, societies.length]);

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#30363d] px-6 sm:px-10 lg:px-20 py-3 sticky top-0 bg-[#0d1117]/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="text-white hover:text-[#238636] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-4 text-white">
            <svg
              className="size-6 text-[#238636]"
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
              CampusConnect
            </h2>
          </div>

          <label className="hidden md:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-[#8b949e] flex border-none bg-[#161b22] items-center justify-center pl-4 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined text-xl">
                  search
                </span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-[#161b22] focus:border-none h-full placeholder:text-[#8b949e] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                placeholder="Search"
              />
            </div>
          </label>
        </div>

        <div className="flex flex-1 justify-end gap-2 sm:gap-4 md:gap-8 items-center">
          <div className="hidden lg:flex items-center gap-9">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
            >
              Dashboard
            </button>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/events"
            >
              Events
            </a>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/societies"
            >
              Societies
            </a>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/mentors"
            >
              Mentors
            </a>
          </div>
          <div className="flex gap-2">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#161b22] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#30363d] transition-colors">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
            </button>
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#161b22] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#30363d] transition-colors">
              <span className="material-symbols-outlined text-xl">
                chat_bubble
              </span>
            </button>
          </div>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
            size="10"
            hover={true}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-10 lg:px-20 flex flex-1 justify-center py-5 md:py-10">
        <div className="layout-content-container flex flex-col w-full max-w-6xl">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <aside className="w-full md:w-1/4 flex-shrink-0">
              <div className="flex flex-col gap-6">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzGlrzfaEAmN_FZricBQPbxSsCJrQFKHboMPee2CpXGl-vwQ_LOrRtcLB-4jYYaD7GmxhmZQPiv2Y5G2voagN6WX_210ezdTp6sYS6AdsfXSX28fl0_M-7PACLInMnKB9Tg9zpeCPrfmCD0ag8foIuBPthVTKAclMFa9iL41Pbkl2aWSHaacSRkBDu7nx2hcpdgMZJFdiTwyLDgCw6XAn0eZT4l-8eCMSuR8eTGpr0CEclMcUe-Pc7z-CMHihg83hh1YNOaNyQDYk"
                  alt="Profile"
                  className="w-48 h-48 mx-auto md:w-full md:h-auto rounded-lg object-cover"
                />
                <div>
                  <h1 className="text-white text-2xl font-bold leading-tight tracking-tight">
                    Alex Doe
                  </h1>
                  <p className="text-[#8b949e] text-lg font-normal leading-normal">
                    alex.doe
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#30363d] text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#404851] transition-colors gap-2">
                    <span className="material-symbols-outlined">edit</span>
                    <span className="truncate">Edit Profile</span>
                  </button>
                  <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#238636] text-[#0d1117] text-sm font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity gap-2">
                    <span className="material-symbols-outlined">people</span>
                    <span className="truncate">View Connections</span>
                  </button>
                </div>
                <div className="border-t border-[#30363d] pt-6">
                  <p className="text-white text-base font-normal leading-normal">
                    A passionate computer science student with a focus on AI and
                    machine learning. Actively seeking mentorship opportunities
                    and collaborating on exciting tech projects.
                  </p>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3 text-[#8b949e]">
                    <span className="material-symbols-outlined text-xl">
                      school
                    </span>
                    <p className="text-sm">BSc Computer Science</p>
                  </div>
                  <div className="flex items-center gap-3 text-[#8b949e]">
                    <span className="material-symbols-outlined text-xl">
                      group
                    </span>
                    <p className="text-sm">Member of 3 societies</p>
                  </div>
                  <div className="flex items-center gap-3 text-[#8b949e]">
                    <span className="material-symbols-outlined text-xl">
                      location_on
                    </span>
                    <p className="text-sm">London, UK</p>
                  </div>
                </div>
                <div className="border-t border-[#30363d] pt-6">
                  <h3 className="text-white text-base font-bold leading-normal mb-3">
                    Interests
                  </h3>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      "AI",
                      "Debating",
                      "Hackathon",
                      "Web Development",
                      "Python",
                    ].map((interest) => (
                      <div
                        key={interest}
                        className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-[#238636]/20 px-3"
                      >
                        <p className="text-[#238636] text-xs font-medium leading-normal">
                          {interest}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content */}
            <main className="w-full md:w-3/4">
              <div className="flex flex-col gap-8">
                {/* Tabs */}
                <div className="border-b border-[#30363d]">
                  <div className="flex gap-4 sm:gap-8 -mb-px">
                    {[
                      { id: "overview", label: "Overview" },
                      { id: "societies", label: "Societies" },
                      { id: "events", label: "Events" },
                      { id: "mentorship", label: "Mentorship" },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-2 px-2 transition-colors ${
                          activeTab === tab.id
                            ? "border-b-[#238636] text-white"
                            : "border-b-transparent text-[#8b949e] hover:text-white"
                        }`}
                      >
                        <p className="text-sm font-bold leading-normal tracking-[0.015em]">
                          {tab.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tab Content */}
                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Achievements */}
                    <div className="col-span-1 lg:col-span-2">
                      <h2 className="text-xl font-bold text-white mb-4">
                        Achievements
                      </h2>
                      {ACHIEVEMENTS.map((achievement) => (
                        <div
                          key={achievement.id}
                          className="bg-[#161b22] p-6 rounded-lg border border-[#30363d] flex items-center justify-between hover:border-[#238636]/50 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="text-[#238636]">
                              <span className="material-symbols-outlined text-4xl">
                                {achievement.icon}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-white">
                                {achievement.title}
                              </h3>
                              <p className="text-[#8b949e] text-sm">
                                {achievement.description}
                              </p>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-[#8b949e]">
                            arrow_forward_ios
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Upcoming Events */}
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">
                        Upcoming Events
                      </h2>
                      <div className="flex flex-col gap-4">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] flex items-start gap-4 hover:border-[#238636]/50 transition-colors"
                          >
                            <div className="bg-[#238636]/20 rounded-lg p-3 text-[#238636]">
                              <span className="material-symbols-outlined">
                                {event.icon}
                              </span>
                            </div>
                            <div>
                              <h3 className="font-bold text-white">
                                {event.title}
                              </h3>
                              <p className="text-[#8b949e] text-sm">
                                {event.time}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mentorship Status */}
                    <div>
                      <h2 className="text-xl font-bold text-white mb-4">
                        Mentorship Status
                      </h2>
                      <div className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] flex items-start gap-4">
                        <div className="bg-[#238636]/20 rounded-lg p-3 text-[#238636]">
                          <span className="material-symbols-outlined">
                            school
                          </span>
                        </div>
                        <div>
                          <h3 className="font-bold text-[#238636]">
                            Available to Mentor
                          </h3>
                          <p className="text-[#8b949e] text-sm">
                            Looking to mentor students in Python and Machine
                            Learning. Reach out!
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* My Societies */}
                    <div className="col-span-1 lg:col-span-2">
                      <h2 className="text-xl font-bold text-white mb-4">
                        My Societies
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {societies.map((society) => (
                          <div
                            key={society.id}
                            className="bg-[#161b22] p-4 rounded-lg border border-[#30363d] flex flex-col gap-3 hover:border-[#238636]/50 transition-colors"
                          >
                            <img
                              src={society.image}
                              alt={society.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="font-bold text-white">
                                {society.name}
                              </h3>
                              <p className="text-[#8b949e] text-sm">
                                {society.role}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "societies" && (
                  <div className="bg-[#161b22] p-8 rounded-lg border border-[#30363d] text-center">
                    <span className="material-symbols-outlined text-6xl text-[#8b949e] block mb-4">
                      groups
                    </span>
                    <p className="text-white">
                      View your society memberships and activities
                    </p>
                  </div>
                )}

                {activeTab === "events" && (
                  <div className="bg-[#161b22] p-8 rounded-lg border border-[#30363d] text-center">
                    <span className="material-symbols-outlined text-6xl text-[#8b949e] block mb-4">
                      event
                    </span>
                    <p className="text-white">
                      View your event history and upcoming events
                    </p>
                  </div>
                )}

                {activeTab === "mentorship" && (
                  <div className="bg-[#161b22] p-8 rounded-lg border border-[#30363d] text-center">
                    <span className="material-symbols-outlined text-6xl text-[#8b949e] block mb-4">
                      school
                    </span>
                    <p className="text-white">
                      View your mentorship history and availability
                    </p>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      </main>
    </div>
  );
}
