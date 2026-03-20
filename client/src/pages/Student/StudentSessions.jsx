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

const STATUS_STYLES = {
  pending: "bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30",
  scheduled: "bg-[#238636]/10 text-[#2ea043] border-[#238636]/30",
  confirmed: "bg-[#238636]/10 text-[#2ea043] border-[#238636]/30",
  completed: "bg-[#0ea5e9]/10 text-[#38bdf8] border-[#0ea5e9]/30",
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
        ]),
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
    return sessions.filter((session) =>
      ["scheduled", "confirmed"].includes(session.status),
    );
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
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
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
              href="/student/sessions"
            >
              Sessions
            </a>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/student/book-mentor"
            >
              Book Mentor
            </a>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/student/societies"
            >
              Societies
            </a>
          </div>
          <div className="flex gap-2">
            <IconButton
              icon="notifications"
              onClick={() => navigate("/student/notifications")}
              title="Notifications"
              variant="default"
            />
          </div>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
            size="10"
            hover={true}
            borderColor="[#238636]"
          />
        </div>
      </header>

      <main className="px-4 sm:px-10 lg:px-20 flex flex-1 justify-center py-5 md:py-10">
        <div className="layout-content-container flex flex-col w-full max-w-6xl">
          <PageHeader
            title="My Sessions"
            subtitle="Track your mentoring sessions and requests"
            icon="forum"
            showBack={false}
            action={
              <Button onClick={() => navigate("/student/book-mentor")}
                className="h-10 px-4 text-sm"
              >
                Book a Mentor
              </Button>
            }
          />

          <div className="mt-6 flex flex-wrap gap-3 border-b border-[#30363d]">
            {TAB_CONFIG.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-semibold transition-colors border-b-2 ${
                  activeTab === tab.key
                    ? "text-[#238636] border-[#238636]"
                    : "text-[#8b949e] border-transparent hover:text-[#c9d1d9]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-4">
            {filteredSessions.length === 0 ? (
              <Card padding="p-12">
                <EmptyState
                  icon="event"
                  title="No sessions yet"
                  description="Book a mentor to start your mentoring journey."
                />
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => navigate("/student/book-mentor")}
                    className="h-10 px-5 text-sm"
                  >
                    Book a Mentor
                  </Button>
                </div>
              </Card>
            ) : (
              filteredSessions.map((session) => (
                <Card key={session.id} padding="p-6">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-start gap-4">
                      <div
                        className="h-12 w-12 rounded-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url("${session.mentorImage}")`,
                        }}
                      ></div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-[#e6edf3]">
                            {session.mentorName}
                          </h3>
                          <span
                            className={`text-xs uppercase tracking-wide border px-2 py-1 rounded-full ${
                              STATUS_STYLES[session.status] ||
                              "bg-[#30363d] text-[#9ca3af] border-[#30363d]"
                            }`}
                          >
                            {session.status}
                          </span>
                        </div>
                        <p className="text-sm text-[#9ca3af] mt-1">
                          {session.topic}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-4 text-sm text-[#8b949e]">
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              calendar_today
                            </span>
                            {session.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              schedule
                            </span>
                            {session.time}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-base">
                              timer
                            </span>
                            {session.duration} hr
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {session.status === "pending" && (
                        <button
                          onClick={() => handleCancelRequest(session.id)}
                          className="rounded-lg border border-[#30363d] px-4 py-2 text-sm font-semibold text-[#e6edf3] hover:border-[#8b949e]"
                        >
                          Cancel Request
                        </button>
                      )}
                      {["scheduled", "confirmed"].includes(session.status) && (
                        <button
                          onClick={() => handleJoinSession(session.mentorName)}
                          className="rounded-lg bg-[#238636] px-4 py-2 text-sm font-semibold text-white hover:bg-[#2ea043]"
                        >
                          Join Session
                        </button>
                      )}
                      {session.status === "completed" && (
                        <button
                          onClick={handleFeedback}
                          className="rounded-lg border border-[#238636] px-4 py-2 text-sm font-semibold text-[#2ea043] hover:bg-[#238636]/10"
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
        </div>
      </main>
    </div>
  );
}
