import { useNavigate } from "react-router-dom";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function MentorProfileView() {
  const navigate = useNavigate();

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor/dashboard" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-4xl flex-1">
            {/* Profile Header */}
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* Profile Image and Basic Info */}
              <div className="flex flex-col items-center lg:items-start gap-4 flex-1">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBgjnv-ixtGxRDh4QEaPBNUdMjXlCgO4Di7YsyjQZ_I21EDiOSRocUjGni8cViV_CJzUNuTwbKO6qL2ELKucJviHvtTGb5IoWrvryA6QiSKES--KcSvqsDWZ1KpSuZmk0lwuAdXOoKx29-hTfGzUVjUFmMfKN8ePF2jbbETEb-ZJ4sbGp0i5zNnzNhdXDhOyG5SRDAgKbhgIsTZDf5Qvwv7Du7ImY-uPgAE-OPeOuTdAxD6cykLE_jM18XdA4t_EU_5vQrYK9XVePg"
                  alt="Mentor Profile"
                  className="w-32 h-32 rounded-full border-4 border-[#1dc964]"
                />
                <div>
                  <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                    Alex Johnson
                  </h1>
                  <p className="text-[#1dc964] text-lg font-semibold">
                    Senior Web Developer
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-yellow-400">⭐ 4.9</span>
                    <span className="text-[#9eb7a9]">(156 reviews)</span>
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 flex-1">
                <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl text-center">
                  <p className="text-[#9eb7a9] text-sm mb-2">Total Sessions</p>
                  <p className="text-white text-3xl font-bold">156</p>
                </div>
                <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl text-center">
                  <p className="text-[#9eb7a9] text-sm mb-2">Mentees</p>
                  <p className="text-white text-3xl font-bold">42</p>
                </div>
                <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl text-center">
                  <p className="text-[#9eb7a9] text-sm mb-2">Success Rate</p>
                  <p className="text-white text-3xl font-bold">98%</p>
                </div>
                <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl text-center">
                  <p className="text-[#9eb7a9] text-sm mb-2">Hourly Rate</p>
                  <p className="text-white text-3xl font-bold">$50</p>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl mb-8">
              <h2 className="text-white text-2xl font-bold mb-4">About Me</h2>
              <p className="text-[#c9d1d9] leading-relaxed">
                With over 8 years of experience in web development, I specialize
                in React, Node.js, and modern web technologies. I've helped over
                40 mentees successfully transition into tech careers and improve
                their coding skills. My teaching philosophy focuses on
                practical, real-world applications combined with strong
                theoretical foundations.
              </p>
            </div>

            {/* Expertise */}
            <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl mb-8">
              <h2 className="text-white text-2xl font-bold mb-4">
                Expertise & Skills
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "React",
                  "JavaScript",
                  "Node.js",
                  "Web Development",
                  "CSS/HTML",
                  "Database Design",
                  "API Development",
                  "TypeScript",
                  "Git/GitHub",
                ].map((skill, idx) => (
                  <div
                    key={idx}
                    className="px-4 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-center"
                  >
                    <span className="text-[#c9d1d9] font-semibold">
                      {skill}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Education & Certifications */}
            <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl mb-8">
              <h2 className="text-white text-2xl font-bold mb-4">
                Education & Certifications
              </h2>
              <div className="space-y-4">
                <div className="flex gap-4 pb-4 border-b border-[#30363d]">
                  <span className="material-symbols-outlined text-[#1dc964] flex-shrink-0">
                    school
                  </span>
                  <div>
                    <p className="text-white font-semibold">
                      Bachelor of Science in Computer Science
                    </p>
                    <p className="text-[#9eb7a9] text-sm">
                      University of Technology • 2016
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 pb-4 border-b border-[#30363d]">
                  <span className="material-symbols-outlined text-[#1dc964] flex-shrink-0">
                    verified
                  </span>
                  <div>
                    <p className="text-white font-semibold">
                      React Advanced Certification
                    </p>
                    <p className="text-[#9eb7a9] text-sm">Udemy • 2022</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="material-symbols-outlined text-[#1dc964] flex-shrink-0">
                    verified
                  </span>
                  <div>
                    <p className="text-white font-semibold">
                      AWS Solutions Architect Certification
                    </p>
                    <p className="text-[#9eb7a9] text-sm">AWS • 2023</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={() => navigate("/mentor-profile")}
                className="flex items-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity flex-1"
              >
                <span className="material-symbols-outlined">edit</span>
                Edit Profile
              </button>
              <button
                onClick={() => navigate("/mentor/dashboard")}
                className="flex items-center gap-2 px-6 py-3 bg-[#30363d] text-white font-bold rounded-lg hover:bg-[#404851] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
