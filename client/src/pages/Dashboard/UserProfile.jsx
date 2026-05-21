import React from "react";
import Header from "../../components/layout/Header.jsx";
import Sidebar from "../../components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";
import useHomeTheme from "../../hooks/useHomeTheme";

const UserProfile = ({ profile }) => {
  const navigate = useNavigate();
  const isDark = useHomeTheme();

  return (
    <div className={`flex min-h-screen flex-col transition-colors duration-300 ${isDark ? "bg-black text-white" : "bg-slate-50 text-slate-900"}`}>
      <Header page="student-dashboard" />

      <main className="flex flex-1 justify-center px-4 py-5 sm:px-10 lg:px-20 md:py-10">
        <div className="flex w-full max-w-6xl flex-col gap-8 md:flex-row">
          <Sidebar profile={profile} />

          <div className="flex w-full flex-col gap-8 md:w-3/4">
            <div className={isDark ? "border-b border-border-dark" : "border-b border-slate-200"}>
              <div className="-mb-px flex gap-4 sm:gap-8">
                {["Overview", "Societies", "Events", "Mentorship"].map((tab, idx) => (
                  <button
                    key={idx}
                    className={`flex flex-col items-center justify-center border-b-2 px-2 pb-3 pt-2 transition-colors ${
                      idx === 0
                        ? isDark
                          ? "border-b-primary text-text-primary-dark"
                          : "border-b-slate-900 text-slate-900"
                        : isDark
                          ? "border-b-transparent text-text-secondary-dark hover:text-text-primary-dark"
                          : "border-b-transparent text-slate-500 hover:text-slate-900"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <section>
              <h2 className={`mb-4 text-xl font-bold ${isDark ? "text-text-primary-dark" : "text-slate-900"}`}>
                Achievements
              </h2>

              <div className={`flex items-center justify-between rounded-lg border p-6 ${isDark ? "bg-container-dark border-border-dark" : "bg-white border-slate-200 shadow-sm"}`}>
                <div className="flex items-center gap-4">
                  <div className="text-primary">
                    <span className="material-symbols-outlined !text-4xl">emoji_events</span>
                  </div>

                  <div>
                    <h3 className={`font-bold ${isDark ? "text-text-primary-dark" : "text-slate-900"}`}>
                      Hackathon Winner - Spring 2024
                    </h3>
                    <p className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>
                      Best project in the AI for Social Good category.
                    </p>
                  </div>
                </div>

                <button
                  className={`material-symbols-outlined cursor-pointer transition ${isDark ? "text-text-secondary-dark hover:text-text-primary-dark" : "text-slate-500 hover:text-slate-900"}`}
                  onClick={() => navigate("/dashboard/achievements")}
                >
                  arrow_forward_ios
                </button>
              </div>
            </section>

            <section>
              <h2 className={`mb-4 text-xl font-bold ${isDark ? "text-text-primary-dark" : "text-slate-900"}`}>
                Upcoming Events
              </h2>

              <div className="flex flex-col gap-4">
                <div className={`flex items-start gap-4 rounded-lg border p-4 ${isDark ? "bg-container-dark border-border-dark" : "bg-white border-slate-200 shadow-sm"}`}>
                  <div className="rounded-lg bg-primary/20 p-3 text-primary">
                    <span className="material-symbols-outlined">event</span>
                  </div>

                  <div>
                    <h3 className={`font-bold ${isDark ? "text-text-primary-dark" : "text-slate-900"}`}>
                      AI Ethics Debate
                    </h3>
                    <p className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>
                      Tomorrow at 6 PM
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
