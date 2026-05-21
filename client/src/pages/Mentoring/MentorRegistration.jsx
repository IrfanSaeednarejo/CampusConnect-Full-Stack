import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  registerAsMentorThunk,
  fetchMyMentorProfile,
  selectMentoringActionLoading,
  selectMyMentorProfile,
} from "../../redux/slices/mentoringSlice";
import { selectUser } from "../../redux/slices/authSlice";
import useHomeTheme from "../../hooks/useHomeTheme";
import Button from "../../components/common/Button";

const CATEGORIES = [
  { value: "technical", label: "Technical / Coding" },
  { value: "academic", label: "Academic" },
  { value: "career", label: "Career Guidance" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "wellness", label: "Wellness & Mental Health" },
  { value: "creative", label: "Creative Arts" },
  { value: "professional", label: "Professional Development" },
  { value: "other", label: "Other" },
];

const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "0–1 year" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10+", label: "10+ years" },
];

const MENTORING_STYLES = [
  "Regular check-in sessions",
  "Goal-oriented milestones",
  "Project-based guidance",
  "Career roadmap planning",
  "Portfolio / CV reviews",
  "Mock interviews",
  "Open Q&A sessions",
];

const STEPS = [
  { id: 1, label: "Your Profile", icon: "person" },
  { id: 2, label: "Expertise", icon: "school" },
  { id: 3, label: "Mentoring Style", icon: "psychology" },
  { id: 4, label: "Review & Submit", icon: "done_all" },
];

function FormField({ label, required, children, hint, isDark }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-text-primary">
        {label}
        {required && <span className="ml-0.5 text-red-400">*</span>}
      </label>
      {children}
      {hint && <p className="theme-muted mt-1 text-xs">{hint}</p>}
    </div>
  );
}

function Input({ isDark, className = "", ...props }) {
  return (
    <input
      {...props}
      className={`theme-field w-full rounded-xl px-3 py-2.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}

function TextArea({ isDark, className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={`theme-field w-full resize-none rounded-xl px-3 py-2.5 text-sm transition-colors ${className}`}
    />
  );
}

function Select({ children, isDark, className = "", ...props }) {
  return (
    <select
      {...props}
      className={`theme-field w-full rounded-xl px-3 py-2.5 text-sm transition-colors ${className}`}
    >
      {children}
    </select>
  );
}

function TagInput({ tags, setTags, placeholder, isDark }) {
  const [inputVal, setInputVal] = useState("");

  const addTag = (val) => {
    const v = val.trim();
    if (!v || tags.includes(v)) return;
    setTags([...tags, v]);
    setInputVal("");
  };

  const removeTag = (tag) => setTags(tags.filter((x) => x !== tag));

  const handleKey = (event) => {
    if ((event.key === "Enter" || event.key === ",") && inputVal.trim()) {
      event.preventDefault();
      addTag(inputVal);
    } else if (event.key === "Backspace" && !inputVal && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <div
        className={`flex min-h-[40px] flex-wrap gap-1.5 rounded-xl border px-3 py-2 transition-colors ${
          isDark
            ? "border-slate-700 bg-slate-900/60 focus-within:border-slate-500"
            : "border-slate-200 bg-white focus-within:border-slate-400"
        }`}
      >
        {tags.map((tag) => (
          <span
            key={tag}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
              isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"
            }`}
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className={isDark ? "text-slate-500 hover:text-slate-200" : "text-slate-400 hover:text-slate-700"}
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => addTag(inputVal)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={`min-w-[80px] flex-1 bg-transparent text-sm focus:outline-none ${
            isDark ? "text-slate-200 placeholder-slate-600" : "text-slate-900 placeholder-slate-400"
          }`}
        />
      </div>
      <p className={`mt-1 text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>
        Press Enter or comma to add tags
      </p>
    </div>
  );
}

function Step1Profile({ data, setData, user, isDark }) {
  const profile = user?.profile ?? {};
  const academic = user?.academic ?? {};

  return (
    <div className="space-y-5">
      <div>
        <h3 className={`mb-0.5 text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Profile Information
        </h3>
        <p className={isDark ? "text-slate-500 text-sm" : "text-slate-500 text-sm"}>
          We've pre-filled this from your profile. Update if needed.
        </p>
      </div>

      <div
        className={`flex items-center gap-4 rounded-xl border p-4 ${
          isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-slate-50"
        }`}
      >
        {profile.avatar ? (
          <img src={profile.avatar} alt="" className={`h-14 w-14 rounded-full object-cover ${isDark ? "border-2 border-slate-700" : "border-2 border-white"}`} />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-600 to-slate-700 text-xl font-bold text-white">
            {(profile.displayName ?? profile.firstName ?? "?").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <p className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-900"}`}>
            {profile.displayName ?? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()}
          </p>
          <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>{user?.email}</p>
          <p className={`mt-0.5 text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>
            {academic.department} {academic.degree && `· ${academic.degree}`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="First Name" required isDark={isDark}>
          <Input
            isDark={isDark}
            value={data.firstName}
            onChange={(e) => setData((p) => ({ ...p, firstName: e.target.value }))}
            placeholder="First name"
          />
        </FormField>
        <FormField label="Last Name" required isDark={isDark}>
          <Input
            isDark={isDark}
            value={data.lastName}
            onChange={(e) => setData((p) => ({ ...p, lastName: e.target.value }))}
            placeholder="Last name"
          />
        </FormField>
      </div>

      <FormField label="Email" required isDark={isDark}>
        <Input isDark={isDark} type="email" value={data.email} disabled placeholder="Your email" />
      </FormField>

      <FormField label="Department / Major" isDark={isDark}>
        <Input
          isDark={isDark}
          value={data.department}
          onChange={(e) => setData((p) => ({ ...p, department: e.target.value }))}
          placeholder="e.g. Computer Science"
        />
      </FormField>

      <FormField label="Current Year / Status" isDark={isDark}>
        <Select
          isDark={isDark}
          value={data.academicYear}
          onChange={(e) => setData((p) => ({ ...p, academicYear: e.target.value }))}
        >
          <option value="">Select your status</option>
          <option value="freshman">Freshman (Year 1)</option>
          <option value="sophomore">Sophomore (Year 2)</option>
          <option value="junior">Junior (Year 3)</option>
          <option value="senior">Senior (Year 4+)</option>
          <option value="graduate">Graduate Student</option>
          <option value="alumni">Alumni / Graduate</option>
          <option value="faculty">Faculty / Staff</option>
        </Select>
      </FormField>

      <FormField label="LinkedIn Profile (Optional)" isDark={isDark}>
        <Input
          isDark={isDark}
          type="url"
          value={data.linkedin}
          onChange={(e) => setData((p) => ({ ...p, linkedin: e.target.value }))}
          placeholder="https://linkedin.com/in/your-profile"
        />
      </FormField>
    </div>
  );
}

function Step2Expertise({ data, setData, isDark }) {
  const hourlyRateValue = Number(data.hourlyRate);
  const hasRateError =
    data.hourlyRate !== "" &&
    (Number.isNaN(hourlyRateValue) || hourlyRateValue < 0 || hourlyRateValue > 500);

  return (
    <div className="space-y-5">
      <div>
        <h3 className={`mb-0.5 text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Your Expertise
        </h3>
        <p className={isDark ? "text-slate-500 text-sm" : "text-slate-500 text-sm"}>
          Tell us what you can best teach and guide others in.
        </p>
      </div>

      <FormField label="Primary Category" required isDark={isDark}>
        <Select
          isDark={isDark}
          value={data.category}
          onChange={(e) => setData((p) => ({ ...p, category: e.target.value }))}
        >
          {CATEGORIES.map((category) => (
            <option key={category.value} value={category.value}>
              {category.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Skills & Expertise Areas"
        required
        hint="These appear as searchable tags on your profile"
        isDark={isDark}
      >
        <TagInput
          tags={data.expertise}
          setTags={(tags) => setData((p) => ({ ...p, expertise: tags }))}
          placeholder="e.g. React, Python, Resume Writing..."
          isDark={isDark}
        />
      </FormField>

      <FormField label="Years of Relevant Experience" required isDark={isDark}>
        <Select
          isDark={isDark}
          value={data.yearsExperience}
          onChange={(e) => setData((p) => ({ ...p, yearsExperience: e.target.value }))}
        >
          <option value="">Select experience</option>
          {EXPERIENCE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </FormField>

      <FormField
        label="Professional Bio"
        required
        hint="Max 500 characters — make a strong first impression"
        isDark={isDark}
      >
        <TextArea
          isDark={isDark}
          rows={5}
          maxLength={500}
          value={data.bio}
          onChange={(e) => setData((p) => ({ ...p, bio: e.target.value }))}
          placeholder="Describe your background, achievements, and what makes you a great mentor..."
        />
        <p className={`mt-1 text-right text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>
          {data.bio.length}/500
        </p>
      </FormField>

      <FormField
        label="Hourly Rate (PKR)"
        hint="Set to 0 for free mentoring. Maximum allowed rate is PKR 500/hr."
        isDark={isDark}
      >
        <div className="flex items-center gap-2">
          <Input
            isDark={isDark}
            type="number"
            min="0"
            max="500"
            value={data.hourlyRate}
            onChange={(e) => setData((p) => ({ ...p, hourlyRate: e.target.value }))}
            placeholder="0"
            className="flex-1"
          />
          <span
            className={`rounded-xl border px-3 py-2.5 text-sm font-medium ${
              isDark
                ? "border-slate-700 bg-slate-800 text-slate-500"
                : "border-slate-200 bg-slate-50 text-slate-500"
            }`}
          >
            PKR/hr
          </span>
        </div>
        {hasRateError && (
          <p className="mt-1 text-xs text-red-500">
            Hourly rate must be between PKR 0 and PKR 500.
          </p>
        )}
        {Number(data.hourlyRate) === 0 && (
          <p className="mt-1 text-xs text-emerald-500">✓ Free mentoring — great for getting started!</p>
        )}
      </FormField>
    </div>
  );
}

function Step3Style({ data, setData, isDark }) {
  const toggleStyle = (style) => {
    setData((p) => ({
      ...p,
      mentoringStyles: p.mentoringStyles.includes(style)
        ? p.mentoringStyles.filter((x) => x !== style)
        : [...p.mentoringStyles, style],
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className={`mb-0.5 text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Mentoring Approach
        </h3>
        <p className={isDark ? "text-slate-500 text-sm" : "text-slate-500 text-sm"}>
          Help students understand how you prefer to work.
        </p>
      </div>

      <FormField label="Preferred Mentoring Style(s)" hint="Select all that apply" isDark={isDark}>
        <div className="mt-1 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {MENTORING_STYLES.map((style) => {
            const active = data.mentoringStyles.includes(style);
            return (
              <button
                key={style}
                type="button"
                onClick={() => toggleStyle(style)}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all ${
                  active
                    ? isDark
                      ? "border-emerald-500/30 bg-emerald-600/15 text-emerald-300"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : isDark
                      ? "border-slate-700 bg-slate-900/50 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                      : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700"
                }`}
              >
                <span className={`mr-2 ${active ? "text-emerald-400" : isDark ? "text-slate-600" : "text-slate-400"}`}>
                  {active ? "✓" : "○"}
                </span>
                {style}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="Session Frequency" required isDark={isDark}>
        <Select
          isDark={isDark}
          value={data.sessionFrequency}
          onChange={(e) => setData((p) => ({ ...p, sessionFrequency: e.target.value }))}
        >
          <option value="">Select frequency</option>
          <option value="weekly">Weekly sessions</option>
          <option value="biweekly">Bi-weekly sessions</option>
          <option value="monthly">Monthly sessions</option>
          <option value="on-demand">On-demand / As needed</option>
          <option value="flexible">Flexible</option>
        </Select>
      </FormField>

      <FormField
        label="What motivates you to become a mentor?"
        required
        hint="This is shared with admins during review"
        isDark={isDark}
      >
        <TextArea
          isDark={isDark}
          rows={4}
          maxLength={400}
          value={data.motivation}
          onChange={(e) => setData((p) => ({ ...p, motivation: e.target.value }))}
          placeholder="Describe why you want to mentor and how you plan to make an impact..."
        />
        <p className={`mt-1 text-right text-xs ${isDark ? "text-slate-600" : "text-slate-500"}`}>
          {data.motivation.length}/400
        </p>
      </FormField>

      <FormField label="What goals can you help mentees achieve?" required isDark={isDark}>
        <TextArea
          isDark={isDark}
          rows={3}
          maxLength={300}
          value={data.menteGoals}
          onChange={(e) => setData((p) => ({ ...p, menteGoals: e.target.value }))}
          placeholder="e.g. Land their first internship, improve coding skills, build a portfolio..."
        />
      </FormField>

      <FormField label="Average session duration" isDark={isDark}>
        <Select
          isDark={isDark}
          value={data.sessionDuration}
          onChange={(e) => setData((p) => ({ ...p, sessionDuration: e.target.value }))}
        >
          <option value="30">30 minutes</option>
          <option value="45">45 minutes</option>
          <option value="60">1 hour</option>
          <option value="90">1.5 hours</option>
          <option value="120">2 hours</option>
        </Select>
      </FormField>
    </div>
  );
}

function Step4Review({ data, user, isDark }) {
  const profile = user?.profile ?? {};
  const name = `${data.firstName} ${data.lastName}`.trim() || profile.displayName;
  const catLabel = CATEGORIES.find((c) => c.value === data.category)?.label ?? data.category;

  const ReviewRow = ({ label, value }) => (
    <div className={`flex items-start justify-between border-b py-2.5 last:border-0 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
      <span className={isDark ? "text-slate-500 text-sm" : "text-slate-500 text-sm"}>{label}</span>
      <span className={`max-w-[60%] text-right text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className={`mb-0.5 text-lg font-bold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          Review Your Application
        </h3>
        <p className={isDark ? "text-slate-500 text-sm" : "text-slate-500 text-sm"}>
          Confirm everything looks right before submitting.
        </p>
      </div>

      <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
        <div className={`flex items-center gap-2 border-b px-5 py-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <span className={`material-symbols-outlined text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>person</span>
          <h4 className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-800"}`}>Profile</h4>
        </div>
        <div className="px-5">
          <ReviewRow label="Name" value={name} />
          <ReviewRow label="Email" value={data.email} />
          <ReviewRow label="Department" value={data.department} />
          <ReviewRow label="Year" value={data.academicYear} />
        </div>
      </div>

      <div className={`overflow-hidden rounded-2xl border ${isDark ? "border-slate-800 bg-slate-900/50" : "border-slate-200 bg-white"}`}>
        <div className={`flex items-center gap-2 border-b px-5 py-3 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
          <span className={`material-symbols-outlined text-base ${isDark ? "text-slate-400" : "text-slate-500"}`}>school</span>
          <h4 className={`text-sm font-semibold ${isDark ? "text-slate-300" : "text-slate-800"}`}>Expertise</h4>
        </div>
        <div className="px-5">
          <ReviewRow label="Category" value={catLabel} />
          <ReviewRow
            label="Experience"
            value={EXPERIENCE_OPTIONS.find((o) => o.value === data.yearsExperience)?.label}
          />
          <ReviewRow
            label="Rate"
            value={Number(data.hourlyRate) === 0 ? "Free" : `PKR ${data.hourlyRate}/hr`}
          />
          <div className={`border-b py-2.5 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
            <p className={`mb-2 text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {data.expertise.map((skill) => (
                <span
                  key={skill}
                  className={`rounded-full px-2 py-0.5 text-[10px] ${
                    isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <div className="py-2.5">
            <p className={`mb-1 text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>Bio</p>
            <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>{data.bio}</p>
          </div>
        </div>
      </div>

      <div
        className={`flex items-start gap-3 rounded-xl border p-4 ${
          isDark ? "border-emerald-500/20 bg-emerald-500/5" : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <span className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-emerald-400">info</span>
        <div>
          <p className={isDark ? "text-emerald-300 font-semibold text-sm" : "text-emerald-700 font-semibold text-sm"}>
            What happens next?
          </p>
          <p className={`mt-1 text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            Your application will be reviewed by campus administrators — typically within 48 hours.
            You'll receive a notification once approved or if more information is needed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MentorRegistration() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const loading = useSelector(selectMentoringActionLoading);
  const myProfile = useSelector(selectMyMentorProfile);
  const isDark = useHomeTheme();

  const [step, setStep] = useState(1);
  const [error, setError] = useState("");

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) navigate("/mentors", { replace: true });
  }, [myProfile, navigate]);

  const [data, setData] = useState({
    firstName: user?.profile?.firstName ?? "",
    lastName: user?.profile?.lastName ?? "",
    email: user?.email ?? "",
    department: user?.academic?.department ?? "",
    academicYear: user?.academic?.year ?? "",
    linkedin: user?.profile?.linkedin ?? "",
    category: "technical",
    expertise: user?.profile?.skills ?? [],
    yearsExperience: "",
    bio: user?.profile?.bio ?? "",
    hourlyRate: "0",
    mentoringStyles: [],
    sessionFrequency: "",
    motivation: "",
    menteGoals: "",
    sessionDuration: "60",
  });

  const validate = () => {
    setError("");
    if (step === 1) {
      if (!data.firstName.trim()) return setError("First name is required."), false;
      if (!data.lastName.trim()) return setError("Last name is required."), false;
      if (!data.email.trim()) return setError("Email is required."), false;
    }
    if (step === 2) {
      if (data.expertise.length === 0) return setError("Add at least one skill or expertise area."), false;
      if (!data.bio.trim()) return setError("Please write a professional bio."), false;
      if (!data.yearsExperience) return setError("Select your years of experience."), false;
      const hourlyRate = Number(data.hourlyRate);
      if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
        return setError("Hourly rate must be a valid non-negative number."), false;
      }
      if (hourlyRate > 500) {
        return setError("Hourly rate cannot exceed PKR 500 per hour."), false;
      }
    }
    if (step === 3) {
      if (!data.motivation.trim()) return setError("Tell us your motivation for mentoring."), false;
      if (!data.menteGoals.trim()) return setError("Describe what goals you can help mentees achieve."), false;
      if (!data.sessionFrequency) return setError("Select your preferred session frequency."), false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep((s) => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setError("");
    const hourlyRate = Number(data.hourlyRate);
    if (Number.isNaN(hourlyRate) || hourlyRate < 0) {
      setError("Hourly rate must be a valid non-negative number.");
      setStep(2);
      return;
    }
    if (hourlyRate > 500) {
      setError("Hourly rate cannot exceed PKR 500 per hour.");
      setStep(2);
      return;
    }
    const payload = {
      bio: data.bio.trim(),
      expertise: data.expertise,
      categories: [data.category],
      hourlyRate,
      currency: "PKR",
    };
    try {
      await dispatch(registerAsMentorThunk(payload)).unwrap();
      navigate("/mentors?applied=1", { replace: true });
    } catch (err) {
      setError(err || "Failed to submit application. Please try again.");
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;
  const shellClassName = "theme-page min-h-screen";
  const cardClassName = "theme-surface";

  return (
    <div className={shellClassName}>
      <div className="theme-surface flex items-center justify-between border-x-0 border-t-0 px-4 py-4 sm:px-8">
        <Button onClick={() => navigate("/mentors")} variant="ghost" size="sm">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Mentors
        </Button>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-xl text-primary">school</span>
          <span className="text-sm font-semibold text-text-primary">Mentor Application</span>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <aside className="order-2 lg:order-1 lg:col-span-1">
            <div className={`sticky top-6 rounded-2xl border p-5 ${cardClassName}`}>
              <h2 className={isDark ? "text-slate-200 font-bold text-sm mb-5" : "text-slate-900 font-bold text-sm mb-5"}>
                Application Steps
              </h2>
              <div className="space-y-1">
                {STEPS.map((stepItem) => {
                  const status = step > stepItem.id ? "done" : step === stepItem.id ? "active" : "upcoming";
                  return (
                    <div
                      key={stepItem.id}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
                        status === "active"
                          ? isDark
                            ? "border border-slate-600/50 bg-slate-700/70"
                            : "border border-slate-200 bg-slate-50"
                          : status === "done"
                            ? "opacity-70"
                            : "opacity-40"
                      }`}
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          status === "done"
                            ? "bg-emerald-600 text-white"
                            : status === "active"
                              ? isDark
                                ? "bg-slate-600 text-slate-200 ring-2 ring-emerald-500/50"
                                : "bg-slate-200 text-slate-800 ring-2 ring-emerald-500/30"
                              : isDark
                                ? "bg-slate-800 text-slate-600"
                                : "bg-slate-100 text-slate-400"
                        }`}
                      >
                        {status === "done" ? (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        ) : (
                          stepItem.id
                        )}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${status === "active" ? (isDark ? "text-slate-100" : "text-slate-900") : isDark ? "text-slate-500" : "text-slate-500"}`}>
                          {stepItem.label}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className={`mt-5 border-t pt-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <div className={`mb-1.5 flex items-center justify-between text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  <span>Progress</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className={`h-1.5 overflow-hidden rounded-full ${isDark ? "bg-slate-900" : "bg-slate-200"}`}>
                  <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <div className={`mt-5 border-t pt-4 ${isDark ? "border-slate-800" : "border-slate-200"}`}>
                <p className={`mb-3 text-[10px] uppercase tracking-widest ${isDark ? "text-slate-600" : "text-slate-500"}`}>
                  Tips
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Be specific about your skills",
                    "A strong bio gets more bookings",
                    "Start with free sessions to build reputation",
                    "Reviewed within 48 hours of submission",
                  ].map((tip, i) => (
                    <li key={i} className={`flex items-start gap-2 text-xs ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                      <span className="material-symbols-outlined mt-0.5 shrink-0 text-[13px] text-emerald-500/60">
                        check_circle
                      </span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          <div className="order-1 space-y-6 lg:order-2 lg:col-span-2">
            <div className={`rounded-2xl border p-6 ${cardClassName}`}>
              {step === 1 && <Step1Profile data={data} setData={setData} user={user} isDark={isDark} />}
              {step === 2 && <Step2Expertise data={data} setData={setData} isDark={isDark} />}
              {step === 3 && <Step3Style data={data} setData={setData} isDark={isDark} />}
              {step === 4 && <Step4Review data={data} user={user} isDark={isDark} />}
            </div>

            {error && (
              <div
                className={`flex items-center gap-2 rounded-xl border p-4 text-sm ${
                  isDark
                    ? "border-red-500/25 bg-red-500/10 text-red-400"
                    : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                <span className="material-symbols-outlined shrink-0 text-lg">error</span>
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => (step === 1 ? navigate("/mentors") : handleBack())}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors ${
                  isDark
                    ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                {step === 1 ? "Cancel" : "← Back"}
              </button>

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500"
                >
                  Continue
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-7 py-2.5 text-sm font-bold text-white transition-colors hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-base">send</span>
                      Submit Application
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
