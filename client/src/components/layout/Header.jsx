import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const savedTheme = window.localStorage.getItem("homeTheme");
    return savedTheme ? savedTheme === "dark" : true;
  });
  const location = useLocation();
  const navigate = useNavigate();

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

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Events", path: "/events" },
    { label: "Mentors", path: "/mentors" },
    { label: "Members", path: "/members" },
    { label: "Societies", path: "/societies" },
    { label: "About Us", path: "/about-us" },
    { label: "Contact Us", path: "/contact-us" },
  ];

  const authButtons = [
    {
      label: "Log In",
      path: "/login",
      style: isDark
        ? "bg-[#161b22] hover:bg-[#21262d] border border-[#30363d]"
        : "bg-white hover:bg-[#F8FAFC] border border-[#D6DEE8] text-[#0F172A] shadow-sm",
    },
    {
      label: "Sign Up",
      path: "/signup",
      style: isDark
        ? "bg-green-600 hover:bg-green-700"
        : "bg-[#1D4ED8] hover:bg-[#1E40AF] text-white shadow-[0_10px_24px_rgba(29,78,216,0.18)]",
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isLoginPage = ["/login", "/signup"].includes(location.pathname);

  return (
    <header
      className={`sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300 ${
        isDark
          ? "border-[#30363d] bg-[#0d1117]/90"
          : "border-[#E2E8F0] bg-[#F7FAFC]/95"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div
          className={`flex cursor-pointer items-center gap-3 transition-colors duration-300 ${
            isDark ? "text-[#e6edf3]" : "text-[#1A202C]"
          }`}
          onClick={() => navigate("/")}
          aria-label="CampusNexus Home"
        >
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl border shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-colors duration-300 ${
              isDark
                ? "border-[#30363d] bg-[#161b22] text-[#58a6ff]"
                : "border-[#E2E8F0] bg-white text-[#1E40AF]"
            }`}
          >
            <Logo />
          </div>
          <div className="leading-tight">
            <h2 className="text-base font-extrabold tracking-tight sm:text-lg">CampusNexus</h2>
            <p
              className={`text-[11px] transition-colors duration-300 ${
                isDark ? "text-[#8b949e]" : "text-[#4A5568]"
              }`}
            >
              Learn. Connect. Grow.
            </p>
          </div>
        </div>

        {!isLoginPage && (
          <>
            <div className="hidden items-center gap-4 lg:flex">
              <nav
                className={`flex items-center gap-1 rounded-full border p-1 shadow-[0_8px_24px_rgba(0,0,0,0.2)] transition-colors duration-300 ${
                  isDark
                    ? "border-[#30363d] bg-[#161b22]"
                    : "border-[#E2E8F0] bg-white"
                }`}
              >
                {navLinks.map((link) => (
                  <NavLinkItem
                    key={link.label}
                    link={link}
                    isActive={isActive(link.path)}
                    isDark={isDark}
                  />
                ))}
              </nav>

              <div className="flex gap-2">
                {authButtons.map((btn) => (
                  <button
                    key={btn.label}
                    onClick={() => navigate(btn.path)}
                    className={`${btn.style} h-9 rounded-full px-4 text-xs font-bold transition-transform hover:-translate-y-0.5 ${isDark ? "text-white" : ""}`}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors lg:hidden ${
                isDark
                  ? "border-[#30363d] bg-[#161b22] text-white hover:bg-[#21262d]"
                  : "border-[#E2E8F0] bg-white text-[#1A202C] hover:bg-[#EDF2F7]"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              <span className="material-symbols-outlined text-2xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {!isLoginPage && mobileMenuOpen && (
        <div className="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8 lg:hidden">
          <div
            className={`mt-3 rounded-2xl border p-4 shadow-[0_20px_50px_rgba(0,0,0,0.35)] transition-colors duration-300 ${
              isDark
                ? "border-[#30363d] bg-[#161b22]"
                : "border-[#E2E8F0] bg-[#F7FAFC]"
            }`}
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLinkItem
                  key={link.label}
                  link={link}
                  isActive={isActive(link.path)}
                  isDark={isDark}
                  mobile
                  onClick={() => setMobileMenuOpen(false)}
                />
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              {authButtons.map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => {
                    navigate(btn.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`${btn.style} h-10 w-full rounded-xl px-4 text-xs font-bold ${isDark ? 'text-white' : 'text-[#0F172A]'}`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

// Logo Component
const Logo = () => (
  <svg
    fill="currentColor"
    viewBox="0 0 48 48"
    xmlns="http://www.w3.org/2000/svg"
    className="w-6 h-6"
  >
    <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
  </svg>
);

// NavLink Component
const NavLinkItem = ({ link, isActive, mobile, onClick, isDark }) => (
  <Link
    to={link.path}
    onClick={onClick}
    className={`rounded-full px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? isDark
          ? "bg-[#0d1117] text-white shadow-sm"
          : "bg-[#EDF2F7] text-[#1A202C] shadow-sm"
        : isDark
          ? "text-[#8b949e] hover:bg-[#21262d] hover:text-white"
          : "text-[#4A5568] hover:bg-[#EDF2F7] hover:text-[#1A202C]"
    } ${mobile ? "block w-full" : ""}`}
  >
    {link.label}
  </Link>
);

export default Header;
