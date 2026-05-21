import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import PageContent from "../../components/common/PageContent";
import useHomeTheme from "../../hooks/useHomeTheme";

export default function ContactUs() {
  const navigate = useNavigate();
  const isDark = useHomeTheme();
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
    if (e?.preventDefault) e.preventDefault();
    toast.success("Message sent successfully!");
  };

  return (
    <div
      className={`min-h-screen w-full font-display transition-colors duration-300 ${
        isDark ? "bg-background-dark text-text-primary-dark" : "bg-background-light text-text-primary-light"
      }`}
    >
      <PageContent maxWidth="max-w-[960px]" className="flex flex-col gap-8 py-8 md:gap-12 md:py-16">
        <div className="flex flex-col gap-3 text-center">
          <span
            className={`mx-auto inline-flex rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.12em] transition-colors duration-300 ${
              isDark
                ? "border-border-dark bg-surface-dark text-info"
                : "border-border-light bg-surface-light text-info"
            }`}
          >
            CONTACT CAMPUSNEXUS
          </span>
          <h1 className={`text-4xl font-black leading-tight tracking-[-0.033em] md:text-5xl ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
            Send Us a Message
          </h1>
          <p className={`mx-auto max-w-2xl text-base md:text-lg ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            Have questions, feedback, or just want to say hello? We&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div
            className={`rounded-[1.75rem] border p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 md:p-8 ${
              isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"
            }`}
          >
            <h2 className={`text-2xl font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>Let&apos;s talk</h2>
            <p className={`mt-3 text-sm leading-relaxed ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              Reach out for support, partnerships, feedback, or product questions. We keep communication clear, useful, and fast.
            </p>
            <div className="mt-6 space-y-4">
              {[
                { title: "Response Window", text: "Usually within 1-2 business days." },
                { title: "Support Topics", text: "Platform help, collaboration, events, societies." },
                { title: "Communication Style", text: "Direct, helpful, and student-friendly." },
              ].map((item) => (
                <div
                  key={item.title}
                  className={`rounded-2xl border p-4 transition-all duration-300 ${
                    isDark ? "border-border-dark bg-background-dark" : "border-border-light bg-slate-50"
                  }`}
                >
                  <p className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>{item.title}</p>
                  <p className={`mt-1 text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mx-auto w-full rounded-[1.75rem] border p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] transition-all duration-300 md:p-8 ${
              isDark ? "border-border-dark bg-surface-dark" : "border-border-light bg-surface-light"
            }`}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <FormField
                isDark={isDark}
                label="Your Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
              />

              <FormField
                isDark={isDark}
                label="Your Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />

              <FormField
                isDark={isDark}
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

              <FormField
                isDark={isDark}
                label="Message"
                type="textarea"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                placeholder="Please describe your inquiry..."
                required
              />

              <FormActions
                isDark={isDark}
                submitText="Send Message"
                cancelText="Cancel"
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
                className="flex-col-reverse sm:flex-row"
              />
            </form>
          </div>
        </div>
      </PageContent>
    </div>
  );
}
