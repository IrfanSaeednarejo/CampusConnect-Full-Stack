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

// ── Constants ──────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "technical",        label: "Technical / Coding" },
  { value: "academic",         label: "Academic" },
  { value: "career",           label: "Career Guidance" },
  { value: "entrepreneurship", label: "Entrepreneurship" },
  { value: "wellness",         label: "Wellness & Mental Health" },
  { value: "creative",         label: "Creative Arts" },
  { value: "professional",     label: "Professional Development" },
  { value: "other",            label: "Other" },
];

const EXPERIENCE_OPTIONS = [
  { value: "0-1", label: "0–1 year" },
  { value: "1-3", label: "1–3 years" },
  { value: "3-5", label: "3–5 years" },
  { value: "5-10", label: "5–10 years" },
  { value: "10+",  label: "10+ years" },
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
  { id: 1, label: "Your Profile",   icon: "person" },
  { id: 2, label: "Expertise",      icon: "school" },
  { id: 3, label: "Mentoring Style",icon: "psychology" },
  { id: 4, label: "Review & Submit",icon: "done_all" },
];

// ── Helper Sub-components ──────────────────────────────────────────────────────

function FormField({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-slate-300 text-sm font-medium mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-slate-600 text-xs mt-1">{hint}</p>}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  );
}

function TextArea({ ...props }) {
  return (
    <textarea
      {...props}
      className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 placeholder-slate-600 text-sm focus:outline-none focus:border-slate-500 transition-colors resize-none"
    />
  );
}

function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="w-full px-3 py-2.5 bg-slate-900/60 border border-slate-700 rounded-xl text-slate-200 text-sm focus:outline-none focus:border-slate-500 transition-colors"
    >
      {children}
    </select>
  );
}

function TagInput({ tags, setTags, placeholder }) {
  const [inputVal, setInputVal] = useState("");

  const addTag = (val) => {
    const v = val.trim();
    if (!v || tags.includes(v)) return;
    setTags([...tags, v]);
    setInputVal("");
  };

  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const handleKey = (e) => {
    if ((e.key === "Enter" || e.key === ",") && inputVal.trim()) {
      e.preventDefault();
      addTag(inputVal);
    } else if (e.key === "Backspace" && !inputVal && tags.length) {
      removeTag(tags[tags.length - 1]);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 min-h-[40px] px-3 py-2 bg-slate-900/60 border border-slate-700 rounded-xl focus-within:border-slate-500 transition-colors">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
            {t}
            <button type="button" onClick={() => removeTag(t)} className="text-slate-500 hover:text-slate-200">×</button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => addTag(inputVal)}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[80px] bg-transparent text-slate-200 placeholder-slate-600 text-sm focus:outline-none"
        />
      </div>
      <p className="text-slate-600 text-xs mt-1">Press Enter or comma to add tags</p>
    </div>
  );
}

// ── Step Components ────────────────────────────────────────────────────────────

function Step1Profile({ data, setData, user }) {
  const profile = user?.profile ?? {};
  const academic = user?.academic ?? {};

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-slate-100 font-bold text-lg mb-0.5">Profile Information</h3>
        <p className="text-slate-500 text-sm">We've pre-filled this from your profile. Update if needed.</p>
      </div>

      {/* Avatar preview */}
      <div className="flex items-center gap-4 p-4 bg-slate-900/50 border border-slate-800 rounded-xl">
        {profile.avatar ? (
          <img src={profile.avatar} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-slate-700" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-slate-700 flex items-center justify-center text-white font-bold text-xl">
            {(profile.displayName ?? profile.firstName ?? "?").slice(0, 2).toUpperCase()}
          </div>
        )}
        <div>
          <p className="text-slate-200 font-semibold">{profile.displayName ?? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim()}</p>
          <p className="text-slate-500 text-xs">{user?.email}</p>
          <p className="text-slate-600 text-xs mt-0.5">{academic.department} {academic.degree && `· ${academic.degree}`}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="First Name" required>
          <Input value={data.firstName} onChange={e => setData(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" />
        </FormField>
        <FormField label="Last Name" required>
          <Input value={data.lastName} onChange={e => setData(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" />
        </FormField>
      </div>

      <FormField label="Email" required>
        <Input type="email" value={data.email} disabled placeholder="Your email" />
      </FormField>

      <FormField label="Department / Major">
        <Input value={data.department} onChange={e => setData(p => ({ ...p, department: e.target.value }))} placeholder="e.g. Computer Science" />
      </FormField>

      <FormField label="Current Year / Status">
        <Select value={data.academicYear} onChange={e => setData(p => ({ ...p, academicYear: e.target.value }))}>
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

      <FormField label="LinkedIn Profile (Optional)">
        <Input
          type="url"
          value={data.linkedin}
          onChange={e => setData(p => ({ ...p, linkedin: e.target.value }))}
          placeholder="https://linkedin.com/in/your-profile"
        />
      </FormField>
    </div>
  );
}

function Step2Expertise({ data, setData }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-slate-100 font-bold text-lg mb-0.5">Your Expertise</h3>
        <p className="text-slate-500 text-sm">Tell us what you can best teach and guide others in.</p>
      </div>

      <FormField label="Primary Category" required>
        <Select value={data.category} onChange={e => setData(p => ({ ...p, category: e.target.value }))}>
          {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </Select>
      </FormField>

      <FormField label="Skills & Expertise Areas" required hint="These appear as searchable tags on your profile">
        <TagInput tags={data.expertise} setTags={tags => setData(p => ({ ...p, expertise: tags }))} placeholder="e.g. React, Python, Resume Writing…" />
      </FormField>

      <FormField label="Years of Relevant Experience" required>
        <Select value={data.yearsExperience} onChange={e => setData(p => ({ ...p, yearsExperience: e.target.value }))}>
          <option value="">Select experience</option>
          {EXPERIENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </FormField>

      <FormField label="Professional Bio" required hint="Max 500 characters — make a strong first impression">
        <TextArea
          rows={5}
          maxLength={500}
          value={data.bio}
          onChange={e => setData(p => ({ ...p, bio: e.target.value }))}
          placeholder="Describe your background, achievements, and what makes you a great mentor…"
        />
        <p className="text-slate-600 text-xs mt-1 text-right">{data.bio.length}/500</p>
      </FormField>

      <FormField label="Hourly Rate (PKR)" hint="Set to 0 for free mentoring">
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min="0"
            value={data.hourlyRate}
            onChange={e => setData(p => ({ ...p, hourlyRate: e.target.value }))}
            placeholder="0"
            className="flex-1"
          />
          <span className="text-slate-500 text-sm font-medium px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl">PKR/hr</span>
        </div>
        {Number(data.hourlyRate) === 0 && <p className="text-emerald-400 text-xs mt-1">✓ Free mentoring — great for getting started!</p>}
      </FormField>
    </div>
  );
}

function Step3Style({ data, setData }) {
  const toggleStyle = (s) => {
    setData(p => ({
      ...p,
      mentoringStyles: p.mentoringStyles.includes(s)
        ? p.mentoringStyles.filter(x => x !== s)
        : [...p.mentoringStyles, s],
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-slate-100 font-bold text-lg mb-0.5">Mentoring Approach</h3>
        <p className="text-slate-500 text-sm">Help students understand how you prefer to work.</p>
      </div>

      <FormField label="Preferred Mentoring Style(s)" hint="Select all that apply">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
          {MENTORING_STYLES.map(s => {
            const active = data.mentoringStyles.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleStyle(s)}
                className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  active
                    ? "bg-emerald-600/15 border-emerald-500/30 text-emerald-300"
                    : "bg-slate-900/50 border-slate-700 text-slate-500 hover:border-slate-600 hover:text-slate-300"
                }`}
              >
                <span className={`mr-2 ${active ? "text-emerald-400" : "text-slate-600"}`}>{active ? "✓" : "○"}</span>
                {s}
              </button>
            );
          })}
        </div>
      </FormField>

      <FormField label="Session Frequency" required>
        <Select value={data.sessionFrequency} onChange={e => setData(p => ({ ...p, sessionFrequency: e.target.value }))}>
          <option value="">Select frequency</option>
          <option value="weekly">Weekly sessions</option>
          <option value="biweekly">Bi-weekly sessions</option>
          <option value="monthly">Monthly sessions</option>
          <option value="on-demand">On-demand / As needed</option>
          <option value="flexible">Flexible</option>
        </Select>
      </FormField>

      <FormField label="What motivates you to become a mentor?" required hint="This is shared with admins during review">
        <TextArea
          rows={4}
          maxLength={400}
          value={data.motivation}
          onChange={e => setData(p => ({ ...p, motivation: e.target.value }))}
          placeholder="Describe why you want to mentor and how you plan to make an impact…"
        />
        <p className="text-slate-600 text-xs mt-1 text-right">{data.motivation.length}/400</p>
      </FormField>

      <FormField label="What goals can you help mentees achieve?" required>
        <TextArea
          rows={3}
          maxLength={300}
          value={data.menteGoals}
          onChange={e => setData(p => ({ ...p, menteGoals: e.target.value }))}
          placeholder="e.g. Land their first internship, improve coding skills, build a portfolio…"
        />
      </FormField>

      <FormField label="Average session duration">
        <Select value={data.sessionDuration} onChange={e => setData(p => ({ ...p, sessionDuration: e.target.value }))}>
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

function Step4Review({ data, user }) {
  const profile = user?.profile ?? {};
  const name = `${data.firstName} ${data.lastName}`.trim() || profile.displayName;
  const catLabel = CATEGORIES.find(c => c.value === data.category)?.label ?? data.category;

  const ReviewRow = ({ label, value }) => (
    <div className="flex justify-between items-start py-2.5 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-200 text-sm font-medium text-right max-w-[60%]">{value || "—"}</span>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-slate-100 font-bold text-lg mb-0.5">Review Your Application</h3>
        <p className="text-slate-500 text-sm">Confirm everything looks right before submitting.</p>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-base">person</span>
          <h4 className="text-slate-300 font-semibold text-sm">Profile</h4>
        </div>
        <div className="px-5">
          <ReviewRow label="Name"       value={name} />
          <ReviewRow label="Email"      value={data.email} />
          <ReviewRow label="Department" value={data.department} />
          <ReviewRow label="Year"       value={data.academicYear} />
        </div>
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800 flex items-center gap-2">
          <span className="material-symbols-outlined text-slate-400 text-base">school</span>
          <h4 className="text-slate-300 font-semibold text-sm">Expertise</h4>
        </div>
        <div className="px-5">
          <ReviewRow label="Category"   value={catLabel} />
          <ReviewRow label="Experience" value={EXPERIENCE_OPTIONS.find(o => o.value === data.yearsExperience)?.label} />
          <ReviewRow label="Rate"       value={Number(data.hourlyRate) === 0 ? "Free" : `PKR ${data.hourlyRate}/hr`} />
          <div className="py-2.5 border-b border-slate-800">
            <p className="text-slate-500 text-sm mb-2">Skills</p>
            <div className="flex flex-wrap gap-1.5">
              {data.expertise.map(s => (
                <span key={s} className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{s}</span>
              ))}
            </div>
          </div>
          <div className="py-2.5">
            <p className="text-slate-500 text-sm mb-1">Bio</p>
            <p className="text-slate-300 text-xs leading-relaxed">{data.bio}</p>
          </div>
        </div>
      </div>

      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl flex items-start gap-3">
        <span className="material-symbols-outlined text-emerald-400 text-xl shrink-0 mt-0.5">info</span>
        <div>
          <p className="text-emerald-300 font-semibold text-sm">What happens next?</p>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed">
            Your application will be reviewed by campus administrators — typically within 48 hours.
            You'll receive a notification once approved or if more information is needed.
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MentorRegistration() {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const user       = useSelector(selectUser);
  const loading    = useSelector(selectMentoringActionLoading);
  const myProfile  = useSelector(selectMyMentorProfile);

  const [step, setStep]   = useState(1);
  const [error, setError] = useState("");

  // Redirect if already a mentor
  useEffect(() => {
    dispatch(fetchMyMentorProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) navigate("/mentors", { replace: true });
  }, [myProfile, navigate]);

  // Form state — pre-fill from user profile
  const [data, setData] = useState({
    // Step 1
    firstName:    user?.profile?.firstName   ?? "",
    lastName:     user?.profile?.lastName    ?? "",
    email:        user?.email                ?? "",
    department:   user?.academic?.department ?? "",
    academicYear: user?.academic?.year       ?? "",
    linkedin:     user?.profile?.linkedin    ?? "",
    // Step 2
    category:       "technical",
    expertise:      user?.profile?.skills ?? [],
    yearsExperience: "",
    bio:             user?.profile?.bio ?? "",
    hourlyRate:      "0",
    // Step 3
    mentoringStyles:   [],
    sessionFrequency:  "",
    motivation:        "",
    menteGoals:        "",
    sessionDuration:   "60",
  });

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    setError("");
    if (step === 1) {
      if (!data.firstName.trim()) return setError("First name is required."), false;
      if (!data.lastName.trim())  return setError("Last name is required."), false;
      if (!data.email.trim())     return setError("Email is required."), false;
    }
    if (step === 2) {
      if (data.expertise.length === 0) return setError("Add at least one skill or expertise area."), false;
      if (!data.bio.trim())            return setError("Please write a professional bio."), false;
      if (!data.yearsExperience)       return setError("Select your years of experience."), false;
    }
    if (step === 3) {
      if (!data.motivation.trim())    return setError("Tell us your motivation for mentoring."), false;
      if (!data.menteGoals.trim())    return setError("Describe what goals you can help mentees achieve."), false;
      if (!data.sessionFrequency)     return setError("Select your preferred session frequency."), false;
    }
    return true;
  };

  const handleNext = () => {
    if (!validate()) return;
    setStep(s => Math.min(s + 1, 4));
  };

  const handleBack = () => {
    setError("");
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setError("");
    const payload = {
      bio:        data.bio.trim(),
      expertise:  data.expertise,
      categories: [data.category],
      hourlyRate: Number(data.hourlyRate) || 0,
      currency:   "PKR",
      // Extra fields go into bio context (backend stores just core fields)
    };
    try {
      await dispatch(registerAsMentorThunk(payload)).unwrap();
      navigate("/mentors?applied=1", { replace: true });
    } catch (err) {
      setError(err || "Failed to submit application. Please try again.");
    }
  };

  const progress = ((step - 1) / (STEPS.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Top bar */}
      <div className="border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/mentors")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Back to Mentors
        </button>
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-emerald-400 text-xl">school</span>
          <span className="text-slate-200 font-semibold text-sm">Mentor Application</span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── LEFT: Steps sidebar ─────────────────────────────────────────── */}
          <aside className="lg:col-span-1 order-2 lg:order-1">
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-5 sticky top-6">
              <h2 className="text-slate-200 font-bold text-sm mb-5">Application Steps</h2>
              <div className="space-y-1">
                {STEPS.map((s) => {
                  const status = step > s.id ? "done" : step === s.id ? "active" : "upcoming";
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                        status === "active"   ? "bg-slate-700/70 border border-slate-600/50" :
                        status === "done"     ? "opacity-70" : "opacity-40"
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        status === "done"   ? "bg-emerald-600 text-white" :
                        status === "active" ? "bg-slate-600 text-slate-200 ring-2 ring-emerald-500/50" :
                        "bg-slate-800 text-slate-600"
                      }`}>
                        {status === "done" ? (
                          <span className="material-symbols-outlined text-[13px]">check</span>
                        ) : s.id}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${status === "active" ? "text-slate-100" : "text-slate-500"}`}>{s.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Progress */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span>Progress</span><span>{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-slate-900 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
              </div>

              {/* Tips panel */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <p className="text-slate-600 text-[10px] uppercase tracking-widest mb-3">Tips</p>
                <ul className="space-y-2.5">
                  {[
                    "Be specific about your skills",
                    "A strong bio gets more bookings",
                    "Start with free sessions to build reputation",
                    "Reviewed within 48 hours of submission",
                  ].map((tip, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-500">
                      <span className="material-symbols-outlined text-emerald-500/60 text-[13px] mt-0.5 shrink-0">check_circle</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>

          {/* ── RIGHT: Form ─────────────────────────────────────────────────── */}
          <div className="lg:col-span-2 order-1 lg:order-2 space-y-6">
            {/* Form card */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6">
              {/* Step content */}
              {step === 1 && <Step1Profile   data={data} setData={setData} user={user} />}
              {step === 2 && <Step2Expertise data={data} setData={setData} />}
              {step === 3 && <Step3Style     data={data} setData={setData} />}
              {step === 4 && <Step4Review    data={data} user={user} />}
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-lg shrink-0">error</span>
                {error}
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => step === 1 ? navigate("/mentors") : handleBack()}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl border border-slate-700 transition-colors"
              >
                {step === 1 ? "Cancel" : "← Back"}
              </button>

              {step < 4 ? (
                <button
                  onClick={handleNext}
                  className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2"
                >
                  Continue
                  <span className="material-symbols-outlined text-base">arrow_forward</span>
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-7 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 min-w-[180px] justify-center"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
                  ) : (
                    <><span className="material-symbols-outlined text-base">send</span> Submit Application</>
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
