import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchMyMentorProfile,
  updateMentorProfile,
  selectMyMentorProfile,
  selectMentoringActionLoading,
} from "../../redux/slices/mentoringSlice";
import { toast } from "react-hot-toast";

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

// ── Helper Sub-components ──────────────────────────────────────────────────────

function TagInput({ tags, setTags, placeholder }) {
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
      <div className="flex flex-wrap gap-1.5 min-h-[44px] px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-xl focus-within:border-emerald-500 transition-colors">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 text-xs bg-[#21262d] text-slate-300 px-2.5 py-1 rounded-full border border-[#30363d]">
            {t}
            <button type="button" onClick={() => removeTag(t)} className="text-slate-500 hover:text-red-400 ml-0.5 text-sm leading-none">&times;</button>
          </span>
        ))}
        <input
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={handleKey}
          onBlur={() => { if (inputVal.trim()) addTag(inputVal); }}
          placeholder={tags.length === 0 ? placeholder : ""}
          className="flex-1 min-w-[100px] bg-transparent text-white placeholder-slate-600 text-sm focus:outline-none"
        />
      </div>
      <p className="text-slate-600 text-xs mt-1">Press Enter or comma to add</p>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function MentorEditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
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
    if (form.expertise.length === 0) return toast.error("Add at least one expertise tag.");
    if (form.categories.length === 0) return toast.error("Select at least one category.");

    try {
      await dispatch(updateMentorProfile({
        bio: form.bio.trim(),
        expertise: form.expertise,
        categories: form.categories,
        hourlyRate: Number(form.hourlyRate) || 0,
        currency: form.currency,
        isActive: form.isActive,
      })).unwrap();
      toast.success("Profile updated successfully!");
      navigate("/mentor/dashboard");
    } catch (err) {
      toast.error(err || "Failed to update profile");
    }
  };

  // ── Guard ──
  if (!mentorProfile) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0d1117] p-10">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!mentorProfile.verified) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 text-center bg-[#0d1117]">
        <span className="material-symbols-outlined text-amber-400 text-5xl mb-4">lock_clock</span>
        <h2 className="text-white text-xl font-bold mb-2">Pending Verification</h2>
        <p className="text-slate-500 text-sm max-w-sm">Profile editing will be available after admin verification.</p>
        <button onClick={() => navigate("/mentor/dashboard")} className="mt-6 px-5 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-500 transition-colors">
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#0d1117]">
      <div className="max-w-3xl mx-auto w-full px-4 sm:px-8 py-8 flex flex-col gap-6">

        {/* Header */}
        <div>
          <button onClick={() => navigate("/mentor/dashboard")} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-4">
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Mentor Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Update your bio, expertise, categories, and hourly rate.</p>
        </div>

        {/* Active Toggle */}
        <div className="p-4 bg-[#161b22] border border-[#30363d] rounded-xl flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Profile Visibility</p>
            <p className="text-slate-600 text-xs mt-0.5">When inactive, your profile won't appear in search results.</p>
          </div>
          <button
            onClick={() => setForm((p) => ({ ...p, isActive: !p.isActive }))}
            className={`relative w-12 h-6 rounded-full transition-colors ${form.isActive ? "bg-emerald-600" : "bg-slate-700"}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.isActive ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-300 text-sm font-medium">Professional Bio <span className="text-red-400">*</span></label>
          <textarea
            rows={6}
            maxLength={500}
            value={form.bio}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
            placeholder="Tell students about yourself, your experience, and why they should book with you…"
            className="w-full px-4 py-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-white placeholder-slate-600 text-sm focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          />
          <p className="text-slate-600 text-xs text-right">{form.bio.length}/500</p>
        </div>

        {/* Expertise */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-300 text-sm font-medium">Expertise Tags <span className="text-red-400">*</span></label>
          <TagInput
            tags={form.expertise}
            setTags={(tags) => setForm((p) => ({ ...p, expertise: tags }))}
            placeholder="e.g. React, Python, Resume Writing…"
          />
        </div>

        {/* Categories */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-300 text-sm font-medium">Categories <span className="text-red-400">*</span></label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const active = form.categories.includes(cat.value);
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => toggleCategory(cat.value)}
                  className={`text-left px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                    active
                      ? "bg-emerald-600/15 border-emerald-500/30 text-emerald-300"
                      : "bg-[#0d1117] border-[#30363d] text-slate-500 hover:border-slate-500 hover:text-slate-300"
                  }`}
                >
                  <span className={`mr-2 ${active ? "text-emerald-400" : "text-slate-600"}`}>{active ? "✓" : "○"}</span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hourly Rate */}
        <div className="flex flex-col gap-2">
          <label className="text-slate-300 text-sm font-medium">Hourly Rate</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="0"
              value={form.hourlyRate}
              onChange={(e) => setForm((p) => ({ ...p, hourlyRate: e.target.value }))}
              className="flex-1 px-4 py-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <span className="text-slate-500 text-sm font-medium px-4 py-2.5 bg-[#161b22] border border-[#30363d] rounded-xl">
              {form.currency}/hr
            </span>
          </div>
          {Number(form.hourlyRate) === 0 && (
            <p className="text-emerald-400 text-xs">✓ Free mentoring — great for building reputation!</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-4 border-t border-[#21262d] pt-6">
          <button
            onClick={handleSave}
            disabled={actionLoading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
          >
            {actionLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined">check</span>
                Save Changes
              </>
            )}
          </button>
          <button
            onClick={() => navigate("/mentor/dashboard")}
            disabled={actionLoading}
            className="px-6 py-3 bg-[#21262d] hover:bg-[#30363d] text-slate-300 font-bold rounded-xl transition-colors border border-[#30363d]"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
