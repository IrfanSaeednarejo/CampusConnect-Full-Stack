import SectionHeader from "../../components/common/SectionHeader";
import Card from "../../components/common/Card";
import ValueCard from "../../components/common/ValueCard";
import StatDisplay from "../../components/common/StatDisplay";
import Button from "../../components/common/Button";

export default function AboutUs() {
  return (
    <div className="w-full bg-[#0d1117] text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-[960px] mx-auto">
        {/* Header */}
        <div className="mb-12">
          <SectionHeader
            title="About CampusConnect"
            subtitle="Connecting students, mentors, and societies to create a thriving campus ecosystem."
            align="left"
          />
        </div>

        {/* Mission Section */}
        <div className="flex flex-col gap-6 mb-12">
          <Card padding="p-6">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-[#8b949e] leading-relaxed">
              CampusConnect is dedicated to breaking down barriers and fostering
              meaningful connections across campus. We believe that every
              student deserves access to mentorship, opportunities, and a
              community that supports their growth. By uniting students,
              mentors, and societies on one platform, we empower our community
              to thrive academically and personally.
            </p>
          </Card>

          <Card padding="p-6">
            <h2 className="text-2xl font-bold mb-4">Our Vision</h2>
            <p className="text-[#8b949e] leading-relaxed">
              We envision a campus where every student feels connected,
              supported, and inspired to pursue their passions. A place where
              knowledge is shared freely, opportunities are accessible to all,
              and connections lead to lifelong friendships and professional
              relationships.
            </p>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Core Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ValueCard
              title="Community"
              description="We believe in the power of community and collective growth."
            />
            <ValueCard
              title="Accessibility"
              description="Everyone deserves equal access to opportunities and mentorship."
            />
            <ValueCard
              title="Integrity"
              description="We operate with honesty and transparency in all our interactions."
            />
            <ValueCard
              title="Innovation"
              description="We continuously improve our platform to serve our community better."
            />
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">By The Numbers</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatDisplay stat="5,234" label="Active Students" />
            <StatDisplay stat="342" label="Mentors" />
            <StatDisplay stat="87" label="Societies" />
            <StatDisplay stat="1,250+" label="Events Hosted" />
          </div>
        </div>

        {/* Team Section */}
        <Card className="text-center">
          <h2 className="text-2xl font-bold mb-4">Join Our Team</h2>
          <p className="text-[#8b949e] mb-6">
            Interested in joining the CampusConnect team? We're always looking
            for passionate individuals to help us build the future of campus
            connectivity.
          </p>
          <div className="flex justify-center">
            <Button variant="primary">See Open Positions</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
