import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Avatar from "../../components/common/Avatar";
import IconButton from "../../components/common/IconButton";
import { getButtonClassName } from "../../components/common/Button";
import {
  selectUpcomingEvents,
  setUpcomingEvents,
} from "../../redux/slices/eventSlice";
import {
  selectRegisteredSocieties,
  setRegisteredSocieties,
} from "../../redux/slices/societySlice";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getStudentTheme } from "./studentTheme";

const ACHIEVEMENTS = [
  {
    id: 1,
    icon: "emoji_events",
    title: "Hackathon Winner - Spring 2024",
    description: "Best project in the AI for Social Good category.",
  },
];

const PROFILE_INTERESTS = ["AI", "Debating", "Hackathon", "Web Development", "Python"];

const PROFILE_FACTS = [
  { icon: "school", label: "BSc Computer Science" },
  { icon: "group", label: "Member of 3 societies" },
  { icon: "location_on", label: "London, UK" },
];

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "societies", label: "Societies" },
  { id: "events", label: "Events" },
  { id: "mentorship", label: "Mentorship" },
];

function SectionTitle({ children, isDark }) {
  return (
    <h2 className={cn("text-xl font-semibold", isDark ? "text-white" : "text-slate-900")}>
      {children}
    </h2>
  );
}

export default function StudentProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");
  const isDark = useHomeTheme();
  const theme = getStudentTheme(isDark);

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
    <div className={cn("min-h-screen w-full", theme.page)}>
      <header className={cn("sticky top-0 z-50 border-b backdrop-blur-sm", theme.header)}>
        <div className="flex items-center justify-between px-6 py-3 sm:px-10 lg:px-20">
          <div className="flex items-center gap-8">
            <button
              onClick={() => navigate("/student/dashboard")}
              className={getButtonClassName({ variant: "ghost", size: "icon-md", isDark, className: "min-w-0 px-0" })}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>

            <div className="flex items-center gap-4">
              <svg className="size-6 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
              <h2 className={cn("text-lg font-semibold tracking-[-0.015em]", theme.text)}>CampusNexus</h2>
            </div>

            <label className="hidden max-w-64 min-w-40 flex-col md:flex">
              <div className="flex h-10 w-full items-stretch overflow-hidden rounded-2xl">
                <div className={cn("flex items-center justify-center px-3", theme.subtleCard)}>
                  <span className={cn("material-symbols-outlined text-xl", theme.muted)}>search</span>
                </div>
                <input
                  className={cn(
                    "form-input h-full w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-2xl border-none px-4 pl-2 text-sm font-normal leading-normal focus:outline-0 focus:ring-0",
                    isDark
                      ? "bg-background-dark text-text-primary-dark placeholder:text-text-secondary-dark"
                      : "bg-surface-muted text-text-primary-light placeholder:text-text-secondary-light"
                  )}
                  placeholder="Search"
                />
              </div>
            </label>
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 md:gap-8">
            <div className="hidden items-center gap-9 lg:flex">
              <button
                onClick={() => navigate("/student/dashboard")}
                className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2" })}
              >
                Dashboard
              </button>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/events">
                Events
              </a>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/societies">
                Societies
              </a>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/mentors">
                Mentors
              </a>
            </div>

            <div className="flex gap-2">
              <IconButton icon="notifications" title="Notifications" variant="icon" size="icon-md" />
              <IconButton icon="chat_bubble" title="Messages" variant="icon" size="icon-md" />
            </div>

            <Avatar
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
              size="10"
              hover={true}
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-6 sm:px-10 md:py-10 lg:px-20">
        <div className="layout-content-container flex w-full max-w-6xl flex-col">
          <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_minmax(0,1fr)]">
              <aside>
                <div className={cn("flex flex-col gap-6 rounded-[24px] border p-6", theme.card)}>
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzGlrzfaEAmN_FZricBQPbxSsCJrQFKHboMPee2CpXGl-vwQ_LOrRtcLB-4jYYaD7GmxhmZQPiv2Y5G2voagN6WX_210ezdTp6sYS6AdsfXSX28fl0_M-7PACLInMnKB9Tg9zpeCPrfmCD0ag8foIuBPthVTKAclMFa9iL41Pbkl2aWSHaacSRkBDu7nx2hcpdgMZJFdiTwyLDgCw6XAn0eZT4l-8eCMSuR8eTGpr0CEclMcUe-Pc7z-CMHihg83hh1YNOaNyQDYk"
                    alt="Profile"
                    className="mx-auto h-48 w-48 rounded-[24px] object-cover md:h-64 md:w-full"
                  />

                  <div className="space-y-1">
                    <h1 className={cn("text-3xl font-bold tracking-tight", theme.text)}>Alex Doe</h1>
                    <p className={cn("text-base", theme.muted)}>alex.doe</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button className={getButtonClassName({ variant: "secondary", size: "lg", isDark, className: "w-full" })}>
                      <span className="material-symbols-outlined">edit</span>
                      <span className="truncate">Edit Profile</span>
                    </button>
                    <button className={getButtonClassName({ variant: "primary", size: "lg", isDark, className: "w-full" })}>
                      <span className="material-symbols-outlined">people</span>
                      <span className="truncate">View Connections</span>
                    </button>
                  </div>

                  <div className={cn("border-t pt-6", theme.divider)}>
                    <p className={cn("text-sm leading-6", theme.muted)}>
                      A passionate computer science student with a focus on AI and machine learning.
                      Actively seeking mentorship opportunities and collaborating on exciting tech projects.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {PROFILE_FACTS.map((fact) => (
                      <div key={fact.label} className={cn("flex items-center gap-3 text-sm", theme.muted)}>
                        <span className="material-symbols-outlined text-xl">{fact.icon}</span>
                        <p>{fact.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className={cn("border-t pt-6", theme.divider)}>
                    <h3 className={cn("mb-3 text-lg font-medium", theme.text)}>Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {PROFILE_INTERESTS.map((interest) => (
                        <div key={interest} className={cn("flex h-8 items-center justify-center rounded-full border px-3 text-xs font-medium", theme.badge)}>
                          <p>{interest}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </aside>

              <div className="flex flex-col gap-8">
                <div className={cn("rounded-[24px] border p-2", theme.card)}>
                  <div className="flex flex-wrap gap-2">
                    {TABS.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={getButtonClassName({
                          variant: activeTab === tab.id ? "primary" : "secondary",
                          size: "sm",
                          isDark,
                        })}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === "overview" && (
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <div className="lg:col-span-2">
                      <SectionTitle isDark={isDark}>Achievements</SectionTitle>
                      <div className="mt-4 space-y-4">
                        {ACHIEVEMENTS.map((achievement) => (
                          <div
                            key={achievement.id}
                            className={cn(
                              "flex items-center justify-between rounded-[24px] border p-6 transition-colors",
                              theme.card
                            )}
                          >
                            <div className="flex items-center gap-4">
                              <div className={cn("rounded-2xl border p-3", theme.badge)}>
                                <span className="material-symbols-outlined text-4xl">{achievement.icon}</span>
                              </div>
                              <div>
                                <h3 className={cn("text-lg font-medium", theme.text)}>{achievement.title}</h3>
                                <p className={cn("text-sm", theme.muted)}>{achievement.description}</p>
                              </div>
                            </div>
                            <span className={cn("material-symbols-outlined", theme.muted)}>arrow_forward_ios</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <SectionTitle isDark={isDark}>Upcoming Events</SectionTitle>
                      <div className="mt-4 flex flex-col gap-4">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className={cn("flex items-start gap-4 rounded-[24px] border p-4 transition-colors", theme.card)}
                          >
                            <div className={cn("rounded-2xl border p-3", theme.badge)}>
                              <span className="material-symbols-outlined">{event.icon}</span>
                            </div>
                            <div>
                              <h3 className={cn("font-medium", theme.text)}>{event.title}</h3>
                              <p className={cn("text-sm", theme.muted)}>{event.time}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <SectionTitle isDark={isDark}>Mentorship Status</SectionTitle>
                      <div className={cn("mt-4 flex items-start gap-4 rounded-[24px] border p-4", theme.card)}>
                        <div className={cn("rounded-2xl border p-3", theme.badge)}>
                          <span className="material-symbols-outlined">school</span>
                        </div>
                        <div>
                          <h3 className={cn("font-medium", isDark ? "text-primary" : "text-text-primary-light")}>
                            Available to Mentor
                          </h3>
                          <p className={cn("text-sm", theme.muted)}>
                            Looking to mentor students in Python and Machine Learning. Reach out!
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <SectionTitle isDark={isDark}>My Societies</SectionTitle>
                      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {societies.map((society) => (
                          <div
                            key={society.id}
                            className={cn("flex flex-col gap-3 rounded-[24px] border p-4 transition-colors", theme.card)}
                          >
                            <img
                              src={society.image}
                              alt={society.name}
                              className="h-12 w-12 rounded-2xl object-cover"
                            />
                            <div>
                              <h3 className={cn("font-medium", theme.text)}>{society.name}</h3>
                              <p className={cn("text-sm", theme.muted)}>{society.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "societies" && (
                  <div className={cn("rounded-[24px] border p-10 text-center", theme.card)}>
                    <span className={cn("material-symbols-outlined mb-4 block text-6xl", theme.muted)}>groups</span>
                    <p className={cn("text-base", theme.text)}>
                      View your society memberships and activities
                    </p>
                  </div>
                )}

                {activeTab === "events" && (
                  <div className={cn("rounded-[24px] border p-10 text-center", theme.card)}>
                    <span className={cn("material-symbols-outlined mb-4 block text-6xl", theme.muted)}>event</span>
                    <p className={cn("text-base", theme.text)}>
                      View your event history and upcoming events
                    </p>
                  </div>
                )}

                {activeTab === "mentorship" && (
                  <div className={cn("rounded-[24px] border p-10 text-center", theme.card)}>
                    <span className={cn("material-symbols-outlined mb-4 block text-6xl", theme.muted)}>school</span>
                    <p className={cn("text-base", theme.text)}>
                      View your mentorship history and availability
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
