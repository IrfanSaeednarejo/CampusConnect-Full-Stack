// src/pages/Misc/TermsOfService.jsx
import useHomeTheme from "../../hooks/useHomeTheme";
import PageContent from "../../components/common/PageContent";
import LegalIntro from "../../components/misc/LegalIntro";
import LegalSection from "../../components/misc/LegalSection";

export default function TermsOfService() {
  const isDark = useHomeTheme();

  return (
    <div
      className={`font-display relative overflow-x-hidden ${
        isDark
          ? "bg-background-dark text-text-primary-dark"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <PageContent maxWidth="max-w-4xl" className="py-8">
        <LegalIntro
          title="Terms of Service"
          subtitle="Please read our terms and conditions before using CampusNexus."
          meta="Last updated: October 26, 2023"
          className="p-4"
          titleClassName={isDark ? "text-white" : "text-slate-900"}
          subtitleClassName={
            isDark ? "text-text-secondary-dark" : "text-slate-600"
          }
          metaClassName={
            isDark
              ? "text-text-secondary-dark pt-1 border-b border-border-dark pb-3"
              : "text-slate-500 pt-1 border-b border-slate-200 pb-3"
          }
        />

        <div className="space-y-8 pt-8">
          <LegalSection
            title="1. Introduction"
            content="Welcome to CampusNexus. These Terms of Service govern your use of our website and services. By accessing or using the service, you agree to be bound by these Terms. If you disagree with any part of the terms, you do not have permission to access the service."
            titleClassName={
              isDark
                ? "text-text-primary-dark text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
                : "text-slate-900 text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            }
            contentClassName={
              isDark
                ? "text-text-primary-dark text-base px-4 pt-1 pb-3"
                : "text-slate-700 text-base px-4 pt-1 pb-3"
            }
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
            titleClassName={
              isDark
                ? "text-text-primary-dark text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
                : "text-slate-900 text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            }
            contentClassName={
              isDark
                ? "text-text-primary-dark text-base px-4 pt-1 pb-3"
                : "text-slate-700 text-base px-4 pt-1 pb-3"
            }
            listClassName={
              isDark
                ? "list-disc pl-10 space-y-2 text-text-primary-dark"
                : "list-disc pl-10 space-y-2 text-slate-700"
            }
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
            titleClassName={
              isDark
                ? "text-text-primary-dark text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
                : "text-slate-900 text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            }
            contentClassName={
              isDark
                ? "text-text-primary-dark text-base px-4 pt-1 pb-3"
                : "text-slate-700 text-base px-4 pt-1 pb-3"
            }
            listClassName={
              isDark
                ? "list-disc pl-10 space-y-2 text-text-primary-dark"
                : "list-disc pl-10 space-y-2 text-slate-700"
            }
          />
          <LegalSection
            title="4. Intellectual Property"
            content="By submitting content, you grant CampusNexus a worldwide, non-exclusive, royalty-free license to use, copy, and distribute such content."
            titleClassName={
              isDark
                ? "text-text-primary-dark text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
                : "text-slate-900 text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            }
            contentClassName={
              isDark
                ? "text-text-primary-dark text-base px-4 pt-1 pb-3"
                : "text-slate-700 text-base px-4 pt-1 pb-3"
            }
          />
          <LegalSection
            title="5. Account Termination"
            content="We may suspend or terminate your account at any time for violations or risks, with reasonable notification."
            titleClassName={
              isDark
                ? "text-text-primary-dark text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
                : "text-slate-900 text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            }
            contentClassName={
              isDark
                ? "text-text-primary-dark text-base px-4 pt-1 pb-3"
                : "text-slate-700 text-base px-4 pt-1 pb-3"
            }
          />
          <LegalSection
            title="6. Disclaimers and Limitation of Liability"
            content="Services are provided 'AS IS' without warranties. CampusNexus is not liable for any indirect or consequential damages."
            titleClassName={
              isDark
                ? "text-text-primary-dark text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
                : "text-slate-900 text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            }
            contentClassName={
              isDark
                ? "text-text-primary-dark text-base px-4 pt-1 pb-3"
                : "text-slate-700 text-base px-4 pt-1 pb-3"
            }
          />
          <LegalSection
            title="7. Contact Information"
            content={
              <span>
                Contact us at{" "}
                <a
                  className="text-info hover:underline"
                  href="mailto:support@campusnexus.com"
                >
                  support@campusnexus.com
                </a>
                .
              </span>
            }
            titleClassName={
              isDark
                ? "text-text-primary-dark text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
                : "text-slate-900 text-2xl font-bold tracking-tight px-4 pt-5 pb-3"
            }
            contentClassName={
              isDark
                ? "text-text-primary-dark text-base px-4 pt-1 pb-3"
                : "text-slate-700 text-base px-4 pt-1 pb-3"
            }
          />
        </div>
      </PageContent>
    </div>
  );
}
