// src/components/Footer/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import useHomeTheme from "../../hooks/useHomeTheme";

const Footer = () => {
  const isDark = useHomeTheme();

  return (
    <footer
      className={`border-t transition-colors duration-300 ${
        isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-surface-light"
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="space-y-3">
            <div className={`flex items-center gap-3 transition-colors duration-300 ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-300 ${
                  isDark
                    ? "border-border-dark bg-surface-dark text-primary"
                    : "border-border-light bg-surface-light text-primary"
                }`}
              >
                <span className="material-symbols-outlined text-xl">school</span>
              </div>
              <div>
                <p className="text-base font-semibold tracking-[-0.02em]">CampusNexus</p>
                <p className={`text-xs transition-colors duration-300 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>Your campus, connected.</p>
              </div>
            </div>
            <p className={`max-w-sm text-sm leading-relaxed transition-colors duration-300 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              A focused platform for students, mentors, and societies to connect, collaborate, and grow.
            </p>
          </div>

          <div className="space-y-3">
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>Quick Links</p>
            <div className={`flex flex-col gap-2 text-sm transition-colors duration-300 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              <Link className={`transition-colors ${isDark ? "hover:text-text-primary-dark" : "hover:text-primary"}`} to="/about-us">
                About Us
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-text-primary-dark" : "hover:text-primary"}`} to="/events">
                Events
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-text-primary-dark" : "hover:text-primary"}`} to="/mentors">
                Mentors
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-text-primary-dark" : "hover:text-primary"}`} to="/societies">
                Societies
              </Link>
            </div>
          </div>

          <div className="space-y-3">
            <p className={`text-sm font-semibold uppercase tracking-[0.16em] transition-colors duration-300 ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>Support</p>
            <div className={`flex flex-col gap-2 text-sm transition-colors duration-300 ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              <Link className={`transition-colors ${isDark ? "hover:text-text-primary-dark" : "hover:text-primary"}`} to="/privacy">
                Privacy Policy
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-text-primary-dark" : "hover:text-primary"}`} to="/terms">
                Terms of Service
              </Link>
              <Link className={`transition-colors ${isDark ? "hover:text-text-primary-dark" : "hover:text-primary"}`} to="/contact-us">
                Contact Us
              </Link>
            </div>
          </div>
        </div>

        <div className={`mt-8 flex flex-col gap-4 border-t pt-6 text-sm transition-colors duration-300 sm:flex-row sm:items-center sm:justify-between ${isDark ? "border-border-dark text-text-secondary-dark" : "border-border-light text-text-secondary-light"}`}>
          <p>© 2024 CampusNexus. All rights reserved.</p>
          <p>Built for students, mentors, and campus communities.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
