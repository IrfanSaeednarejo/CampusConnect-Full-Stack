// src/pages/Misc/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

// Placeholder HeroSection
const HeroSection = () => (
  <section className="flex flex-col gap-2 text-center py-10">
    <h1 className="text-4xl md:text-5xl font-bold text-[#e6edf3]">
      About CampusConnect
    </h1>
    <p className="text-[#8b949e] text-base md:text-lg max-w-2xl mx-auto">
      Connecting students, mentors, and societies to create a vibrant campus
      ecosystem.
    </p>
  </section>
);

// Placeholder TeamMember
const TeamMember = ({ name, role, description, image }) => (
  <div className="flex flex-col items-center gap-2 text-center bg-[#0d1117] p-4 rounded-lg border border-[#30363d]">
    <img
      src={image}
      alt={name}
      className="w-24 h-24 rounded-full object-cover"
    />
    <h3 className="text-[#e6edf3] font-bold">{name}</h3>
    <p className="text-[#8b949e] text-sm">{role}</p>
    <p className="text-[#8b949e] text-xs">{description}</p>
  </div>
);

export default function About() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0d1117] font-sans">
      <Header />

      <main className="flex flex-col gap-10 md:gap-16 mt-8 md:mt-12 px-4 md:px-0 max-w-[960px] mx-auto">
        {/* Hero Section */}
        <HeroSection />

        {/* Our Story */}
        <section className="flex flex-col gap-4 px-4 md:px-6">
          <h2 className="text-[#e6edf3] text-2xl md:text-3xl font-bold leading-tight border-b border-[#30363d] pb-3">
            Our Story
          </h2>
          <p className="text-[#8b949e] text-base font-normal leading-relaxed">
            CampusConnect was born from a simple idea: to bridge the gap between
            students, mentors, and societies, creating a unified and powerful
            campus ecosystem.
          </p>
        </section>

        {/* Meet the Team */}
        <section className="flex flex-col gap-6 px-4 md:px-6" id="team">
          <h2 className="text-[#e6edf3] text-2xl md:text-3xl font-bold leading-tight border-b border-[#30363d] pb-3">
            Meet the Team
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TeamMember
              name="John Doe"
              role="Co-Founder & CEO"
              description="John is the visionary behind CampusConnect."
              image="https://via.placeholder.com/150"
            />
            <TeamMember
              name="Jane Smith"
              role="Co-Founder & CTO"
              description="Jane is the architectural mastermind."
              image="https://via.placeholder.com/150"
            />
            <TeamMember
              name="Emily Carter"
              role="Head of Community"
              description="Emily ensures our community is vibrant."
              image="https://via.placeholder.com/150"
            />
          </div>
        </section>

        {/* Contact Section */}
        <section
          className="flex flex-col gap-6 px-4 md:px-6 py-8 my-8 bg-[#161b22] rounded-xl border border-[#30363d]"
          id="contact"
        >
          <div className="flex flex-col gap-2 items-center text-center">
            <h2 className="text-[#e6edf3] text-2xl md:text-3xl font-bold leading-tight">
              Get in Touch
            </h2>
            <p className="text-[#8b949e] max-w-2xl">
              Have questions, feedback, or just want to say hello? We’d love to
              hear from you.
            </p>
          </div>
          <div className="flex justify-center">
            <Link
              to="/contact"
              className="flex items-center gap-2 min-w-[84px] max-w-[480px] justify-center rounded-lg h-12 px-6 bg-green-600 text-white text-base font-bold hover:bg-green-700 transition-colors"
            >
              <span className="material-symbols-outlined">email</span>
              <span className="truncate">Contact Us</span>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
