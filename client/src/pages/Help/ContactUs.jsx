// src/pages/Help/ContactUs.jsx
import { useState } from "react";
import Header from "../../components/layout/Header";
import { useNavigate } from "react-router-dom";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import PageContent from "../../components/common/PageContent";

export default function ContactUs() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    topic: "General Question",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    if (e?.preventDefault) {
      e.preventDefault();
    }
    // Here you can handle form submission, e.g., send to API or save data
    alert("Message sent successfully!");
  };

  return (
    <div className="font-display text-text-primary-dark min-h-screen w-full bg-[#0d1117]">
      {/* HEADER */}
      <Header />

      <PageContent
        maxWidth="max-w-[960px]"
        className="flex flex-col gap-8 md:gap-12 py-8 md:py-16"
      >
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-[#e6edf3] leading-tight tracking-[-0.033em]">
            Send Us a Message
          </h1>
          <p className="text-[#8b949e] text-base md:text-lg">
            Have questions, feedback, or just want to say hello? We’d love to
            hear from you.
          </p>
        </div>

        {/* FORM */}
        <div className="w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* NAME */}
            <FormField
              label="Your Name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            {/* EMAIL */}
            <FormField
              label="Your Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />

            {/* TOPIC */}
            <FormField
              label="Topic"
              type="select"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
            >
              <option value="General Question">General Question</option>
              <option value="Technical Support">Technical Support</option>
              <option value="Partnership Inquiry">Partnership Inquiry</option>
              <option value="Other">Other</option>
            </FormField>

            {/* MESSAGE */}
            <FormField
              label="Message"
              type="textarea"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={6}
              placeholder="Please describe your inquiry..."
              required
            />

            {/* BUTTONS */}
            <FormActions
              submitText="Send Message"
              cancelText="Cancel"
              onSubmit={handleSubmit}
              onCancel={() => navigate(-1)}
              className="flex-col-reverse sm:flex-row"
            />
          </form>
        </div>
      </PageContent>
    </div>
  );
}
