// src/pages/Misc/TermsOfService.jsx
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import PageContent from "../../components/common/PageContent";
import LegalIntro from "../../components/misc/LegalIntro";
import LegalSection from "../../components/misc/LegalSection";

export default function TermsOfService() {
  return (
    <div className="font-display bg-background min-h-screen flex flex-col relative overflow-x-hidden">

      {/* Main Content */}
      <PageContent maxWidth="max-w-4xl" className="py-8">
        {/* Heading */}
        <LegalIntro
          title="Terms of Service"
          subtitle="Please read our terms and conditions before using CampusConnect."
          meta="Last updated: March 23, 2026"
          className="p-4"
          titleClassName="text-text-primary"
          subtitleClassName="text-text-secondary"
          metaClassName="text-text-secondary pt-1 border-b border-border pb-3"
        />

        {/* Sections */}
        <div className="space-y-8 pt-8">
          <LegalSection
            title="1. Introduction"
            content="Welcome to CampusConnect. These Terms of Service govern your use of our website and services. By accessing or using the service, you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the service."
            titleClassName="text-text-primary text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-text-primary text-base px-4 pt-1 pb-3"
          />
          <LegalSection
            title="2. User Responsibilities"
            content="You are responsible for your use of the CampusConnect services and for any content you provide, including compliance with applicable laws."
            list={[
              "Provide accurate information when creating your account.",
              "Safeguard your account and password and not share it with others.",
              "Use the services in a professional and respectful manner.",
              "Not engage in any activity that is illegal, harmful, or fraudulent.",
            ]}
            titleClassName="text-text-primary text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-text-primary text-base px-4 pt-1 pb-3"
            listClassName="list-disc pl-10 space-y-2 text-text-primary"
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
            titleClassName="text-text-primary text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-text-primary text-base px-4 pt-1 pb-3"
            listClassName="list-disc pl-10 space-y-2 text-text-primary"
          />
          <LegalSection
            title="4. Intellectual Property"
            content="By submitting content, you grant CampusConnect a worldwide, non-exclusive, royalty-free license to use, copy, and distribute such content."
            titleClassName="text-text-primary text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-text-primary text-base px-4 pt-1 pb-3"
          />
          <LegalSection
            title="5. Account Termination"
            content="We may suspend or terminate your account at any time for violations or risks, with reasonable notification."
            titleClassName="text-text-primary text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-text-primary text-base px-4 pt-1 pb-3"
          />
          <LegalSection
            title="6. Disclaimers and Limitation of Liability"
            content="Services are provided 'AS IS' without warranties. CampusConnect is not liable for any indirect or consequential damages."
            titleClassName="text-text-primary text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-text-primary text-base px-4 pt-1 pb-3"
          />
          <LegalSection
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
            titleClassName="text-text-primary text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            contentClassName="text-text-primary text-base px-4 pt-1 pb-3"
          />
        </div>
      </PageContent>


    </div>
  );
}
