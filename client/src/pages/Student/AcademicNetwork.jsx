import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllMembers,
  setMembers,
} from "../../redux/slices/memberSlice";
import Avatar from "../../components/common/Avatar";

export default function AcademicNetwork() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("name");

  const profiles = useSelector(selectAllMembers);

  useEffect(() => {
    if (profiles.length === 0) {
      const mockProfiles = [
    {
      id: 1,
      name: "Dr. Evelyn Reed",
      role: "Professor, Computer Science",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAVusTyWqc7DI9AudhLe2pI0pZIOWvzb8CzyrHToin7EwbfbtUYdSzo0sam9KPaO07tvw3NVZ2BxCvm5-IQO-uScCFn_aQEAO0zMe_GbGVwEzn2q9XgfE3GEbXRfWjK4pGhFYa0DRxcfCMXcEiTOtiUEQiDTFQ5nH7osmBLtFZe8Hb5o7A8p4pE-pjSisPsDdkw1FdnuE6qJWkfcz8uTOh-BfP8_p_2EgOx2ANY8EDZI492k97RqvbzcKzmHSziogxIVtMxFnVwO4Y",
      skills: ["Machine Learning", "AI Ethics"],
      interests: ["Machine Learning", "AI Ethics"],
      buttonType: "message",
    },
    {
      id: 2,
      name: "Liam Chen",
      role: "Student, Business Analytics",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDpxGZ5n1NE2_J73JN_LSrjev-FpYakzvIIzjrkcmpytQOGxn2ceFJgTBvkTrTqH2gz2b4TbeGvQ1nC_fxrOPKdRl-7zTg1j2UNEQ_3C0dhSVGArOLDPIr3LlkG01sMtJiCtPVBdCDW62yucwruUF9coN5h5P5wsP2hbu7cTMsj8ywZsWQ5157Vyemdt1X2I5mfhGDdYkrclA0V9UwX3uF63sIV3VXB2xnmwgmnorjbM8ScMwfc_Mq_NK0f12zT4-NaskUlYDwKRGQ",
      skills: ["Data Visualization", "Finance Club"],
      interests: ["Data Visualization", "Finance Club"],
      buttonType: "connect",
    },
    {
      id: 3,
      name: "Aisha Khan",
      role: "Student, Graphic Design",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDCh25_NkUXpUHdBFiDXrfCciMDW5mSubLmfL8VBtcSZlfZEldd10ok57tOcW4gmGOmmcDvHyARIBsEsYHhDEvpR0dvOHibjSaYLu6K5QQi9hVkXbG4aWPyKiI_vzxEryduWttEWMQnvJGOz8zKJl5CzG9j0o8-PGoD52fphRJ_8EPVuuBYptaOcPftNKxuQ0PPeIcPrFKxOuaVackVesfprtYrRKXr2rRgdOJiUM_OHxyrYwf85WrObqyQ3lbKZP2y6-9LoQJtGMg",
      skills: ["UI/UX Design", "Art Society", "Webflow"],
      interests: ["UI/UX Design", "Art Society", "Webflow"],
      buttonType: "pending",
    },
    {
      id: 4,
      name: "Ben Carter",
      role: "Mentor, Software Engineering",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBhCC5PBQI8wrKa1mKNaaNbWYgwigC7s6DvDH6wUMWZC8jhp3Urbe26o7992qKyOg2rDQ_sB3g6MukTIf7z4iC3HppKfRN0SG8Bl5GIF98aZQyzJUq_ToGQ_Jctl8YTVet9pifF0eGQVs4sIYCtb0E0A3IC1u0BWbnZQ60Buoxyi2ZDz4wivKRLzBpxxZ_f7H96mrcy2v8c6QdD_tDh1KAkoG0pFe_YTxHZyrbEV9OYfIrwN-hmNUXKuXfFQo74TivXr7omQROLSD8",
      skills: ["React", "Node.js"],
      interests: ["React", "Node.js"],
      buttonType: "connect",
    },
    {
      id: 5,
      name: "Olivia Martinez",
      role: "Student, Environmental Science",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCHgbUHBnQyTdROxnH_CTKu678wE9E__5KGwAIrAZLnCCY4k_H8toPmIwpTR_Svd1q8sXzNGC9BKtQZJEiCsf20KCCmuWGLH81z0xVgjsCzrEeXLFoyOWEWzZdOAaIuSbZKawoWLA8HcsfVJz97mLwwF1W2rHPAoKDq_m2pV1Xm3-Y2SS_Wd_pjjvibmSQYoveJ6l3duYu2KFhPgwhtCLLC0KJsbyx611slLhTxrFSRFEnkqw2dvhn-JocrFkS3hyq2_vSNBfpAfes",
      skills: ["Sustainability", "GIS"],
      interests: ["Sustainability", "GIS"],
      buttonType: "message",
    },
    {
      id: 6,
      name: "Noah Patel",
      role: "Student, Mechanical Engineering",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBAL2amqp-8mTOJ4Y0LZ31plIHmAuRkacqmJA-4Zg448GIHncjBjwZjuMbOHqfb0HYvLQTmrabmcGirPodUFT-tffpmJxFiKnjTAaT8CqsTt1o38WJkxLsEQWlqk3VetxvpGttEWjm6I76SkdyrJtVvKRyV7gz5xYFH_KBiJVpFokiqrBZdlYlj0kjphFlIjegDDCQ6eIfW6V7Isoa3HzqH7IG_mKNDrqh-FHpUs21ObkIOctkwlyHMgg3PRsYr4c7benbBSndtkU0",
      skills: ["Robotics Club", "CAD"],
      buttonType: "connect",
      interests: ["Robotics Club", "CAD"],
    },
      ];
      dispatch(setMembers(mockProfiles));
    }
  }, [dispatch, profiles.length]);

  return (
    <div className="w-full bg-[#111814] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <header className="border-b border-white/10 px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 py-3 sticky top-0 bg-[#111814]/80 backdrop-blur-sm z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white">
            <svg
              className="size-6 text-[#17cf63]"
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
              CampusNexus
            </h2>
          </div>
          <div className="hidden md:flex flex-1 justify-end gap-8">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
            >
              Dashboard
            </button>
            <a
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              href="#events"
            >
              Events
            </a>
            <a
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              href="#mentoring"
            >
              Mentoring
            </a>
            <a className="text-[#17cf63] text-sm font-bold" href="#network">
              Network
            </a>
            <a
              className="text-white/80 hover:text-white text-sm font-medium transition-colors"
              href="#societies"
            >
              Societies
            </a>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors">
              <span className="material-symbols-outlined text-white">
                notifications
              </span>
              <div className="absolute top-2 right-2 size-2 bg-[#17cf63] rounded-full"></div>
            </button>
            <Avatar
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuATUMAiD-s_TXBoeMLvt0BjiSFPgWXNcK_j8shG5yPj0-FC_J-HXq0m_1Ug4FxW5EDTKqOKvXI-6HyGCPczz2hB3xqrY-dwkCtqtOJHyKqCkRSLbMQf7sOLx91OeQvcAroauVzgXtLUld1ROQIuMoikl-Dvj1PWMP7SSa_7gkT-xffz7JiUy2-qVrRVK3GCTYM04Y5txcVrH7uyoKvpW3Y434QBf7F0ZOLpwMdSJZAp0lQL17rzPRmWYi07wQHzU7Cc6LYpAg9ShuQ"
              size="10"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 py-8 flex justify-center">
        <div className="w-full max-w-[960px]">
          {/* Page Heading */}
          <div className="mb-8">
            <h1 className="text-white text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">
              Academic Network Directory
            </h1>
            <p className="text-white/60 text-base font-normal mt-2">
              Find and connect with students and faculty across campus.
            </p>
          </div>

          {/* Search Bar */}
          <div className="px-4 py-3 mb-6">
            <label className="flex flex-col w-full">
              <div className="flex w-full flex-1 items-stretch rounded-lg h-12 bg-[#1e241f]">
                <div className="text-white/60 flex items-center justify-center pl-4 rounded-l-lg">
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-white/60 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                  placeholder="Search by name, skill, or interest..."
                />
              </div>
            </label>
          </div>

          {/* Filter Chips */}
          <div className="flex gap-2 sm:gap-3 p-3 flex-wrap mb-6">
            <button className="flex h-8 items-center justify-center gap-x-2 rounded-lg bg-[#1e241f] hover:bg-[#29312b] transition-colors pl-3 pr-2">
              <p className="text-white text-sm font-medium">Department</p>
              <span className="material-symbols-outlined text-white/80 text-sm">
                arrow_drop_down
              </span>
            </button>
            <button className="flex h-8 items-center justify-center gap-x-2 rounded-lg bg-[#1e241f] hover:bg-[#29312b] transition-colors pl-3 pr-2">
              <p className="text-white text-sm font-medium">
                Academic Interests
              </p>
              <span className="material-symbols-outlined text-white/80 text-sm">
                arrow_drop_down
              </span>
            </button>
            <button className="flex h-8 items-center justify-center gap-x-2 rounded-lg bg-[#1e241f] hover:bg-[#29312b] transition-colors pl-3 pr-2">
              <p className="text-white text-sm font-medium">Societies</p>
              <span className="material-symbols-outlined text-white/80 text-sm">
                arrow_drop_down
              </span>
            </button>
            <button className="flex h-8 items-center justify-center gap-x-2 rounded-lg bg-[#1e241f] hover:bg-[#29312b] transition-colors pl-3 pr-2">
              <p className="text-white text-sm font-medium">Role</p>
              <span className="material-symbols-outlined text-white/80 text-sm">
                arrow_drop_down
              </span>
            </button>
          </div>

          {/* Section Header & Sorting */}
          <div className="flex justify-between items-center px-4 pb-2 pt-6 border-b border-white/10 mb-6">
            <h3 className="text-white text-lg font-bold">Directory Results</h3>
            <button className="flex items-center gap-1 text-white/80 hover:text-white transition-colors">
              <span className="text-sm">
                Sort by:{" "}
                {selectedSort.charAt(0).toUpperCase() + selectedSort.slice(1)}
              </span>
              <span className="material-symbols-outlined text-sm">
                expand_more
              </span>
            </button>
          </div>

          {/* Profile Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col gap-4 rounded-xl border border-white/10 bg-[#151a16] p-5 hover:border-[#17cf63]/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Avatar
                    src={profile.image}
                    size="16"
                  />
                  <div className="flex flex-col">
                    <p className="text-white font-bold text-lg">
                      {profile.name}
                    </p>
                    <p className="text-white/60 text-sm">{profile.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-medium bg-[#17cf63]/20 text-[#17cf63] px-2.5 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mt-2">
                  <button className="flex w-full items-center justify-center gap-2 rounded-lg h-9 px-3 bg-white/5 text-white/90 hover:bg-white/10 text-sm font-bold transition-colors">
                    <span className="material-symbols-outlined text-sm">
                      person
                    </span>
                    <span>View Profile</span>
                  </button>
                  {profile.buttonType === "message" && (
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg h-9 px-3 bg-[#17cf63] text-[#111814] hover:opacity-90 text-sm font-bold transition-opacity">
                      <span className="material-symbols-outlined text-sm">
                        send
                      </span>
                      <span>Message</span>
                    </button>
                  )}
                  {profile.buttonType === "connect" && (
                    <button className="flex w-full items-center justify-center gap-2 rounded-lg h-9 px-3 border border-[#17cf63] text-[#17cf63] hover:bg-[#17cf63]/10 text-sm font-bold transition-colors">
                      <span className="material-symbols-outlined text-sm">
                        person_add
                      </span>
                      <span>Connect</span>
                    </button>
                  )}
                  {profile.buttonType === "pending" && (
                    <button className="flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg h-9 px-3 bg-white/10 text-white/60 text-sm font-bold">
                      <span className="material-symbols-outlined text-sm">
                        hourglass_top
                      </span>
                      <span>Pending</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-2 p-8 mt-8">
            <button className="flex items-center justify-center size-9 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button className="flex items-center justify-center size-9 rounded-lg bg-[#17cf63] text-[#111814] font-bold text-sm">
              1
            </button>
            <button className="flex items-center justify-center size-9 rounded-lg hover:bg-white/10 text-white/60 hover:text-white text-sm">
              2
            </button>
            <button className="flex items-center justify-center size-9 rounded-lg hover:bg-white/10 text-white/60 hover:text-white text-sm">
              3
            </button>
            <span className="text-white/60">...</span>
            <button className="flex items-center justify-center size-9 rounded-lg hover:bg-white/10 text-white/60 hover:text-white text-sm">
              8
            </button>
            <button className="flex items-center justify-center size-9 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
