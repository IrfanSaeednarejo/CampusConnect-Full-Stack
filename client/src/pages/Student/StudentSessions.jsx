import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAllSessions,
  setSessions,
  removeSession,
} from "../../redux/slices/mentoringSlice";
import Avatar from "../../components/common/Avatar";
import IconButton from "../../components/common/IconButton";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import { getButtonClassName } from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getStudentTheme } from "./studentTheme";

const STATUS_STYLES = {
  pending: {
    dark: "border-warning/30 bg-warning/10 text-warning",
    light: "bg-amber-50 text-amber-700 border-amber-200",
  },
  scheduled: {
    dark: "border-success/30 bg-success/10 text-success",
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  confirmed: {
    dark: "border-success/30 bg-success/10 text-success",
    light: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  completed: {
    dark: "border-info/30 bg-info/10 text-info",
    light: "bg-sky-50 text-sky-700 border-sky-200",
  },
};

const TAB_CONFIG = [
  { key: "upcoming", label: "Upcoming" },
  { key: "pending", label: "Pending" },
  { key: "completed", label: "Completed" },
];

export default function StudentSessions() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const sessions = useSelector(selectAllSessions);
  const [activeTab, setActiveTab] = useState("upcoming");
  const isDark = useHomeTheme();
  const theme = getStudentTheme(isDark);

  useEffect(() => {
    if (sessions.length === 0) {
      dispatch(
        setSessions([
          {
            id: 1001,
            mentorName: "Dr. Evelyn Reed",
            mentorImage:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuA0jTMkVZrHrZTVmla4S4Je5c1D36iLLgtz5zB_oZrMcSJbuNexEisrvhdc-NMzmPBIa7YxLyXuCuyYIX6afgK26REr07GOIgtlWbvXQEBDFOkDEf6y7ay5EX9vStNbglIRnSDaNlE5sb1cDVFk0k-s8S_ZBpv3x5kDjuzUdCrCdZzCeCHwFaF1iWAc6nGD6f7KZNT4FSU6gJZtUzrM8VmaGMg_txG_BcWS1kfGr9qfhEKDxs-qmTPWTH-lYRZdpswsDEVNysWfygI",
            date: "2026-03-02",
            time: "10:00 AM",
            duration: 1,
            topic: "AI Research Pathways",
            status: "scheduled",
          },
          {
            id: 1002,
            mentorName: "Ben Carter",
            mentorImage:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuBE6tGmIelYR9Lgm-1pwjDVUA6-iB_nfG9VMQ-ziaxjkGxBhDazaCIJClQxvs0cIBqjYNIRgbAcDinkwDssSVNFnTKkpv2Wt6nXs24NWZVgE3q588PfVxEvcSE1g7ur4WMA43VNQVxcmMW9SI37Y9u6C8fz27mk9Iuo2hAbDp4jcrnrLB3f-UNr4_qhf5m0LJj6BbvR9oct4apHAS9DP7jDXJt2LJxsj5gOnJSb6OXZshL1SKL3_2RWaTcGGRlp9fSbU17T9l7-5Ek",
            date: "2026-02-28",
            time: "2:00 PM",
            duration: 1.5,
            topic: "React Architecture Review",
            status: "pending",
          },
          {
            id: 1003,
            mentorName: "Dr. Anya Sharma",
            mentorImage:
              "https://lh3.googleusercontent.com/aida-public/AB6AXuD-xTMQV6m4x9u1aHS5QXnuoSyrcNcGtWqZyoqLVAtEs6PjGobk3G90rW-RFKGaMELavxqw3fzNVLNTPojJGzLJJ8RGxgrDUQAX2FArL_DAVd8n0yDsqIs9rHzUEHj0m8j_TtncwNtkZZVuao8mMa_IH87XxSjAUiLrMesI0trc8lLd-qaBRGQZhOj8_t8Z31SptB2XL1Wutq9Jcfmlr_7rsHb03YDxy-e9hcZZ7Ro2Hi_LicZHT1WfmHCQ5n6xIuruddxq52WuUp4",
            date: "2026-02-10",
            time: "1:30 PM",
            duration: 1,
            topic: "Internship Interview Prep",
            status: "completed",
          },
        ])
      );
    }
  }, [dispatch, sessions.length]);

  const filteredSessions = useMemo(() => {
    if (activeTab === "pending") {
      return sessions.filter((session) => session.status === "pending");
    }
    if (activeTab === "completed") {
      return sessions.filter((session) => session.status === "completed");
    }
    return sessions.filter((session) => ["scheduled", "confirmed"].includes(session.status));
  }, [activeTab, sessions]);

  const handleCancelRequest = (sessionId) => {
    dispatch(removeSession(sessionId));
  };

  const handleJoinSession = (mentorName) => {
    alert(`Joining your session with ${mentorName}.`);
  };

  const handleFeedback = () => {
    navigate("/feedback");
  };

  return (
    <div className={cn("min-h-screen", theme.page)}>
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
          </div>

          <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4 md:gap-8">
            <div className="hidden items-center gap-9 lg:flex">
              <button
                onClick={() => navigate("/student/dashboard")}
                className={getButtonClassName({ variant: "ghost", size: "sm", isDark, className: "min-w-0 px-2" })}
              >
                Dashboard
              </button>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/student/sessions">
                Sessions
              </a>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/student/book-mentor">
                Book Mentor
              </a>
              <a className={cn("text-sm font-medium", theme.navLink)} href="/student/societies">
                Societies
              </a>
            </div>
            <IconButton
              icon="notifications"
              onClick={() => navigate("/student/notifications")}
              title="Notifications"
              variant="default"
            />
            <Avatar
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
              size="10"
              hover={true}
              borderColor="[rgb(var(--color-primary))]"
            />
          </div>
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-6 sm:px-10 md:py-10 lg:px-20">
        <div className="layout-content-container flex w-full max-w-6xl flex-col">
          <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
            <PageHeader
              title="My Sessions"
              subtitle="Track your mentoring sessions and requests"
              icon="forum"
              showBack={false}
              isDark={isDark}
              className="border-none bg-transparent px-0 py-0"
              action={
                <Button onClick={() => navigate("/student/book-mentor")} className="h-10 px-4 text-sm">
                  Book a Mentor
                </Button>
              }
            />

            <div className={cn("mt-8 flex flex-wrap gap-3 border-b pb-4", theme.divider)}>
              {TAB_CONFIG.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={getButtonClassName({
                    variant: activeTab === tab.key ? "primary" : "secondary",
                    size: "sm",
                    isDark,
                  })}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-4">
              {filteredSessions.length === 0 ? (
                <Card padding="p-12" isDark={isDark}>
                  <EmptyState
                    icon="event"
                    title="No sessions yet"
                    description="Book a mentor to start your mentoring journey."
                  />
                  <div className="mt-6 flex justify-center">
                    <Button onClick={() => navigate("/student/book-mentor")} className="h-10 px-5 text-sm">
                      Book a Mentor
                    </Button>
                  </div>
                </Card>
              ) : (
                filteredSessions.map((session) => (
                  <Card key={session.id} padding="p-6" isDark={isDark}>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                      <div className="flex items-start gap-4">
                        <div
                          className="h-12 w-12 rounded-full bg-cover bg-center"
                          style={{ backgroundImage: `url("${session.mentorImage}")` }}
                        ></div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className={cn("text-lg font-semibold", theme.text)}>{session.mentorName}</h3>
                            <span
                              className={cn(
                                "rounded-full border px-2 py-1 text-xs uppercase tracking-wide",
                                isDark
                                  ? STATUS_STYLES[session.status]?.dark
                                  : STATUS_STYLES[session.status]?.light
                              )}
                            >
                              {session.status}
                            </span>
                          </div>
                          <p className={cn("mt-1 text-sm", theme.muted)}>{session.topic}</p>
                          <div className={cn("mt-3 flex flex-wrap gap-4 text-sm", theme.muted)}>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">calendar_today</span>
                              {session.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">schedule</span>
                              {session.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="material-symbols-outlined text-base">timer</span>
                              {session.duration} hr
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {session.status === "pending" && (
                          <button
                            onClick={() => handleCancelRequest(session.id)}
                            className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
                          >
                            Cancel Request
                          </button>
                        )}
                        {["scheduled", "confirmed"].includes(session.status) && (
                          <button
                            onClick={() => handleJoinSession(session.mentorName)}
                            className={getButtonClassName({ variant: "primary", size: "md", isDark })}
                          >
                            Join Session
                          </button>
                        )}
                        {session.status === "completed" && (
                          <button
                            onClick={handleFeedback}
                            className={getButtonClassName({ variant: "secondary", size: "md", isDark })}
                          >
                            Leave Feedback
                          </button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
