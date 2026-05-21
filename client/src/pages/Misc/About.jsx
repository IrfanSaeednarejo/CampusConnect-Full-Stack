import SectionHeader from "../../components/common/SectionHeader";
import Card from "../../components/common/Card";
import ValueCard from "../../components/common/ValueCard";
import StatDisplay from "../../components/common/StatDisplay";
import Button from "../../components/common/Button";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function AboutUs() {
  const isDark = useHomeTheme();

  return (
    <div
      className={`w-full min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-background-dark text-text-primary-dark"
          : "bg-background-light text-text-primary-light"
      }`}
    >
      <div className="mx-auto max-w-[960px] px-4 py-10 sm:px-10 md:px-20 lg:px-40">
        <section className={`mb-12 overflow-hidden rounded-[2rem] border px-6 py-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 md:px-8 md:py-10 ${isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"}`}>
          <span className={`mb-4 inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] transition-colors duration-300 ${isDark ? "border-border-dark bg-background-dark text-info" : "border-border-light bg-surface-light text-info"}`}>
            OUR STORY
          </span>
          <SectionHeader
            title="About CampusNexus"
            subtitle="Connecting students, mentors, and societies to create a thriving campus ecosystem."
            align="left"
            isDark={isDark}
          />
        </section>

        <div className="mb-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card isDark={isDark} padding="p-6 md:p-8">
            <h2
              className={`mb-4 text-2xl font-bold transition-colors duration-300 ${
                isDark ? "text-text-primary-dark" : "text-text-primary-light"
              }`}
            >
              Our Mission
            </h2>
            <p
              className={`leading-relaxed transition-colors duration-300 ${
                isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
              }`}
            >
              CampusNexus is dedicated to breaking down barriers and fostering
              meaningful connections across campus. We believe that every
              student deserves access to mentorship, opportunities, and a
              community that supports their growth. By uniting students,
              mentors, and societies on one platform, we empower our community
              to thrive academically and personally.
            </p>
          </Card>
          <Card isDark={isDark} padding="p-6 md:p-8">
            <h2
              className={`mb-4 text-2xl font-bold transition-colors duration-300 ${
                isDark ? "text-text-primary-dark" : "text-text-primary-light"
              }`}
            >
              Our Vision
            </h2>
            <p
              className={`leading-relaxed transition-colors duration-300 ${
                isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
              }`}
            >
              We envision a campus where every student feels connected,
              supported, and inspired to pursue their passions. A place where
              knowledge is shared freely, opportunities are accessible to all,
              and connections lead to lifelong friendships and professional
              relationships.
            </p>
          </Card>
        </div>

        <div className="mb-12">
          <h2
            className={`mb-6 text-2xl font-bold transition-colors duration-300 ${
                isDark ? "text-text-primary-dark" : "text-text-primary-light"
            }`}
          >
            Our Core Values
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ValueCard
              isDark={isDark}
              title="Community"
              description="We believe in the power of community and collective growth."
            />
            <ValueCard
              isDark={isDark}
              title="Accessibility"
              description="Everyone deserves equal access to opportunities and mentorship."
            />
            <ValueCard
              isDark={isDark}
              title="Integrity"
              description="We operate with honesty and transparency in all our interactions."
            />
            <ValueCard
              isDark={isDark}
              title="Innovation"
              description="We continuously improve our platform to serve our community better."
            />
          </div>
        </div>

        <div className="mb-12">
          <h2
            className={`mb-6 text-2xl font-bold transition-colors duration-300 ${
                isDark ? "text-text-primary-dark" : "text-text-primary-light"
            }`}
          >
            By The Numbers
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <StatDisplay isDark={isDark} stat="5,234" label="Active Students" />
            <StatDisplay isDark={isDark} stat="342" label="Mentors" />
            <StatDisplay isDark={isDark} stat="87" label="Societies" />
            <StatDisplay isDark={isDark} stat="1,250+" label="Events Hosted" />
          </div>
        </div>

        <Card isDark={isDark} className="text-center shadow-[0_24px_60px_rgba(15,23,42,0.08)]" padding="p-6 md:p-8">
          <h2
            className={`mb-4 text-2xl font-bold transition-colors duration-300 ${
              isDark ? "text-text-primary-dark" : "text-text-primary-light"
            }`}
          >
            Join Our Team
          </h2>
          <p
            className={`mb-6 transition-colors duration-300 ${
                isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
            }`}
          >
            Interested in joining the CampusNexus team? We&apos;re always looking
            for passionate individuals to help us build the future of campus
            connectivity.
          </p>
          <div className="flex justify-center">
            <Button
              variant="primary"
              className={
                !isDark
                  ? "bg-info text-white hover:bg-blue-700 shadow-[0_10px_24px_rgba(37,99,235,0.18)]"
                  : ""
              }
            >
              See Open Positions
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
