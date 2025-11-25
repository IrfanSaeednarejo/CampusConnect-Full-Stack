import React from "react";
import Header from "../../components/layout/Header.jsx"; // unified shared Header
import Sidebar from "../../components/layout/Sidebar.jsx";
import { useNavigate } from "react-router-dom";

const UserProfile = ({ profile }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Shared Header */}
      <Header page="student-dashboard" />

      {/* Main Layout */}
      <main className="px-4 sm:px-10 lg:px-20 flex flex-1 justify-center py-5 md:py-10">
        <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
          {/* Sidebar */}
          <Sidebar profile={profile} />

          {/* Dashboard Main Content */}
          <div className="w-full md:w-3/4 flex flex-col gap-8">
            {/* Tabs */}
            <div className="border-b border-border-dark">
              <div className="flex gap-4 sm:gap-8 -mb-px">
                {["Overview", "Societies", "Events", "Mentorship"].map(
                  (tab, idx) => (
                    <button
                      key={idx}
                      className={`flex flex-col items-center justify-center border-b-3 pb-3 pt-2 px-2 transition-colors ${
                        idx === 0
                          ? "border-b-primary text-text-primary-dark"
                          : "border-b-transparent text-text-secondary-dark hover:text-text-primary-dark"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Achievements Section */}
            <section>
              <h2 className="text-xl font-bold text-text-primary-dark mb-4">
                Achievements
              </h2>

              <div className="bg-container-dark p-6 rounded-lg border border-border-dark flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-primary">
                    <span className="material-symbols-outlined !text-4xl">
                      emoji_events
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-text-primary-dark">
                      Hackathon Winner — Spring 2024
                    </h3>
                    <p className="text-text-secondary-dark text-sm">
                      Best project in the AI for Social Good category.
                    </p>
                  </div>
                </div>

                <button
                  className="material-symbols-outlined text-text-secondary-dark cursor-pointer hover:text-text-primary-dark transition"
                  onClick={() => navigate("/dashboard/achievements")}
                >
                  arrow_forward_ios
                </button>
              </div>
            </section>

            {/* Upcoming Events Section */}
            <section>
              <h2 className="text-xl font-bold text-text-primary-dark mb-4">
                Upcoming Events
              </h2>

              <div className="flex flex-col gap-4">
                <div className="bg-container-dark p-4 rounded-lg border border-border-dark flex items-start gap-4">
                  <div className="bg-primary/20 rounded-lg p-3 text-primary">
                    <span className="material-symbols-outlined">event</span>
                  </div>

                  <div>
                    <h3 className="font-bold text-text-primary-dark">
                      AI Ethics Debate
                    </h3>
                    <p className="text-text-secondary-dark text-sm">
                      Tomorrow at 6 PM
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Additional Sections Placeholder */}
            {/* Societies, Mentorship, Events, Workshops, etc. */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
