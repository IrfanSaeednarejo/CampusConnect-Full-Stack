import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getDashboardRoute } from "../utils/authValidator";
import NotificationDisplay from "./common/NotificationDisplay.jsx";
import MobileBottomNav from "./layout/MobileBottomNav.jsx";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, role, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinks = [
    { to: "/events", label: "Events" },
    { to: "/mentors", label: "Mentors" },
    { to: "/members", label: "Members" },
    { to: "/societies", label: "Societies" },
    { to: "/about-us", label: "About Us" },
    { to: "/contact-us", label: "Contact Us" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b border-solid border-border bg-background/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between whitespace-nowrap px-4 sm:px-6 lg:px-8 py-3">
          <Link
            to="/"
            className="flex items-center gap-3 text-text-primary hover:text-text-primary shrink-0"
          >
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-[#4F46E5]/20">
              <svg
                className="w-4 h-4"
                fill="white"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="white" />
              </svg>
            </div>
            <h2 className="text-text-primary text-lg font-bold leading-tight tracking-[-0.015em]">
              CampusConnect
            </h2>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 ml-8">
            <nav className="flex items-center gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`text-sm font-medium leading-normal transition-colors relative py-1 ${isActive(link.to)
                    ? "text-primary font-bold after:absolute after:bottom-[-16px] after:left-0 after:right-0 after:h-[3px] after:bg-primary after:rounded-t-full"
                    : "text-text-secondary hover:text-text-primary"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="h-6 w-[1px] bg-[#C7D2FE] mx-1"></div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => {
                const html = document.documentElement;
                html.classList.toggle("dark");
                localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
              }}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              title="Toggle Dark Mode"
            >
              <span className="material-symbols-outlined text-[18px]">dark_mode</span>
            </button>

            <div className="h-6 w-[1px] bg-[#C7D2FE] mx-1"></div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate(getDashboardRoute(role))}
                  className="flex items-center gap-2 cursor-pointer rounded-lg h-9 px-4 bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-[#4F46E5]/10"
                >
                  <span className="material-symbols-outlined text-[18px]">dashboard</span>
                  <span className="truncate">Dashboard</span>
                </button>
                <button
                  onClick={() => navigate("/profile/view")}
                  className="flex items-center gap-2 cursor-pointer rounded-lg h-9 px-3 bg-surface text-text-primary text-xs font-bold border border-border hover:bg-surface-hover transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-white">
                    {(user?.name || "U")[0].toUpperCase()}
                  </div>
                  <span className="truncate max-w-[100px]">
                    {user?.name || "Profile"}
                  </span>
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center cursor-pointer rounded-lg h-9 px-3 text-[#DC2626] text-xs font-bold border border-border hover:bg-surface-hover transition-colors"
                >
                  <span className="truncate">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => navigate("/login")}
                  className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-[#4F46E5]/10"
                >
                  Log In
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="flex items-center justify-center rounded-lg h-9 px-4 bg-primary text-white text-xs font-bold hover:bg-primary-hover transition-colors shadow-lg shadow-[#4F46E5]/10"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="md:hidden flex items-center gap-2">
            {/* Mobile Dark Mode Toggle */}
            <button
              onClick={() => {
                const html = document.documentElement;
                html.classList.toggle("dark");
                localStorage.setItem("theme", html.classList.contains("dark") ? "dark" : "light");
              }}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover transition-colors"
              title="Toggle Dark Mode"
            >
              <span className="material-symbols-outlined text-[20px]">dark_mode</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-text-primary hover:bg-surface-hover transition-colors"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined text-[24px]">menu</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-background/60 backdrop-blur-sm transition-opacity animate-fadeIn"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 h-full bg-background border-l border-border shadow-2xl animate-slideInRight flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border bg-surface/50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="text-text-primary font-bold text-xs uppercase">CC</span>
                </div>
                <span className="font-bold text-text-primary">Menu</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#C7D2FE] transition-colors"
              >
                <span className="material-symbols-outlined text-[20px] text-text-secondary">close</span>
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive(link.to)
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-[inset_0_0_20px_rgba(35,134,54,0.05)]"
                    : "text-text-primary hover:bg-surface hover:translate-x-1"
                    }`}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {link.label === "Events" ? "event" :
                      link.label === "Mentors" ? "groups" :
                        link.label === "Members" ? "person_search" :
                          link.label === "Societies" ? "diversity_3" : "info"}
                  </span>
                  {link.label}
                </Link>
              ))}

              <div className="py-4 px-2">
                <div className="h-[1px] bg-[#C7D2FE] w-full"></div>
              </div>

              {isAuthenticated ? (
                <div className="space-y-3 px-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-[#4F46E5]/20">
                      {(user?.name || "U")[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold text-text-primary truncate">{user?.name}</span>
                      <span className="text-[10px] text-text-secondary uppercase tracking-wider">{role}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate(getDashboardRoute(role)); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary text-white text-sm font-bold transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="material-symbols-outlined text-[20px]">dashboard</span>
                    Dashboard
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate("/profile/view"); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-text-primary border border-border hover:bg-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">person</span>
                    Profile Settings
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[#DC2626] border border-[#DC2626]/20 hover:bg-[#DC2626]/5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">logout</span>
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-3 px-2 mt-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate("/login"); }}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-all hover:scale-[1.02] shadow-lg shadow-[#4F46E5]/10"
                  >
                    Log In
                  </button>
                  <button
                    onClick={() => { setMobileMenuOpen(false); navigate("/signup"); }}
                    className="w-full py-3 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-hover transition-all hover:scale-[1.02] shadow-lg shadow-[#4F46E5]/10"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </nav>

            <div className="p-4 border-t border-border bg-surface/30">
              <p className="text-[10px] text-text-secondary text-center">
                CampusConnect v1.0 • {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        <div className="page-enter">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Nav (student pages) */}
      {isAuthenticated && <MobileBottomNav />}

      {/* Footer */}
      <footer className="flex items-center justify-center px-5 py-5 text-center border-t border-solid border-background bg-background lg:pb-5 pb-20">
        <p className="text-text-secondary text-xs font-normal leading-normal">
          © {new Date().getFullYear()} CampusConnect. All rights reserved. |
          <Link className="hover:text-text-primary ml-1" to="/privacy">
            Privacy Policy
          </Link>{" "}
          |
          <Link className="hover:text-text-primary ml-1" to="/terms">
            Terms of Service
          </Link>{" "}
          |
          <Link className="hover:text-text-primary ml-1" to="/contact-us">
            Contact Us
          </Link>
        </p>
      </footer>
    </div>
  );
}
