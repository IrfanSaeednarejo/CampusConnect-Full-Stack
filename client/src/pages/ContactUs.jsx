import { useState } from "react";
import SectionHeader from "../components/common/SectionHeader";
import Card from "../components/common/Card";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import ContactInfoCard from "../components/common/ContactInfoCard";
import FAQItem from "../components/common/FAQItem";
import SuccessMessage from "../components/common/SuccessMessage";

export default function ContactUs() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Form submission logic here
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="w-full bg-background text-[#e6edf3] min-h-screen py-10 px-4 sm:px-10 md:px-20 lg:px-40">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <SectionHeader
            title="Contact Us"
            subtitle="Have questions or feedback? We'd love to hear from you. Get in touch with our team."
            align="left"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Contact Form */}
          <Card padding="p-6">
            <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>

            {submitted && (
              <SuccessMessage message="Thank you! We'll get back to you soon." />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Your name"
              />

              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="your@email.com"
              />

              <Input
                label="Subject"
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Subject"
              />

              <Input
                label="Message"
                type="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows="5"
                placeholder="Your message..."
              />

              <Button type="submit" variant="primary" className="w-full">
                Send Message
              </Button>
            </form>
          </Card>

          {/* Contact Information */}
          <div className="flex flex-col gap-6">
            <ContactInfoCard icon="📍" title="Location">
              <p>
                CampusConnect Center
                <br />
                University Campus
                <br />
                City, State 12345
              </p>
            </ContactInfoCard>

            <ContactInfoCard icon="📧" title="Email">
              <p>
                support@campusconnect.com
                <br />
                hello@campusconnect.com
              </p>
            </ContactInfoCard>

            <ContactInfoCard icon="📞" title="Phone">
              <p>
                +1 (555) 123-4567
                <br />
                Mon-Fri, 9AM - 5PM EST
              </p>
            </ContactInfoCard>

            <ContactInfoCard icon="🌐" title="Follow Us">
              <div className="flex gap-3">
                <a href="#" className="text-primary hover:text-[#2ea043]">
                  Twitter
                </a>
                <a href="#" className="text-primary hover:text-[#2ea043]">
                  LinkedIn
                </a>
                <a href="#" className="text-primary hover:text-[#2ea043]">
                  Instagram
                </a>
                <a href="#" className="text-primary hover:text-[#2ea043]">
                  Facebook
                </a>
              </div>
            </ContactInfoCard>
          </div>
        </div>

        {/* FAQ Section */}
        <Card>
          <h2 className="text-2xl font-bold mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            <FAQItem
              question="How do I create an account?"
              answer="Visit our signup page and follow the simple registration process. It takes less than 5 minutes!"
            />
            <FAQItem
              question="How can I find a mentor?"
              answer="Use our Mentors page to browse available mentors, filter by expertise, and send mentorship requests."
            />
            <FAQItem
              question="Can I create a society?"
              answer="Yes! If you meet the requirements, you can create and manage your own society on CampusConnect."
            />
            <FAQItem
              question="Is CampusConnect free?"
              answer="Yes, CampusConnect is completely free for all students and community members."
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
