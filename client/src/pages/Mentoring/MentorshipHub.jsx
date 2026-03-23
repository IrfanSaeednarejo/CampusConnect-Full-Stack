import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllMentors, setMentors } from "../../redux/slices/mentoringSlice";
import Avatar from "../../components/common/Avatar";

export default function MentorshipHub() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mentors = useSelector(selectAllMentors);
  
  const [searchValue, setSearchValue] = useState("");
  const [userRole] = useState("student"); // Assuming student accessing mentorship hub

  useEffect(() => {
    if (mentors.length === 0) {
      dispatch(setMentors([
        {
          id: 1,
          name: "Dr. Evelyn Reed",
          title: "PhD in Machine Learning",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuA0jTMkVZrHrZTVmla4S4Je5c1D36iLLgtz5zB_oZrMcSJbuNexEisrvhdc-NMzmPBIa7YxLyXuCuyYIX6afgK26REr07GOIgtlWbvXQEBDFOkDEf6y7ay5EX9vStNbglIRnSDaNlE5sb1cDVFk0k-s8S_ZBpv3x5kDjuzUdCrCdZzCeCHwFaF1iWAc6nGD6f7KZNT4FSU6gJZtUzrM8VmaGMg_txG_BcWS1kfGr9qfhEKDxs-qmTPWTH-lYRZdpswsDEVNysWfygI",
          skills: ["AI", "Python", "Research"],
          rating: 4.9,
          reviews: 32,
          availability: "Weekdays",
        },
        {
          id: 2,
          name: "Ben Carter",
          title: "Senior Software Engineer",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBE6tGmIelYR9Lgm-1pwjDVUA6-iB_nfG9VMQ-ziaxjkGxBhDazaCIJClQxvs0cIBqjYNIRgbAcDinkwDssSVNFnTKkpv2Wt6nXs24NWZVgE3q588PfVxEvcSE1g7ur4WMA43VNQVxcmMW9SI37Y9u6C8fz27mk9Iuo2hAbDp4jcrnrLB3f-UNr4_qhf5m0LJj6BbvR9oct4apHAS9DP7jDXJt2LJxsj5gOnJSb6OXZshL1SKL3_2RWaTcGGRlp9fSbU17T9l7-5Ek",
          skills: ["JavaScript", "React", "Node.js"],
          rating: 5.0,
          reviews: 45,
          availability: "Weekends",
        },
        {
          id: 3,
          name: "Dr. Anya Sharma",
          title: "Professor of Economics",
          image:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD-xTMQV6m4x9u1aHS5QXnuoSyrcNcGtWqZyoqLVAtEs6PjGobk3G90rW-RFKGaMELavxqw3fzNVLNTPojJGzLJJ8RGxgrDUQAX2FArL_DAVd8n0yDsqIs9rHzUEHj0m8j_TtncwNtkZZVuao8mMa_IH87XxSjAUiLrMesI0trc8lLd-qaBRGQZhOj8_t8Z31SptB2XL1Wutq9Jcfmlr_7rsHb03YDxy-e9hcZZ7Ro2Hi_LicZHT1WfmHCQ5n6xIuruddxq52WuUp4",
          skills: ["Finance", "Academia", "Policy"],
          rating: 4.8,
          reviews: 21,
          availability: "Flexible",
        },
      ]));
    }
  }, [dispatch, mentors.length]);

  return (
    <div className="flex min-h-screen w-full bg-[#111814] font-display">
      {/* SideNavBar */}
      <aside className="flex flex-col w-64 bg-[#0d1117] border-r border-[#29382f]/50">
        <div className="flex h-full flex-col justify-between p-4">
          <div className="flex flex-col gap-4">
            {/* User Profile */}
            <div className="flex gap-3 items-center">
              <Avatar
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDS_wVcR1j0zxZQkBJV3m_tWULfz0ufkbTlibF-MURmj-V_JozdK87VXAJ78LMnmGgjnKBlBKUcG9Av9ZFzwo-pu9I3Y346QtWJn4q-PuJyHSt3xkWHW5L69TIV4FJHfIFVtwBGMUPoPcrp5fK18aOwKcQoyetgJXKc-JyYKSYbsixbHzmCGVHz1IlQ84tCb-tDmTK5TO6aQWsYb7cXe1TU6Pg_Q9_WZdQoLQD5vvp7pI2s3lDOWuGJxvtNmqQySAGHR6K2ApYHK-0"
                size="10"
              />
              <div className="flex flex-col">
                <h1 className="text-white text-base font-medium leading-normal">
                  Alex Johnson
                </h1>
                <p className="text-[#9db8a9] text-sm font-normal leading-normal">
                  Computer Science
                </p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2 mt-4">
              <a
                href="/"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-[#29382f] transition-colors"
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  home
                </span>
                <p className="text-white text-sm font-medium leading-normal">
                  Home
                </p>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg bg-[#29382f]"
              >
                <span
                  className="material-symbols-outlined text-white text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  group
                </span>
                <p className="text-white text-sm font-medium leading-normal">
                  Mentorship
                </p>
              </a>
              <a
                href="/events"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-[#29382f] transition-colors"
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  event
                </span>
                <p className="text-white text-sm font-medium leading-normal">
                  Events
                </p>
              </a>
            </nav>
          </div>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-4">
            <button
              onClick={() => navigate("/mentor-registration")}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-[#17cf63] text-[#0d1117] text-sm font-bold leading-normal tracking-[0.015em] hover:bg-[#17cf63]/90 transition-colors"
            >
              <span className="truncate">Become a Mentor</span>
            </button>
            <div className="flex flex-col gap-1 border-t border-[#29382f]/50 pt-4">
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-[#29382f] transition-colors"
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  settings
                </span>
                <p className="text-white text-sm font-medium leading-normal">
                  Settings
                </p>
              </a>
              <a
                href="#"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/70 hover:bg-[#29382f] transition-colors"
              >
                <span className="material-symbols-outlined text-white text-2xl">
                  logout
                </span>
                <p className="text-white text-sm font-medium leading-normal">
                  Log Out
                </p>
              </a>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Page Heading */}
          <div className="flex flex-wrap justify-between gap-3 mb-6">
            <div className="flex min-w-72 flex-col gap-3">
              <p className="text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                Mentorship Hub
              </p>
              <p className="text-[#9db8a9] text-base font-normal leading-normal">
                Find and connect with mentors to guide your academic and
                professional journey.
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4 mb-6">
            {/* Search Bar */}
            <div className="flex-1">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
                  <div className="text-[#9db8a9] flex border-none bg-[#29382f] items-center justify-center pl-4 rounded-l-lg border-r-0">
                    <span className="material-symbols-outlined">search</span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-r-lg text-white focus:outline-0 focus:ring-2 focus:ring-[#17cf63]/50 border-none bg-[#29382f] h-full placeholder:text-[#9db8a9] px-4 text-base font-normal leading-normal"
                    placeholder="Search by name, skill, or department..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
              </label>
            </div>

            {/* Filter Chips */}
            <div className="flex gap-3">
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#29382f] pl-4 pr-2 hover:bg-[#29382f]/80 transition-colors">
                <p className="text-white text-sm font-medium leading-normal">
                  Academic Field
                </p>
                <span className="material-symbols-outlined text-white text-xl">
                  arrow_drop_down
                </span>
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#29382f] pl-4 pr-2 hover:bg-[#29382f]/80 transition-colors">
                <p className="text-white text-sm font-medium leading-normal">
                  Skills
                </p>
                <span className="material-symbols-outlined text-white text-xl">
                  arrow_drop_down
                </span>
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#29382f] pl-4 pr-2 hover:bg-[#29382f]/80 transition-colors">
                <p className="text-white text-sm font-medium leading-normal">
                  Availability
                </p>
                <span className="material-symbols-outlined text-white text-xl">
                  arrow_drop_down
                </span>
              </button>
              <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg bg-[#29382f] pl-4 pr-2 hover:bg-[#29382f]/80 transition-colors">
                <p className="text-white text-sm font-medium leading-normal">
                  Language
                </p>
                <span className="material-symbols-outlined text-white text-xl">
                  arrow_drop_down
                </span>
              </button>
            </div>
          </div>

          {/* Section Header */}
          <h2 className="text-white text-[22px] font-bold leading-tight tracking-[-0.015em] mb-4 mt-10">
            Available Mentors
          </h2>

          {/* Mentor Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-[#1c241f] rounded-xl border border-[#29382f]/50 p-6 flex flex-col gap-4 hover:border-[#17cf63]/40 transition-colors"
              >
                {/* Header */}
                <div className="flex items-center gap-4">
                  <img
                    className="size-16 rounded-full object-cover"
                    src={mentor.image}
                    alt={mentor.name}
                  />
                  <div className="flex flex-col">
                    <h3 className="text-white font-bold text-lg">
                      {mentor.name}
                    </h3>
                    <p className="text-[#9db8a9] text-sm">{mentor.title}</p>
                  </div>
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill) => (
                    <span
                      key={skill}
                      className="bg-[#29382f] text-[#17cf63] text-xs font-semibold px-2.5 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-2 text-[#9db8a9] mt-2">
                  <div className="flex text-[#17cf63]">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className="material-symbols-outlined text-lg"
                        style={{
                          fontVariationSettings:
                            i < Math.floor(mentor.rating)
                              ? "'FILL' 1"
                              : "'FILL' 0",
                        }}
                      >
                        {i < Math.floor(mentor.rating)
                          ? "star"
                          : i === Math.floor(mentor.rating) &&
                              mentor.rating % 1 !== 0
                            ? "star_half"
                            : "star"}
                      </span>
                    ))}
                  </div>
                  <span className="text-sm">
                    {mentor.rating} ({mentor.reviews} reviews)
                  </span>
                </div>

                {/* Button */}
                <button
                  onClick={() => navigate(`/mentor-profile/${mentor.id}`)}
                  className="mt-4 w-full text-center bg-[#17cf63]/20 text-[#17cf63] font-bold py-2 px-4 rounded-lg hover:bg-[#17cf63]/30 transition-colors"
                >
                  View Profile
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
