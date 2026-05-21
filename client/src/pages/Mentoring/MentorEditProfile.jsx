import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyMentorProfile,
  updateMentorProfile,
  selectMyMentorProfile,
  selectMentoringActionLoading,
} from "../../redux/slices/mentoringSlice";
import Button from "../../components/common/Button";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";

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

function TagInput({ tags, setTags, placeholder }) {
  const isDark = useHomeTheme();
  const [inputVal, setInputVal] = useState("");

  const addTag = (val) => {
    const v = val.trim();
    if (!v || tags.includes(v)) return;
    setTags([...tags, v]);
    setInputVal("");
  };

  const removeTag = (t) => setTags(tags.filter((x) => x !== t));

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
      <div
        className={`min-h-[44px] rounded-xl px-3 py-2 transition-colors focus-within:border-primary ${
          isDark
            ? "border border-border-dark bg-background-dark"
            : "border border-border-light bg-surface-light"
        } flex flex-wrap gap-1.5`}
      >
        {tags.map((t) => (
          <span
            key={t}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs ${
              isDark
                ? "border-border-dark bg-surface-dark text-text-primary-dark"
                : "border-border-light bg-[rgb(var(--color-surface-muted-light)/1)] text-text-primary-light"
            }`}
          >
            {t}
            <button
              type="button"
              onClick={() => removeTag(t)}
              className={`ml-0.5 text-sm leading-none ${
                isDark
                  ? "text-slate-500 hover:text-danger"
                  : "text-slate-400 hover:text-danger"
              }`}
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => {
            if (inputVal.trim()) addTag(inputVal);
          }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className={`min-w-[100px] flex-1 bg-transparent text-sm focus:outline-none ${
            isDark
              ? "text-text-primary-dark placeholder:text-text-secondary-dark"
              : "text-text-primary-light placeholder:text-text-secondary-light"
          }`}
        />
      </div>
      <p
        className={`mt-1 text-xs ${
          isDark ? "text-text-secondary-dark" : "text-text-secondary-light"
        }`}
      >
        Press Enter or comma to add
      </p>
    </div>
  );
}

export default function MentorEditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isDark = useHomeTheme();
  const mentorProfile = useSelector(selectMyMentorProfile);
  const actionLoading = useSelector(selectMentoringActionLoading);

  const [form, setForm] = useState({
    bio: "",
    expertise: [],
    categories: [],
    hourlyRate: "0",
    currency: "PKR",
    isActive: true,
  });

  useEffect(() => {
    dispatch(fetchMyMentorProfile());
  }, [dispatch]);

  useEffect(() => {
    if (mentorProfile) {
      setForm({
        bio: mentorProfile.bio || "",
        expertise: mentorProfile.expertise || [],
        categories: mentorProfile.categories || [],
        hourlyRate: String(mentorProfile.hourlyRate || 0),
        currency: mentorProfile.currency || "PKR",
        isActive: mentorProfile.isActive !== false,
      });
    }
  }, [mentorProfile]);

  const toggleCategory = (cat) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(cat)
        ? prev.categories.filter((c) => c !== cat)
        : [...prev.categories, cat],
    }));
  };

  const handleSave = async () => {
    if (!form.bio.trim()) return toast.error("Bio is required.");
    if (form.expertise.length === 0)
      return toast.error("Add at least one expertise tag.");
    if (form.categories.length === 0)
      return toast.error("Select at least one category.");

    try {
      await dispatch(
        updateMentorProfile({
          bio: form.bio.trim(),
          expertise: form.expertise,
          categories: form.categories,
          hourlyRate: Number(form.hourlyRate) || 0,
          currency: form.currency,
          isActive: form.isActive,
        })
      ).unwrap();
      toast.success("Profile updated successfully!");
      navigate("/mentor/dashboard");
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };

  const pageClass = isDark
    ? "bg-background-dark text-text-primary-dark"
    : "bg-background-light text-text-primary-light";
  const cardClass = isDark
    ? "bg-surface-dark border-border-dark"
    : "bg-surface-light border-border-light shadow-[0_18px_40px_rgba(15,23,42,0.08)]";
  const inputClass = isDark
    ? "bg-background-dark border-border-dark text-text-primary-dark placeholder:text-text-secondary-dark"
    : "bg-surface-light border-border-light text-text-primary-light placeholder:text-text-secondary-light";

  if (!mentorProfile) {
    return (
      <div className={`flex h-full items-center justify-center p-10 ${pageClass}`}>
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!mentorProfile.verified) {
    return (
      <div
        className={`flex h-full min-h-[400px] flex-col items-center justify-center p-8 text-center ${pageClass}`}
      >
        <span className="material-symbols-outlined mb-4 text-5xl text-warning">
          lock_clock
        </span>
        <h2 className={`mb-2 text-xl font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
          Pending Verification
        </h2>
        <p className={`max-w-sm text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
          Profile editing will be available after admin verification.
        </p>
        <Button className="mt-6" variant="secondary" onClick={() => navigate("/mentor/dashboard")}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className={`flex min-h-full flex-col ${pageClass}`}>
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8 sm:px-8">
        <div>
          <button
            onClick={() => navigate("/mentor/dashboard")}
            className={`mb-4 flex items-center gap-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
              isDark
                ? "text-text-secondary-dark hover:text-text-primary-dark"
                : "text-text-secondary-light hover:text-text-primary-light"
            }`}
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </button>
          <h1 className={`text-2xl font-bold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
            Edit Mentor Profile
          </h1>
          <p className={`mt-1 text-sm ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
            Update your bio, expertise, categories, and hourly rate.
          </p>
        </div>

        <div className={`flex items-center justify-between rounded-xl border p-4 ${cardClass}`}>
          <div>
            <p className={`text-sm font-semibold ${isDark ? "text-text-primary-dark" : "text-text-primary-light"}`}>
              Profile Visibility
            </p>
            <p className={`mt-0.5 text-xs ${isDark ? "text-text-secondary-dark" : "text-text-secondary-light"}`}>
              When inactive, your profile won't appear in search results.
            </p>
          </div>
          <button
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            className={`relative h-6 w-12 rounded-full transition-colors ${
              form.isActive ? "bg-primary" : isDark ? "bg-slate-700" : "bg-slate-300"
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                form.isActive ? "translate-x-6" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Professional Bio <span className="text-danger">*</span>
          </label>
          <textarea
            rows={6}
            maxLength={500}
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Tell students about yourself, your experience, and why they should book with you..."
            className={`w-full resize-none rounded-xl border px-4 py-3 text-sm transition-colors focus:border-primary focus:outline-none ${inputClass}`}
          />
          <p className="text-right text-xs text-text-secondary-light">
            {form.bio.length}/500
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Expertise Tags <span className="text-danger">*</span>
          </label>
          <TagInput
            tags={form.expertise}
            setTags={(tags) => setForm((p) => ({ ...p, expertise: tags }))}
            placeholder="e.g. React, Python, Resume Writing..."
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Categories <span className="text-danger">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {CATEGORIES.map((cat) => {
              const active = form.categories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={`rounded-xl border px-3 py-2.5 text-left text-xs font-medium transition-all ${
                    active
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : isDark
                        ? "border-border-dark bg-background-dark text-text-secondary-dark hover:border-slate-500 hover:text-text-primary-dark"
                        : "border-border-light bg-surface-light text-text-secondary-light hover:border-slate-300 hover:text-text-primary-light"
                  }`}
                >
                  <span
                    className={`mr-2 ${
                      active
                        ? "text-primary"
                        : isDark
                          ? "text-text-secondary-dark"
                          : "text-text-secondary-light"
                    }`}
                  >
                    {active ? "✓" : "○"}
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={`text-sm font-medium ${isDark ? "text-slate-300" : "text-slate-700"}`}>
            Hourly Rate
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={form.hourlyRate}
              onChange={(e) => setForm((p) => ({ ...p, hourlyRate: e.target.value }))}
              className={`flex-1 rounded-xl border px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none ${inputClass}`}
            />
            <span className={`rounded-xl border px-4 py-2.5 text-sm font-medium ${cardClass} text-text-secondary-light`}>
              {form.currency}/hr
            </span>
          </div>
          {Number(form.hourlyRate) === 0 && (
            <p className="text-xs text-success">
              Free mentoring can help you build reputation.
            </p>
          )}
        </div>

        <div
          className={`mt-4 flex items-center gap-4 border-t pt-6 ${
            isDark ? "border-border-dark" : "border-border-light"
          }`}
        >
          <Button
            onClick={handleSave}
            disabled={actionLoading}
            variant="primary"
            className="flex-1 gap-2"
          >
            {actionLoading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              <>
                <span className="material-symbols-outlined">check</span>
                Save Changes
              </>
            )}
          </Button>
          <Button
            onClick={() => navigate("/mentor/dashboard")}
            disabled={actionLoading}
            variant="secondary"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}
