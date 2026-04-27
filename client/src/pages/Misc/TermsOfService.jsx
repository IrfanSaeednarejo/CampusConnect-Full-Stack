// src/pages/Misc/TermsOfService.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageContent from "../../components/common/PageContent";
import LegalIntro from "../../components/misc/LegalIntro";
import LegalSection from "../../components/misc/LegalSection";

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
            <h2 className="text-lg font-bold tracking-tight">CampusNexus</h2>
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
      <PageContent maxWidth="max-w-4xl" className="py-8">
        {/* Heading */}
        <LegalIntro
          title="Terms of Service"
          subtitle="Please read our terms and conditions before using CampusNexus."
          meta="Last updated: October 26, 2023"
          className="p-4"
          titleClassName="text-white"
          subtitleClassName="text-[#8b949e]"
          metaClassName="text-[#8b949e] pt-1 border-b border-white/10 pb-3"
        />

        {/* Sections */}
        <div className="space-y-8 pt-8">
          <LegalSection
            title="1. Introduction"
            content="Welcome to CampusNexus. These Terms of Service govern your use of our website and services. By accessing or using the service, you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the service."
            titleClassName="text-[#c9d1d9] text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-[#c9d1d9] text-base px-4 pt-1 pb-3"
          />
          <LegalSection
            title="2. User Responsibilities"
            content="You are responsible for your use of the CampusNexus services and for any content you provide, including compliance with applicable laws."
            list={[
              "Provide accurate information when creating your account.",
              "Safeguard your account and password and not share it with others.",
              "Use the services in a professional and respectful manner.",
              "Not engage in any activity that is illegal, harmful, or fraudulent.",
            ]}
            titleClassName="text-[#c9d1d9] text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-[#c9d1d9] text-base px-4 pt-1 pb-3"
            listClassName="list-disc pl-10 space-y-2 text-[#c9d1d9]"
          />
          <LegalSection
            title="3. Community Guidelines"
            content="Our community is built on trust and respect. Prohibited conduct includes:"
            list={[
              "Harassment, bullying, or discrimination of any kind.",
              "Posting spam or unsolicited advertising.",
              "Sharing content that infringes on intellectual property rights.",
              "Impersonating another person or entity.",
            ]}
            titleClassName="text-[#c9d1d9] text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-[#c9d1d9] text-base px-4 pt-1 pb-3"
            listClassName="list-disc pl-10 space-y-2 text-[#c9d1d9]"
          />
          <LegalSection
            title="4. Intellectual Property"
            content="By submitting content, you grant CampusNexus a worldwide, non-exclusive, royalty-free license to use, copy, and distribute such content."
            titleClassName="text-[#c9d1d9] text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-[#c9d1d9] text-base px-4 pt-1 pb-3"
          />
          <LegalSection
            title="5. Account Termination"
            content="We may suspend or terminate your account at any time for violations or risks, with reasonable notification."
            titleClassName="text-[#c9d1d9] text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-[#c9d1d9] text-base px-4 pt-1 pb-3"
          />
          <LegalSection
            title="6. Disclaimers and Limitation of Liability"
            content="Services are provided 'AS IS' without warranties. CampusNexus is not liable for any indirect or consequential damages."
            titleClassName="text-[#c9d1d9] text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-[#c9d1d9] text-base px-4 pt-1 pb-3"
          />
          <LegalSection
            title="7. Contact Information"
            content={
              <span>
                Contact us at{" "}
                <a
                  className="text-blue-400 hover:underline"
                  href="mailto:support@campusnexus.com"
                >
                  support@campusnexus.com
                </a>
                .
              </span>
            }
            titleClassName="text-[#c9d1d9] text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-[#c9d1d9] text-base px-4 pt-1 pb-3"
          />
        </div>
      </PageContent>

      {/* Footer CTA */}
      <footer className="sticky bottom-0 flex justify-end-safe border-t border-white/10 bg-background-dark/80 px-4 py-4 backdrop-blur-sm sm:px-10">
        <button className="bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-sm h-10 px-5 rounded-lg">
          Accept Terms
        </button>
      </footer>
    </div>
  );
}
