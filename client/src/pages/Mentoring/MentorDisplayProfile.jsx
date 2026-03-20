import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "../../components/common/Avatar";

export default function MentorDisplayProfile() {
  const navigate = useNavigate();

  const mentorData = {
    name: "Olivia Chen",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAt7ZseJgCN7HMPwcoGpGU_fHQOkQEw1brv2r0-pN5YJVMucdRYgTS_njfxNnbLBUhOnmpOntAgIPq1nQChivxcye_30DXXcj_uG5rLLct2TIjHJqBhpgpbmHqFOffpSE8Ghvaf8_DC9I0i6oFUTnyidTMkqHj_F2NJikOT1C9Lqg2b4SNoi6kJSshRdHhA-DVwg6K224T1pW_ke_0o6s1x6M_yNn_-2rPi80fNfM1vWobzJIbPtfVAeVRvZDBM6oz87Sy8MGKkma4",
    description:
      "Computer Science student at Northwood University. Passionate about AI ethics and open-source development. Leading the AI Innovators society and mentoring junior students in software engineering.",
    societies: [
      {
        id: 1,
        name: "AI Innovators",
        role: "President",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBSnqA4WV18crIGsfw5P7smhzB0KdaCkIUUDhNpcFhGonJ1LiOwNYql7jeXO7tMaZHUmtFxTwzfH8FtoK-kWfcN5yQmUlX5viSfY9paedkQZYpq3huIe6L5_ejf5oGoP53iEWgC58WieblKCwM2M5NtdADzqUewz_mdhFtMQI_ZJTHNDwQ54SI7xTc6RK0TBTZv4div8d5IZmzMZkPC-be5TWgprk3sMi93CYTREsAqWFt198h3h2baq7ynBTla9xD0RxtQXZ5akjc",
      },
      {
        id: 2,
        name: "DevOps Hub",
        role: "Member",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuA-VoFCzk3i9SUQ7nUUkJu2aEF64_0CilTiG_rvAXHQTo5meFVXA6RkQ8uc31H9HB7vFPpwq3-yvOcgpLLSfcHA3Bf6v9K4yUzFugiQgTJEV1doQT2qWsK1PWQttrg0bBDSbxDZ4WbBFFZ3-1wtsGn97l1_WjtoGrrLaCIdcWa4Blo8NGWcCEqxu88d497WYRPUYqXjoPlgP8jJG3RdUm-rit7T10cOx77Z2Grtnf9MaindOqBCeJ-XUKSyYYCK1wVqp9_oEYYPOTE",
      },
      {
        id: 3,
        name: "Women in Tech",
        role: "Member",
        image:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuBjj2aUukL9QCkOMphWvC-ReElRZQi8V6DVvF60EBdbt_oJPV9uF_oxBloYImGVfGQ77YO8hUyoMF5CcBH2lacVBKQmAp1QqFDjOD_Sjb80kgYZVr7X5UD0y4RTpV3Vgl1kCY3DWwGDbVuj2xaUzG59jUtnk1aZjLDvp84QeaGS2VbsnkIRNZFUl9zB4H1fX1fULt7QuGvQIDdTAghymckegNh8c63etTPRPgBCunP-YSn6NtSWF_lBNN52HDQAB9xsw2Jsf3iOYNM",
      },
    ],
    events: [
      {
        id: 1,
        month: "OCT",
        day: "28",
        title: "Annual Tech Symposium",
        role: "Organizing",
      },
      {
        id: 2,
        month: "NOV",
        day: "15",
        title: "CodeFest Hackathon 2024",
        role: "Attending",
      },
    ],
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#21262d] px-6 lg:px-10 py-3">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate(-1)}
            className="text-[#c9d1d9] hover:text-[#238636] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-4 text-[#c9d1d9]">
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
            <h2 className="text-[#c9d1d9] text-lg font-bold">CampusConnect</h2>
          </div>
        </div>
        <div className="hidden md:flex flex-1 justify-end gap-6 mr-4">
          <a
            className="text-[#8b949e] hover:text-[#c9d1d9] text-sm font-medium transition-colors"
            href="#dashboard"
          >
            Dashboard
          </a>
          <a
            className="text-[#8b949e] hover:text-[#c9d1d9] text-sm font-medium transition-colors"
            href="#events"
          >
            Events
          </a>
          <a
            className="text-[#8b949e] hover:text-[#c9d1d9] text-sm font-medium transition-colors"
            href="#mentors"
          >
            Mentors
          </a>
          <a
            className="text-[#8b949e] hover:text-[#c9d1d9] text-sm font-medium transition-colors"
            href="#societies"
          >
            Societies
          </a>
          <a
            className="text-[#8b949e] hover:text-[#c9d1d9] text-sm font-medium transition-colors"
            href="#messages"
          >
            Messages
          </a>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center size-10 hover:bg-[#161b22] transition-colors rounded-lg">
            <span className="material-symbols-outlined text-[#8b949e]">
              notifications
            </span>
          </button>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_cQgdZjvfD1j8J43uoKxTLOIdVjPsREpjlEkuX-rAE64rV4FoeP2jlAsDFODOw6BF93phY8t8GfBEsS4wMKq5uUs676yoboRrVjPjR_1WlTcCCIvpQhCghRqu2mYbHXZ33knrCGd8gn5NmbBfrKo_fc1mW_xB-9Rol_sUJOTh2t6bJl70-kWRM_-T1H7AbrFmbBlKJ4HcPY_jt-nvnSLCATy5dZ5vghAnRvWERtu0xoEMw3cJ64lyaKTVIAWUW7NyPq677YpupTw"
            size="10"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 py-8 md:px-10 lg:px-20 xl:px-40">
        <div className="mx-auto w-full max-w-[1280px] flex flex-col gap-8">
          {/* Page Heading */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-1">
              <h1 className="text-[#c9d1d9] text-3xl font-bold md:text-4xl">
                Olivia Chen's Profile
              </h1>
            </div>
            <div className="group relative flex items-center gap-2">
              <span className="material-symbols-outlined text-[#8b949e]">
                lock
              </span>
              <p className="text-[#8b949e] text-sm font-normal">
                Some fields are hidden due to privacy settings.
              </p>
            </div>
          </div>

          {/* Profile Layout */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            {/* Left Column (Sidebar) */}
            <aside className="lg:col-span-4 xl:col-span-3">
              <div className="flex flex-col gap-6">
                <img
                  src={mentorData.image}
                  alt="Profile"
                  className="w-48 h-48 mx-auto lg:w-full lg:h-auto rounded-lg object-cover"
                />
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-[#c9d1d9] text-2xl font-bold">
                      {mentorData.name}
                    </h2>
                    <p className="text-[#8b949e] text-base font-normal">
                      {mentorData.description}
                    </p>
                  </div>
                  <button className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#238636] hover:bg-green-600 transition-colors text-white text-sm font-bold">
                    <span>Send Message</span>
                  </button>
                </div>
              </div>
            </aside>

            {/* Right Column (Content) */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="flex flex-col gap-8">
                {/* Societies Section */}
                <section>
                  <h3 className="text-[#c9d1d9] text-xl font-bold border-b border-[#21262d] pb-3 mb-4">
                    Societies & Affiliations
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mentorData.societies.map((society) => (
                      <div key={society.id} className="flex flex-col gap-3">
                        <div
                          className="w-full bg-[#161b22] bg-center bg-no-repeat aspect-video bg-contain rounded-lg p-4"
                          style={{
                            backgroundImage: `url("${society.image}")`,
                            backgroundSize: "80%",
                          }}
                        />
                        <div>
                          <p className="text-[#c9d1d9] text-base font-medium">
                            {society.name}
                          </p>
                          <p className="text-[#8b949e] text-sm font-normal">
                            {society.role}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Events Section */}
                <section>
                  <h3 className="text-[#c9d1d9] text-xl font-bold border-b border-[#21262d] pb-3 mb-4">
                    Events
                  </h3>
                  <div className="flex flex-col gap-4">
                    {mentorData.events.map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center gap-4 rounded-lg border border-[#21262d] p-4 bg-[#161b22] hover:border-[#238636]/50 transition-colors"
                      >
                        <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-[#0d1117]">
                          <span className="text-xs font-bold uppercase text-[#238636]">
                            {event.month}
                          </span>
                          <span className="text-xl font-bold text-[#c9d1d9]">
                            {event.day}
                          </span>
                        </div>
                        <div className="flex-grow">
                          <p className="font-semibold text-[#c9d1d9]">
                            {event.title}
                          </p>
                          <p className="text-sm text-[#8b949e]">{event.role}</p>
                        </div>
                        <span className="material-symbols-outlined text-[#8b949e]">
                          chevron_right
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Empty State */}
                  <div className="mt-8 text-center rounded-lg border-2 border-dashed border-[#21262d] p-8">
                    <span className="material-symbols-outlined text-4xl text-[#8b949e]">
                      visibility_off
                    </span>
                    <p className="mt-2 font-semibold text-[#c9d1d9]">
                      Projects are Private
                    </p>
                    <p className="text-sm text-[#8b949e]">
                      This user has not made their projects public.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
