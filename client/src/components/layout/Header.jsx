import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Events", path: "/events" },
    { label: "Mentors", path: "/mentors" },
    { label: "Members", path: "/members" },
    { label: "Societies", path: "/societies" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contactUs" },
    { label: "Dashboard", path: "/dashboard/dashboardindex" },
  ];

  const authButtons = [
    {
      label: "Log In",
      path: "/login",
      style: "bg-[#161b22] hover:bg-[#21262d] border border-[#30363d]",
    },
    {
      label: "Sign Up",
      path: "/signUp",
      style: "bg-green-600 hover:bg-green-700",
    },
  ];

  const isActive = (path) => location.pathname === path;
  const isLoginPage = ["/login", "/signIn"].includes(location.pathname);

  return (
    <header className="bg-[#0d1117] border-b border-[#161b22] px-4 sm:px-10 py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div
          className="flex items-center gap-4 text-[#e6edf3] cursor-pointer"
          onClick={() => navigate("/")}
          aria-label="CampusConnect Home"
        >
          <Logo />
          <h2 className="text-lg font-bold tracking-tight">CampusConnect</h2>
        </div>

        {!isLoginPage && (
          <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <NavLinkItem
                  key={link.label}
                  link={link}
                  isActive={isActive(link.path)}
                />
              ))}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex gap-2">
              {authButtons.map((btn) => (
                <button
                  key={btn.label}
                  onClick={() => navigate(btn.path)}
                  className={`${btn.style} text-white text-xs font-bold px-4 h-8 rounded-md`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Mobile Hamburger */}
            <button
              className="md:hidden text-white focus:outline-none"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="material-symbols-outlined text-3xl">
                {mobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu */}
      {!isLoginPage && mobileMenuOpen && (
        <div className="md:hidden mt-2 flex flex-col gap-3 bg-[#0d1117] px-4 py-3 border-t border-[#161b22]">
          {navLinks.map((link) => (
            <NavLinkItem
              key={link.label}
              link={link}
              isActive={isActive(link.path)}
              mobile
              onClick={() => setMobileMenuOpen(false)}
            />
          ))}
          <div className="flex gap-2 mt-2 flex-col">
            {authButtons.map((btn) => (
              <button
                key={btn.label}
                onClick={() => {
                  navigate(btn.path);
                  setMobileMenuOpen(false);
                }}
                className={`${btn.style} text-white text-xs font-bold px-3 h-8 rounded-md w-full`}
              >
                {btn.label}
              </button>
            ))}
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
const NavLinkItem = ({ link, isActive, mobile, onClick }) => (
  <Link
    to={link.path}
    onClick={onClick}
    className={`text-sm font-medium ${
      isActive
        ? "text-white font-bold border-b-2 border-green-500 md:border-b-2 md:border-green-500"
        : "text-[#8b949e] hover:text-white"
    } ${mobile ? "block w-full" : ""}`}
  >
    {link.label}
  </Link>
);

export default Header;
