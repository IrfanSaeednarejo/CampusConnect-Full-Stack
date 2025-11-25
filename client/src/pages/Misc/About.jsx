// src/pages/Misc/About.jsx
import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";

/* Updated Hero Section */
function HeroSection() {
  return (
    <div>
      <div className="flex min-h-[400px] flex-col gap-6  items-center justify-center p-4 text-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-[#e6edf3] text-4xl font-black leading-tight tracking-[-0.033em] ">
            About CampusConnect
          </h1>
          <h2 className="text-[#8b949e] text-lg font-normal leading-normal ">
            Our mission is to connect, empower, and support campus communities.
          </h2>
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          <a
            href="#team"
            className="flex min-w-[84px] max-w-[480px] items-center bg-gray-600 justify-center rounded-lg h-10 px-4 @[480px]:h-12 @[480px]:px-5 border border-primary text-white hover:bg-green-600 text-sm font-bold transition-colors"
          >
            Meet the Team
          </a>

          <a
            href="#contact"
            className="flex min-w-[84px] max-w-[480px] items-center justify-center rounded-lg h-10 px-4  border border-[#30363d] text-[#e6edf3] hover:border-[#8b949e] text-sm font-bold transition-colors"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}

/* Updated Team Member Component */
function TeamMember({ name, role, description, image }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border border-[#30363d] bg-[#161b22] p-6 text-center transition-all hover:border-[#8b949e]">
      <img
        className="size-32 rounded-full object-cover border-2 border-[#30363d]"
        src={image}
        alt={name}
      />
      <div className="flex flex-col">
        <h3 className="font-bold text-lg text-[#e6edf3]">{name}</h3>
        <p className="text-sm text-primary">{role}</p>
      </div>
      <p className="text-sm text-[#8b949e]">{description}</p>
    </div>
  );
}

export default function About() {
  return (
    <div className="flex flex-col min-h-screen w-full bg-[#0d1117] font-display">
      <Header />

      <main className="flex flex-col gap-10 md:gap-16 mt-8 md:mt-12 px-4 md:px-0 max-w-[960px] mx-auto">
        {/* HERO UPDATED */}
        <HeroSection />

        {/* Our Story – UPDATED TEXT & STYLE */}
        <section className="flex flex-col gap-4 px-4 md:px-6">
          <h2 className="text-[#e6edf3] text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] border-b border-[#30363d] pb-3">
            Our Story
          </h2>
          <p className="text-[#8b949e] text-base font-normal leading-relaxed">
            CampusConnect was born from a simple idea: to bridge the gap between
            students, mentors, and societies, creating a unified and powerful
            campus ecosystem. We saw the fragmented communication and missed
            opportunities and envisioned a platform that could bring everyone
            together. Our journey began in a dorm room, fueled by passion and a
            desire to enhance the university experience for all. Today, we're
            proud to offer a space where connections flourish, knowledge is
            shared, and communities thrive.
          </p>
        </section>

        {/* Meet the Team – UPDATED UI */}
        <section className="flex flex-col gap-6 px-4 md:px-6" id="team">
          <h2 className="text-[#e6edf3] text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em] border-b border-[#30363d] pb-3">
            Meet the Team
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TeamMember
              name="John Doe"
              role="Co-Founder & CEO"
              description="John is the visionary behind CampusConnect, passionate about building strong communities."
              image="https://via.placeholder.com/150"
            />
            <TeamMember
              name="Jane Smith"
              role="Co-Founder & CTO"
              description="Jane ensures our platform is robust, scalable, and secure for everyone."
              image="https://via.placeholder.com/150"
            />
            <TeamMember
              name="Emily Carter"
              role="Head of Community"
              description="Emily makes sure our community is vibrant and every voice is valued."
              image="https://via.placeholder.com/150"
            />
          </div>
        </section>

        {/* Contact Section – UPDATED UI */}
        <section
          id="contact"
          className="flex flex-col gap-6 px-4 md:px-6 py-8 my-8 bg-[#161b22] rounded-xl border border-[#30363d]"
        >
          <div className="flex flex-col gap-2 items-center text-center">
            <h2 className="text-[#e6edf3] text-2xl md:text-3xl font-bold leading-tight tracking-[-0.015em]">
              Get in Touch
            </h2>
            <p className="text-[#8b949e] max-w-2xl">
              Have questions, feedback, or just want to say hello? We'd love to
              hear from you.
            </p>
          </div>

          <div className="flex justify-center">
            <Link
              to="/contact"
              className="flex items-center gap-2 min-w-[84px] max-w-[480px] justify-center rounded-lg h-12 px-6 bg-primary text-[#e6edf3] text-base font-bold hover:bg-green-600 transition-colors"
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
