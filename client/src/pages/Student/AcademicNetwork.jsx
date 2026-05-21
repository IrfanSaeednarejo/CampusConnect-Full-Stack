import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllMembers, setMembers } from "../../redux/slices/memberSlice";
import Avatar from "../../components/common/Avatar";
import Button from "../../components/common/Button";
import Pagination from "../../components/common/Pagination";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function AcademicNetwork() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSort, setSelectedSort] = useState("name");
  const profiles = useSelector(selectAllMembers);

  useEffect(() => {
    if (profiles.length === 0) {
      const mockProfiles = [
        { id: 1, name: "Dr. Evelyn Reed", role: "Professor, Computer Science", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAVusTyWqc7DI9AudhLe2pI0pZIOWvzb8CzyrHToin7EwbfbtUYdSzo0sam9KPaO07tvw3NVZ2BxCvm5-IQO-uScCFn_aQEAO0zMe_GbGVwEzn2q9XgfE3GEbXRfWjK4pGhFYa0DRxcfCMXcEiTOtiUEQiDTFQ5nH7osmBLtFZe8Hb5o7A8p4pE-pjSisPsDdkw1FdnuE6qJWkfcz8uTOh-BfP8_p_2EgOx2ANY8EDZI492k97RqvbzcKzmHSziogxIVtMxFnVwO4Y", skills: ["Machine Learning", "AI Ethics"], interests: ["Machine Learning", "AI Ethics"], buttonType: "message" },
        { id: 2, name: "Liam Chen", role: "Student, Business Analytics", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDpxGZ5n1NE2_J73JN_LSrjev-FpYakzvIIzjrkcmpytQOGxn2ceFJgTBvkTrTqH2gz2b4TbeGvQ1nC_fxrOPKdRl-7zTg1j2UNEQ_3C0dhSVGArOLDPIr3LlkG01sMtJiCtPVBdCDW62yucwruUF9coN5h5P5wsP2hbu7cTMsj8ywZsWQ5157Vyemdt1X2I5mfhGDdYkrclA0V9UwX3uF63sIV3VXB2xnmwgmnorjbM8ScMwfc_Mq_NK0f12zT4-NaskUlYDwKRGQ", skills: ["Data Visualization", "Finance Club"], interests: ["Data Visualization", "Finance Club"], buttonType: "connect" },
        { id: 3, name: "Aisha Khan", role: "Student, Graphic Design", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDCh25_NkUXpUHdBFiDXrfCciMDW5mSubLmfL8VBtcSZlfZEldd10ok57tOcW4gmGOmmcDvHyARIBsEsYHhDEvpR0dvOHibjSaYLu6K5QQi9hVkXbG4aWPyKiI_vzxEryduWttEWMQnvJGOz8zKJl5CzG9j0o8-PGoD52fphRJ_8EPVuuBYptaOcPftNKxuQ0PPeIcPrFKxOuaVackVesfprtYrRKXr2rRgdOJiUM_OHxyrYwf85WrObqyQ3lbKZP2y6-9LoQJtGMg", skills: ["UI/UX Design", "Art Society", "Webflow"], interests: ["UI/UX Design", "Art Society", "Webflow"], buttonType: "pending" },
        { id: 4, name: "Ben Carter", role: "Mentor, Software Engineering", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhCC5PBQI8wrKa1mKNaaNbWYgwigC7s6DvDH6wUMWZC8jhp3Urbe26o7992qKyOg2rDQ_sB3g6MukTIf7z4iC3HppKfRN0SG8Bl5GIF98aZQyzJUq_ToGQ_Jctl8YTVet9pifF0eGQVs4sIYCtb0E0A3IC1u0BWbnZQ60Buoxyi2ZDz4wivKRLzBpxxZ_f7H96mrcy2v8c6QdD_tDh1KAkoG0pFe_YTxHZyrbEV9OYfIrwN-hmNUXKuXfFQo74TivXr7omQROLSD8", skills: ["React", "Node.js"], interests: ["React", "Node.js"], buttonType: "connect" },
        { id: 5, name: "Olivia Martinez", role: "Student, Environmental Science", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCHgbUHBnQyTdROxnH_CTKu678wE9E__5KGwAIrAZLnCCY4k_H8toPmIwpTR_Svd1q8sXzNGC9BKtQZJEiCsf20KCCmuWGLH81z0xVgjsCzrEeXLFoyOWEWzZdOAaIuSbZKawoWLA8HcsfVJz97mLwwF1W2rHPAoKDq_m2pV1Xm3-Y2SS_Wd_pjjvibmSQYoveJ6l3duYu2KFhPgwhtCLLC0KJsbyx611slLhTxrFSRFEnkqw2dvhn-JocrFkS3hyq2_vSNBfpAfes", skills: ["Sustainability", "GIS"], interests: ["Sustainability", "GIS"], buttonType: "message" },
        { id: 6, name: "Noah Patel", role: "Student, Mechanical Engineering", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBAL2amqp-8mTOJ4Y0LZ31plIHmAuRkacqmJA-4Zg448GIHncjBjwZjuMbOHqfb0HYvLQTmrabmcGirPodUFT-tffpmJxFiKnjTAaT8CqsTt1o38WJkxLsEQWlqk3VetxvpGttEWjm6I76SkdyrJtVvKRyV7gz5xYFH_KBiJVpFokiqrBZdlYlj0kjphFlIjegDDCQ6eIfW6V7Isoa3HzqH7IG_mKNDrqh-FHpUs21ObkIOctkwlyHMgg3PRsYr4c7benbBSndtkU0", skills: ["Robotics Club", "CAD"], buttonType: "connect", interests: ["Robotics Club", "CAD"] },
      ];
      dispatch(setMembers(mockProfiles));
    }
  }, [dispatch, profiles.length]);

  return (
    <div className={`min-h-screen w-full ${isDark ? "bg-background-dark text-text-primary-dark" : "bg-slate-50 text-slate-900"}`}>
      <header className={`sticky top-0 z-50 border-b px-4 py-3 backdrop-blur-sm sm:px-8 md:px-16 lg:px-24 xl:px-40 ${isDark ? "border-border-dark bg-background-dark/90" : "border-slate-200 bg-white/90"}`}>
        <div className="flex items-center justify-between">
          <div className={`flex items-center gap-4 ${isDark ? "text-white" : "text-slate-900"}`}>
            <svg className="size-6 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
            </svg>
            <h2 className={`text-lg font-bold leading-tight tracking-[-0.015em] ${isDark ? "text-white" : "text-slate-900"}`}>CampusNexus</h2>
          </div>
          <div className="hidden flex-1 justify-end gap-8 md:flex">
            <button onClick={() => navigate("/student/dashboard")} className={`text-sm font-medium transition-colors ${isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"}`}>Dashboard</button>
            <a className={`text-sm font-medium transition-colors ${isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"}`} href="#events">Events</a>
            <a className={`text-sm font-medium transition-colors ${isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"}`} href="#mentoring">Mentoring</a>
            <a className="text-sm font-bold text-primary" href="#network">Network</a>
            <a className={`text-sm font-medium transition-colors ${isDark ? "text-white/80 hover:text-white" : "text-slate-600 hover:text-slate-900"}`} href="#societies">Societies</a>
          </div>
          <div className="flex items-center gap-2">
            <button className={`flex size-10 items-center justify-center rounded-full transition-colors ${isDark ? "hover:bg-white/10" : "hover:bg-slate-100"}`}>
              <span className={`material-symbols-outlined ${isDark ? "text-white" : "text-slate-900"}`}>notifications</span>
              <div className="absolute right-2 top-2 size-2 rounded-full bg-primary"></div>
            </button>
            <Avatar src="https://lh3.googleusercontent.com/aida-public/AB6AXuATUMAiD-s_TXBoeMLvt0BjiSFPgWXNcK_j8shG5yPj0-FC_J-HXq0m_1Ug4FxW5EDTKqOKvXI-6HyGCPczz2hB3xqrY-dwkCtqtOJHyKqCkRSLbMQf7sOLx91OeQvcAroauVzgXtLUld1ROQIuMoikl-Dvj1PWMP7SSa_7gkT-xffz7JiUy2-qVrRVK3GCTYM04Y5txcVrH7uyoKvpW3Y434QBf7F0ZOLpwMdSJZAp0lQL17rzPRmWYi07wQHzU7Cc6LYpAg9ShuQ" size="10" />
          </div>
        </div>
      </header>

      <main className="flex justify-center px-4 py-8 sm:px-8 md:px-16 lg:px-24 xl:px-40">
        <div className="w-full max-w-[960px]">
          <div className="mb-8">
            <h1 className={`text-3xl font-black leading-tight tracking-[-0.033em] sm:text-4xl ${isDark ? "text-white" : "text-slate-900"}`}>Academic Network Directory</h1>
            <p className={`mt-2 text-base font-normal ${isDark ? "text-white/60" : "text-slate-500"}`}>Find and connect with students and faculty across campus.</p>
          </div>

          <div className="mb-6 px-4 py-3">
            <label className="flex w-full flex-col">
              <div className={`flex h-12 w-full flex-1 items-stretch rounded-xl ${isDark ? "border border-border-dark bg-surface-dark" : "border border-slate-200 bg-white shadow-sm"}`}>
                <div className={`flex items-center justify-center rounded-l-xl pl-4 ${isDark ? "text-text-secondary-dark" : "text-slate-400"}`}>
                  <span className="material-symbols-outlined">search</span>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`form-input flex h-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl rounded-l-none border-none bg-transparent px-4 pl-2 text-base font-normal leading-normal focus:outline-0 focus:ring-0 ${isDark ? "text-text-primary-dark placeholder:text-text-secondary-dark" : "text-slate-900 placeholder:text-slate-400"}`}
                  placeholder="Search by name, skill, or interest..."
                />
              </div>
            </label>
          </div>

          <div className="mb-6 flex flex-wrap gap-2 p-3 sm:gap-3">
            {["Department", "Academic Interests", "Societies", "Role"].map((label) => (
              <button key={label} className={`flex h-9 items-center justify-center gap-x-2 rounded-xl px-3 transition-colors ${isDark ? "border border-border-dark bg-surface-dark hover:bg-[#21262d]" : "border border-slate-200 bg-white hover:bg-slate-50"}`}>
                <p className={`text-sm font-medium ${isDark ? "text-text-primary-dark" : "text-slate-700"}`}>{label}</p>
                <span className={`material-symbols-outlined text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>arrow_drop_down</span>
              </button>
            ))}
          </div>

          <div className={`mb-6 flex items-center justify-between border-b px-4 pb-2 pt-6 ${isDark ? "border-border-dark" : "border-slate-200"}`}>
            <h3 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Directory Results</h3>
            <button className={`flex items-center gap-1 transition-colors ${isDark ? "text-white/80 hover:text-white" : "text-slate-500 hover:text-slate-900"}`}>
              <span className="text-sm">Sort by: {selectedSort.charAt(0).toUpperCase() + selectedSort.slice(1)}</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <div key={profile.id} className={`flex flex-col gap-4 rounded-2xl border p-5 transition-colors ${isDark ? "border-border-dark bg-surface-dark hover:border-primary/60" : "border-slate-200 bg-white shadow-sm hover:border-primary/40"}`}>
                <div className="flex items-center gap-4">
                  <Avatar src={profile.image} size="16" />
                  <div className="flex flex-col">
                    <p className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{profile.name}</p>
                    <p className={`text-sm ${isDark ? "text-text-secondary-dark" : "text-slate-500"}`}>{profile.role}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span key={skill} className={`rounded-full px-2.5 py-1 text-xs font-medium ${isDark ? "bg-primary/15 text-green-300" : "bg-green-50 text-green-700"}`}>{skill}</span>
                  ))}
                </div>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <Button variant="secondary" className="w-full min-w-0 flex-1">
                    <span className="material-symbols-outlined text-sm">person</span>
                    <span>View Profile</span>
                  </Button>
                  {profile.buttonType === "message" && (
                    <Button variant="primary" className="w-full min-w-0 flex-1">
                      <span className="material-symbols-outlined text-sm">send</span>
                      <span>Message</span>
                    </Button>
                  )}
                  {profile.buttonType === "connect" && (
                    <Button variant="success" className="w-full min-w-0 flex-1">
                      <span className="material-symbols-outlined text-sm">person_add</span>
                      <span>Connect</span>
                    </Button>
                  )}
                  {profile.buttonType === "pending" && (
                    <Button variant="ghost" className="w-full min-w-0 flex-1" disabled>
                      <span className="material-symbols-outlined text-sm">hourglass_top</span>
                      <span>Pending</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-8">
            <Pagination currentPage={1} totalPages={8} onPageChange={() => {}} />
          </div>
        </div>
      </main>
    </div>
  );
}
