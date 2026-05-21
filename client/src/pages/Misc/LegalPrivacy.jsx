// src/pages/Misc/LegalPrivacy.jsx
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";
import PageContent from "../../components/common/PageContent";
import LegalIntro from "../../components/misc/LegalIntro";
import LegalSection from "../../components/misc/LegalSection";

export default function LegalPrivacy() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();

  return (
    <div
      className={`font-display ${
        isDark
          ? "bg-background-dark text-text-primary-dark"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <PageContent maxWidth="max-w-4xl" className="py-12 md:py-16">
        <div className="flex flex-col gap-10">
          <LegalIntro
            title="Privacy Policy"
            subtitle="Learn how we manage and protect your data on CampusNexus."
            titleClassName="text-4xl sm:text-5xl font-black leading-tight tracking-[-0.033em]"
            subtitleClassName={
              isDark
                ? "text-text-secondary-dark text-lg"
                : "text-slate-600 text-lg"
            }
            className="mb-2"
          />

          <LegalSection
            title="Introduction"
            content="Welcome to CampusNexus. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us. This privacy policy applies to all information collected through our website and/or any related services, sales, marketing or events."
            titleClassName={
              isDark
                ? "text-2xl font-bold leading-tight tracking-[-0.015em] text-text-primary-dark pb-3 border-b border-border-dark"
                : "text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 pb-3 border-b border-slate-200"
            }
            contentClassName={
              isDark
                ? "text-base leading-relaxed pt-4 text-text-primary-dark"
                : "text-base leading-relaxed pt-4 text-slate-700"
            }
          />

          <LegalSection
            title="1. Information We Collect"
            content="The personal information that we collect depends on the context of your interactions with us and the Site, the choices you make and the products and features you use. The personal information we collect can include the following:"
            list={[
              "Personal Identification: Name, email address, university affiliation, and profile picture.",
              "Usage Data: Information on how you use the site, such as pages visited, features used, and time spent.",
              "Cookies and Tracking Technologies: We use cookies to help us remember and process your preferences for future visits and compile aggregate data about site traffic and site interaction.",
            ]}
            titleClassName={
              isDark
                ? "text-2xl font-bold leading-tight tracking-[-0.015em] text-text-primary-dark pb-3 border-b border-border-dark"
                : "text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 pb-3 border-b border-slate-200"
            }
            contentClassName={
              isDark
                ? "text-base leading-relaxed pt-4 text-text-primary-dark"
                : "text-base leading-relaxed pt-4 text-slate-700"
            }
            listClassName={
              isDark
                ? "list-disc space-y-2 pl-6 text-base leading-relaxed pt-2 text-text-primary-dark"
                : "list-disc space-y-2 pl-6 text-base leading-relaxed pt-2 text-slate-700"
            }
          />

          <LegalSection
            title="2. How We Use Your Data"
            content="We use personal information collected via our Site for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations."
            titleClassName={
              isDark
                ? "text-2xl font-bold leading-tight tracking-[-0.015em] text-text-primary-dark pb-3 border-b border-border-dark"
                : "text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 pb-3 border-b border-slate-200"
            }
            contentClassName={
              isDark
                ? "text-base leading-relaxed pt-4 text-text-primary-dark"
                : "text-base leading-relaxed pt-4 text-slate-700"
            }
          />

          <LegalSection
            title="3. Data Storage & Security"
            content="We have implemented appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure. We will only keep your personal information for as long as it is necessary for the purposes set out in this privacy policy, unless a longer retention period is required or permitted by law."
            titleClassName={
              isDark
                ? "text-2xl font-bold leading-tight tracking-[-0.015em] text-text-primary-dark pb-3 border-b border-border-dark"
                : "text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 pb-3 border-b border-slate-200"
            }
            contentClassName={
              isDark
                ? "text-base leading-relaxed pt-4 text-text-primary-dark"
                : "text-base leading-relaxed pt-4 text-slate-700"
            }
          />

          <LegalSection
            title="4. Your Rights & Choices"
            content="You have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; and (iv) if applicable, to data portability. In certain circumstances, you may also have the right to object to the processing of your personal information."
            titleClassName={
              isDark
                ? "text-2xl font-bold leading-tight tracking-[-0.015em] text-text-primary-dark pb-3 border-b border-border-dark"
                : "text-2xl font-bold leading-tight tracking-[-0.015em] text-slate-900 pb-3 border-b border-slate-200"
            }
            contentClassName={
              isDark
                ? "text-base leading-relaxed pt-4 text-text-primary-dark"
                : "text-base leading-relaxed pt-4 text-slate-700"
            }
          />

          <div className="flex flex-col items-start gap-4 pt-6 sm:flex-row">
            <Button
              variant="primary"
              className="h-11 px-6 text-sm font-semibold"
              onClick={() => alert("Download initiated!")}
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-xl">
                  download
                </span>
                Download Policy
              </span>
            </Button>
            <Button
              variant="secondary"
              className="h-11 px-6 text-sm font-semibold"
              onClick={() => navigate("/contact-us")}
            >
              Contact Us About Privacy
            </Button>
          </div>
        </div>
      </PageContent>
    </div>
  );
}
