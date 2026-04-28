// src/components/Footer/Footer.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const savedTheme = window.localStorage.getItem("homeTheme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    const syncTheme = (event) => {
      if (event?.detail && typeof event.detail.isDark === "boolean") {
        setIsDark(event.detail.isDark);
        return;
      }

      const savedTheme = window.localStorage.getItem("homeTheme");
      setIsDark(savedTheme ? savedTheme === "dark" : true);
    };

    window.addEventListener("home-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);

    return () => {
      window.removeEventListener("home-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isDark ? "border-[#30363d] bg-[#0d1117]" : "border-[#DCE4EE] bg-[linear-gradient(180deg,#F8FAFC_0%,#EEF3F9_100%)]"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className={`flex items-center gap-3 transition-colors duration-300 ${isDark ? "text-[#e6edf3]" : "text-[#0F172A]"}`}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-300 ${
                  isDark
                    ? "border-[#30363d] bg-[#161b22] text-[#58a6ff]"
                    : "border-[#E2E8F0] bg-white text-[#1E40AF]"
                }`}
              >
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
              <div>
                <p className="text-base font-extrabold tracking-[-0.02em]">CampusNexus</p>
                <p className={`text-xs transition-colors duration-300 ${isDark ? "text-[#8b949e]" : "text-[#475569]"}`}>Your campus, connected.</p>
              </div>
            </div>
            <p className={`max-w-sm text-sm leading-relaxed transition-colors duration-300 ${isDark ? "text-[#8b949e]" : "text-[#475569]"}`}>
              A focused platform for students, mentors, and societies to connect, collaborate, and grow.
            </p>
          </div>

          <div className="space-y-3">
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${isDark ? "text-[#e6edf3]" : "text-[#0F172A]"}`}>Quick Links</p>
            <div className={`flex flex-col gap-2 text-sm transition-colors duration-300 ${isDark ? "text-[#8b949e]" : "text-[#475569]"}`}>
              <Link className={`transition-colors ${isDark ? "hover:text-[#e6edf3]" : "hover:text-[#1D4ED8]"}`} to="/about-us">
                About Us
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-[#e6edf3]" : "hover:text-[#1D4ED8]"}`} to="/events">
                Events
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-[#e6edf3]" : "hover:text-[#1D4ED8]"}`} to="/mentors">
                Mentors
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-[#e6edf3]" : "hover:text-[#1D4ED8]"}`} to="/societies">
                Societies
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${isDark ? "text-[#e6edf3]" : "text-[#0F172A]"}`}>Support</p>
            <div className={`flex flex-col gap-2 text-sm transition-colors duration-300 ${isDark ? "text-[#8b949e]" : "text-[#475569]"}`}>
              <Link className={`transition-colors ${isDark ? "hover:text-[#e6edf3]" : "hover:text-[#1D4ED8]"}`} to="/privacy">
                Privacy Policy
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-[#e6edf3]" : "hover:text-[#1D4ED8]"}`} to="/terms">
                Terms of Service
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-[#e6edf3]" : "hover:text-[#1D4ED8]"}`} to="/contact-us">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className={`mt-8 flex flex-col gap-4 border-t pt-6 text-sm sm:flex-row sm:items-center sm:justify-between transition-colors duration-300 ${isDark ? "border-[#30363d] text-[#8b949e]" : "border-[#DCE4EE] text-[#475569]"}`}>
          <p>© 2024 CampusNexus. All rights reserved.</p>
          <p>Built for students, mentors, and campus communities.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
