// src/pages/Misc/PrivacyPolicy.jsx
import React from "react";
import Header from "../../components/layout/Header";

import { useNavigate } from "react-router-dom";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="font-display bg-[#0d1117] text-[#e6edf3] min-h-screen flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mx-auto max-w-4xl flex flex-col gap-10">
          <HeaderSection
            title="Privacy Policy"
            subtitle="Learn how we manage and protect your data on CampusConnect."
          />

          <Section
            title="Introduction"
            content="Welcome to CampusConnect. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us. This privacy policy applies to all information collected through our website and/or any related services, sales, marketing or events."
          />

          <Section
            title="1. Information We Collect"
            content="The personal information that we collect depends on the context of your interactions with us and the Site, the choices you make and the products and features you use. The personal information we collect can include the following:"
            list={[
              "Personal Identification: Name, email address, university affiliation, and profile picture.",
              "Usage Data: Information on how you use the site, such as pages visited, features used, and time spent.",
              "Cookies and Tracking Technologies: We use cookies to help us remember and process your preferences for future visits and compile aggregate data about site traffic and site interaction.",
            ]}
          />

          <Section
            title="2. How We Use Your Data"
            content="We use personal information collected via our Site for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations."
          />

          <Section
            title="3. Data Storage & Security"
            content="We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law."
          />

          <Section
            title="4. Your Rights & Choices"
            content="You have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information."
          />

          {/* Action Buttons */}
          <div className="flex flex-col items-start gap-4 pt-6 sm:flex-row">
            <Button
              icon="download"
              text="Download Policy"
              variant="primary"
              onClick={() => alert("Download initiated!")}
            />
            <Button
              text="Contact Us About Privacy"
              variant="secondary"
              onClick={() => navigate("/contactUs")}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] mt-16 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-[#8b949e]">
            © 2024 CampusConnect. All rights reserved.
          </p>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            <button
              className="text-sm text-[#8b949e] hover:text-[#e6edf3]"
              onClick={() => navigate("/terms")}
            >
              Terms of Service
            </button>
            <button
              className="text-sm text-[#e6edf3] font-semibold"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </button>
            <button
              className="text-sm text-[#8b949e] hover:text-[#e6edf3]"
              onClick={() => navigate("/about")}
            >
              About Us
            </button>
            <button
              className="text-sm text-[#8b949e] hover:text-[#e6edf3]"
              onClick={() => navigate("/contactUs")}
            >
              Contact
            </button>
          </nav>
        </div>
      </footer>
    </div>
  );
}

// Reusable Components
function HeaderSection({ title, subtitle }) {
  return (
    <div className="mb-12">
      <h1 className="text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]">
        {title}
      </h1>
      <p className="mt-4 text-lg text-[#8b949e]">{subtitle}</p>
    </div>
  );
}

function Section({ title, content, list }) {
  return (
    <section>
      <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-[#e6edf3] pb-3 border-b border-[#30363d]">
        {title}
      </h2>
      <p className="text-base leading-relaxed pt-4">{content}</p>
      {list && (
        <ul className="list-disc space-y-2 pl-6 text-base leading-relaxed pt-2">
          {list.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Button({ icon, text, variant, onClick }) {
  const baseClasses =
    "flex items-center justify-center rounded-lg h-11 px-6 text-sm font-semibold transition-colors";
  const variants = {
    primary: "bg-green-600 text-white hover:bg-green-700",
    secondary:
      "bg-[#161b22] text-[#e6edf3] border border-[#30363d] hover:bg-[#21262d]",
  };

  return (
    <button className={`${baseClasses} ${variants[variant]}`} onClick={onClick}>
      {icon && (
        <span className="material-symbols-outlined mr-2 text-xl">{icon}</span>
      )}
      {text}
    </button>
  );
}
