// src/pages/Misc/TermsOfService.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

export default function TermsOfService() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Mentors", path: "/mentors" },
    { label: "Societies", path: "/societies" },
    { label: "Events", path: "/events" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="font-display bg-[#0d1117] min-h-screen flex flex-col relative overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background-dark border-b border-white/10 backdrop-blur-sm px-4 sm:px-10 py-3">
        <div className="flex w-full max-w-7xl mx-auto items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4 text-white">
            <svg
              className="h-6 w-6"
              fill="currentColor"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor" />
            </svg>
            <h2 className="text-lg font-bold tracking-tight">CampusConnect</h2>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`text-sm font-medium ${
                  isActive(link.path)
                    ? "text-white border-b-2 border-green-500"
                    : "text-[#c9d1d9] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-sm h-9 px-4 rounded-lg">
              Download PDF
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="md:hidden text-white text-3xl focus:outline-none"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden flex flex-col gap-3 mt-2 px-4 py-3 bg-background-dark border-t border-white/10">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-medium ${
                  isActive(link.path)
                    ? "text-white font-bold"
                    : "text-[#c9d1d9] hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <button className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-sm h-9 px-4 rounded-lg mt-2 w-full">
              Download PDF
            </button>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex flex-1 justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex w-full max-w-4xl flex-col">
          {/* Heading */}
          <div className="flex flex-col gap-3 p-4">
            <h1 className="text-4xl font-black tracking-tight text-white">
              Terms of Service
            </h1>
            <p className="text-[#8b949e] text-base">
              Please read our terms and conditions before using CampusConnect.
            </p>
            <p className="text-[#8b949e] text-sm pt-1 border-b border-white/10 pb-3">
              Last updated: October 26, 2023
            </p>
          </div>

          {/* Sections */}
          <div className="space-y-8 pt-8">
            <Section
              title="1. Introduction"
              content="Welcome to CampusConnect. These Terms of Service govern your use of our website and services. By accessing or using the service, you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the service."
            />
            <Section
              title="2. User Responsibilities"
              content="You are responsible for your use of the CampusConnect services and for any content you provide, including compliance with applicable laws."
              list={[
                "Provide accurate information when creating your account.",
                "Safeguard your account and password and not share it with others.",
                "Use the services in a professional and respectful manner.",
                "Not engage in any activity that is illegal, harmful, or fraudulent.",
              ]}
            />
            <Section
              title="3. Community Guidelines"
              content="Our community is built on trust and respect. Prohibited conduct includes:"
              list={[
                "Harassment, bullying, or discrimination of any kind.",
                "Posting spam or unsolicited advertising.",
                "Sharing content that infringes on intellectual property rights.",
                "Impersonating another person or entity.",
              ]}
            />
            <Section
              title="4. Intellectual Property"
              content="By submitting content, you grant CampusConnect a worldwide, non-exclusive, royalty-free license to use, copy, and distribute such content."
            />
            <Section
              title="5. Account Termination"
              content="We may suspend or terminate your account at any time for violations or risks, with reasonable notification."
            />
            <Section
              title="6. Disclaimers and Limitation of Liability"
              content="Services are provided 'AS IS' without warranties. CampusConnect is not liable for any indirect or consequential damages."
            />
            <Section
              title="7. Contact Information"
              content={
                <span>
                  Contact us at{" "}
                  <a
                    className="text-blue-400 hover:underline"
                    href="mailto:support@campusconnect.com"
                  >
                    support@campusconnect.com
                  </a>
                  .
                </span>
              }
            />
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="sticky bottom-0 flex justify-end-safe border-t border-white/10 bg-background-dark/80 px-4 py-4 backdrop-blur-sm sm:px-10">
        <button className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-sm h-10 px-5 rounded-lg">
          Accept Terms
        </button>
      </footer>
    </div>
  );
}

// Section component
function Section({ title, content, list }) {
  return (
    <div>
      <h2 className="text-[#c9d1d9] text-2xl font-bold tracking-tight px-4 pt-5 pb-3">
        {title}
      </h2>
      <p className="text-[#c9d1d9] text-base px-4 pt-1 pb-3">{content}</p>
      {list && (
        <ul className="list-disc pl-10 space-y-2 text-[#c9d1d9]">
          {list.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
