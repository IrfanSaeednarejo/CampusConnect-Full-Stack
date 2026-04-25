import { useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { createEventThunk, selectEventActionLoading, selectEventError } from "../../redux/slices/eventSlice";
import { selectUser } from "../../redux/slices/authSlice";
import { ShieldX, CheckCircle2, CalendarPlus, Upload, X, Plus, Trash2 } from "lucide-react";

import NexusDraftInput from "../../components/common/NexusDraftInput";

const EVENT_CATEGORIES = ["academic","cultural","sports","social","workshop","competition","networking","other"];
const EVENT_TYPES = ["general","hackathon","coding_competition","workshop","seminar"];
const VENUE_TYPES = ["physical","online","hybrid"];

const Field = ({ label, required, children, hint }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-sm font-semibold text-slate-300">
      {label}{required && <span className="text-red-400 ml-1">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-500">{hint}</p>}
  </div>
);

const inputCls = "w-full bg-slate-800/60 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all";

export default function CreateEventForm() {
  const { headSociety, societyId } = useOutletContext() ?? {};
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const actionLoading = useSelector(selectEventActionLoading);
  const sliceError = useSelector(selectEventError);

  const isHead = headSociety?.createdBy?._id === user?._id ||
    headSociety?.createdBy === user?._id;

  const [coverPreview, setCoverPreview] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [prizes, setPrizes] = useState([]);
  const [isCompetition, setIsCompetition] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "", description: "", category: "other", eventType: "general",
    startAt: "", endAt: "", registrationDeadline: "", submissionDeadline: "",
    venueType: "physical", venueAddress: "", venueOnlineUrl: "",
    participationType: "individual", maxCapacity: "", waitlistEnabled: false,
    requireApproval: false, feeAmount: "", feeCurrency: "PKR",
    teamMinSize: 1, teamMaxSize: 5, teamMaxTeams: 0, allowSoloInTeamEvent: false,
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const toLocalIso = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (isNaN(d)) return "";
    return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
  };

  const handleNexusDraft = (draft) => {
    setForm(prev => ({
        ...prev,
        title: draft.title || prev.title,
        description: draft.description || prev.description,
        category: draft.category || prev.category,
        eventType: draft.eventType || prev.eventType,
        startAt: draft.startAt ? toLocalIso(draft.startAt) : prev.startAt,
        endAt: draft.endAt ? toLocalIso(draft.endAt) : prev.endAt,
        venueType: draft.venueType || prev.venueType,
        venueAddress: draft.venueAddress || prev.venueAddress,
        venueOnlineUrl: draft.venueOnlineUrl || prev.venueOnlineUrl,
    }));
    
    if (draft.tags && Array.isArray(draft.tags)) {
        setTags(draft.tags.slice(0, 10)); // Max 10 tags
    }
  };

  const handleCover = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags(p => [...p, t]);
      setTagInput("");
    }
  };

  const addPrize = () => setPrizes(p => [...p, { rank: p.length + 1, prize: "", description: "" }]);
  const updatePrize = (i, k, v) => setPrizes(p => p.map((pr, idx) => idx === i ? { ...pr, [k]: v } : pr));
  const removePrize = (i) => setPrizes(p => p.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description || !form.startAt || !form.endAt || !form.venueType) {
      setError("Please fill all required fields."); return;
    }
    if (form.title.trim().length < 3) {
      setError("Event Title must be at least 3 characters."); return;
    }
    if (form.description.trim().length < 10) {
      setError("Description must be at least 10 characters."); return;
    }

    const fd = new FormData();
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("category", form.category);
    fd.append("eventType", form.eventType);
    fd.append("startAt", new Date(form.startAt).toISOString());
    fd.append("endAt", new Date(form.endAt).toISOString());
    fd.append("societyId", societyId);
    if (form.registrationDeadline) fd.append("registrationDeadline", new Date(form.registrationDeadline).toISOString());
    if (form.submissionDeadline) fd.append("submissionDeadline", new Date(form.submissionDeadline).toISOString());
    fd.append("venue", JSON.stringify({ type: form.venueType, address: form.venueAddress, onlineUrl: form.venueOnlineUrl }));
    fd.append("participationType", form.participationType);
    fd.append("isOnlineCompetition", isCompetition);
    if (form.maxCapacity) fd.append("maxCapacity", form.maxCapacity);
    fd.append("waitlistEnabled", form.waitlistEnabled);
    fd.append("requireApproval", form.requireApproval);
    fd.append("fee", JSON.stringify({ amount: Number(form.feeAmount) || 0, currency: form.feeCurrency }));
    fd.append("tags", JSON.stringify(tags));
    fd.append("prizePool", JSON.stringify(prizes));
    if (isCompetition) {
      fd.append("teamConfig", JSON.stringify({ minSize: Number(form.teamMinSize), maxSize: Number(form.teamMaxSize), maxTeams: Number(form.teamMaxTeams), allowSoloInTeamEvent: form.allowSoloInTeamEvent }));
    }
    if (coverFile) fd.append("coverImage", coverFile);
    const res = await dispatch(createEventThunk(fd));
    if (createEventThunk.fulfilled.match(res)) {
      setSuccess(true);
    } else {
      setError(res.payload || "Failed to create event.");
    }
  };

  if (!isHead) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldX className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-slate-100 font-bold text-xl mb-2">Access Restricted</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            Only the <span className="text-indigo-400 font-semibold">Society Head</span> can create events for this society. Co-coordinators and Executives can manage existing events but cannot create new ones.
          </p>
          <button onClick={() => navigate(`/society/${societyId}/events`)} className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl border border-slate-600 text-sm font-semibold transition-colors">
            Back to Events
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[60vh]">
        <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-12 text-center max-w-md">
          <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-slate-100 font-bold text-xl mb-2">Event Submitted for Review!</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-2">
            Your event has been submitted and is <span className="text-amber-400 font-semibold">pending admin approval</span>.
          </p>
          <p className="text-slate-500 text-xs mb-6">You will receive a notification once the admin reviews your event. It will not be visible to students until approved.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate(`/society/${societyId}/events?tab=pending`)} className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors">
              View Pending Events
            </button>
            <button onClick={() => { setSuccess(false); setForm({ title:"",description:"",category:"other",eventType:"general",startAt:"",endAt:"",registrationDeadline:"",submissionDeadline:"",venueType:"physical",venueAddress:"",venueOnlineUrl:"",participationType:"individual",maxCapacity:"",waitlistEnabled:false,requireApproval:false,feeAmount:"",feeCurrency:"PKR",teamMinSize:1,teamMaxSize:5,teamMaxTeams:0,allowSoloInTeamEvent:false }); setTags([]); setPrizes([]); setCoverPreview(null); setCoverFile(null); }} className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl border border-slate-600 text-sm font-semibold transition-colors">
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center">
          <CalendarPlus className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h1 className="text-slate-100 text-2xl font-bold">Create New Event</h1>
          <p className="text-slate-500 text-sm">Submit for admin approval before going live</p>
        </div>
      </div>

      <NexusDraftInput schemaType="event" onDraftComplete={handleNexusDraft} />

      {(error || sliceError) && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error || sliceError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: Basics */}
        <section className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-5">
          <h2 className="text-slate-200 font-semibold text-base border-b border-slate-700 pb-3">📋 Basic Information</h2>
          <Field label="Event Title" required>
            <input className={inputCls} placeholder="e.g. Annual Hackathon 2025" value={form.title} onChange={e => set("title", e.target.value)} required />
          </Field>
          <Field label="Description" required>
            <textarea className={inputCls + " resize-none min-h-[120px]"} placeholder="Describe the event, what to expect, who should attend..." value={form.description} onChange={e => set("description", e.target.value)} required />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Category" required>
              <select className={inputCls} value={form.category} onChange={e => set("category", e.target.value)}>
                {EVENT_CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
              </select>
            </Field>
            <Field label="Event Type" required>
              <select className={inputCls} value={form.eventType} onChange={e => set("eventType", e.target.value)}>
                {EVENT_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</option>)}
              </select>
            </Field>
          </div>
          <Field label="Tags" hint="Add up to 10 tags. Press Enter to add.">
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map(t => (
                <span key={t} className="flex items-center gap-1 px-2.5 py-1 bg-indigo-500/15 border border-indigo-500/30 rounded-lg text-indigo-300 text-xs font-medium">
                  {t} <button type="button" onClick={() => setTags(p => p.filter(x => x !== t))}><X className="w-3 h-3" /></button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input className={inputCls} placeholder="Type a tag..." value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(); }}} />
              <button type="button" onClick={addTag} className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl border border-slate-600 text-sm transition-colors"><Plus className="w-4 h-4" /></button>
            </div>
          </Field>
          <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-xl border border-slate-700">
            <input type="checkbox" id="isCompetition" checked={isCompetition} onChange={e => setIsCompetition(e.target.checked)} className="w-4 h-4 accent-indigo-500" />
            <label htmlFor="isCompetition" className="text-sm text-slate-300 font-medium cursor-pointer">This is an online competition (enables teams, submissions, leaderboard)</label>
          </div>
        </section>

        {/* Section 2: Dates & Venue */}
        <section className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-5">
          <h2 className="text-slate-200 font-semibold text-base border-b border-slate-700 pb-3">📅 Date & Venue</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Date & Time" required>
              <input type="datetime-local" className={inputCls} value={form.startAt} onChange={e => set("startAt", e.target.value)} required />
            </Field>
            <Field label="End Date & Time" required>
              <input type="datetime-local" className={inputCls} value={form.endAt} onChange={e => set("endAt", e.target.value)} required />
            </Field>
            <Field label="Registration Deadline">
              <input type="datetime-local" className={inputCls} value={form.registrationDeadline} onChange={e => set("registrationDeadline", e.target.value)} />
            </Field>
            {isCompetition && (
              <Field label="Submission Deadline">
                <input type="datetime-local" className={inputCls} value={form.submissionDeadline} onChange={e => set("submissionDeadline", e.target.value)} />
              </Field>
            )}
          </div>
          <Field label="Venue Type" required>
            <div className="flex gap-3">
              {VENUE_TYPES.map(v => (
                <button key={v} type="button" onClick={() => set("venueType", v)} className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${form.venueType === v ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}`}>{v}</button>
              ))}
            </div>
          </Field>
          {(form.venueType === "physical" || form.venueType === "hybrid") && (
            <Field label="Physical Address">
              <input className={inputCls} placeholder="Building, Room, Campus..." value={form.venueAddress} onChange={e => set("venueAddress", e.target.value)} />
            </Field>
          )}
          {(form.venueType === "online" || form.venueType === "hybrid") && (
            <Field label="Online URL">
              <input type="url" className={inputCls} placeholder="https://meet.google.com/..." value={form.venueOnlineUrl} onChange={e => set("venueOnlineUrl", e.target.value)} />
            </Field>
          )}
        </section>

        {/* Section 3: Participation & Fee */}
        <section className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-5">
          <h2 className="text-slate-200 font-semibold text-base border-b border-slate-700 pb-3">👥 Participation & Fee</h2>
          <Field label="Participation Type" required>
            <div className="flex gap-3">
              {["individual","team","both"].map(v => (
                <button key={v} type="button" onClick={() => set("participationType", v)} className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold capitalize transition-all ${form.participationType === v ? "bg-indigo-500/20 border-indigo-500 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500"}`}>{v}</button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Max Capacity" hint="0 = unlimited">
              <input type="number" min="0" className={inputCls} placeholder="0" value={form.maxCapacity} onChange={e => set("maxCapacity", e.target.value)} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fee Amount">
                <input type="number" min="0" className={inputCls} placeholder="0" value={form.feeAmount} onChange={e => set("feeAmount", e.target.value)} />
              </Field>
              <Field label="Currency">
                <input className={inputCls} placeholder="PKR" value={form.feeCurrency} onChange={e => set("feeCurrency", e.target.value)} />
              </Field>
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.waitlistEnabled} onChange={e => set("waitlistEnabled", e.target.checked)} className="w-4 h-4 accent-indigo-500" />
              <span className="text-sm text-slate-300">Enable Waitlist</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.requireApproval} onChange={e => set("requireApproval", e.target.checked)} className="w-4 h-4 accent-indigo-500" />
              <span className="text-sm text-slate-300">Require Registration Approval</span>
            </label>
          </div>
        </section>

        {/* Section 4: Competition Settings */}
        {isCompetition && (
          <section className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-5">
            <h2 className="text-slate-200 font-semibold text-base border-b border-slate-700 pb-3">🏆 Competition Settings</h2>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Min Team Size">
                <input type="number" min="1" className={inputCls} value={form.teamMinSize} onChange={e => set("teamMinSize", e.target.value)} />
              </Field>
              <Field label="Max Team Size">
                <input type="number" min="1" className={inputCls} value={form.teamMaxSize} onChange={e => set("teamMaxSize", e.target.value)} />
              </Field>
              <Field label="Max Teams" hint="0 = unlimited">
                <input type="number" min="0" className={inputCls} value={form.teamMaxTeams} onChange={e => set("teamMaxTeams", e.target.value)} />
              </Field>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.allowSoloInTeamEvent} onChange={e => set("allowSoloInTeamEvent", e.target.checked)} className="w-4 h-4 accent-indigo-500" />
              <span className="text-sm text-slate-300">Allow solo participants in team event</span>
            </label>
          </section>
        )}

        {/* Section 5: Prize Pool */}
        <section className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <h2 className="text-slate-200 font-semibold text-base">🎁 Prize Pool <span className="text-slate-500 font-normal text-sm">(optional)</span></h2>
            <button type="button" onClick={addPrize} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg border border-slate-600 text-xs font-semibold transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Prize
            </button>
          </div>
          {prizes.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No prizes added yet.</p>}
          {prizes.map((pr, i) => (
            <div key={i} className="grid grid-cols-[60px_1fr_1fr_36px] gap-3 items-start">
              <Field label={i === 0 ? "Rank" : ""}>
                <input type="number" min="1" className={inputCls} value={pr.rank} onChange={e => updatePrize(i, "rank", e.target.value)} />
              </Field>
              <Field label={i === 0 ? "Prize" : ""}>
                <input className={inputCls} placeholder="e.g. PKR 50,000 + Trophy" value={pr.prize} onChange={e => updatePrize(i, "prize", e.target.value)} />
              </Field>
              <Field label={i === 0 ? "Description" : ""}>
                <input className={inputCls} placeholder="Optional details..." value={pr.description} onChange={e => updatePrize(i, "description", e.target.value)} />
              </Field>
              <div className={i === 0 ? "pt-6" : ""}>
                <button type="button" onClick={() => removePrize(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </section>

        {/* Section 6: Cover Image */}
        <section className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-4">
          <h2 className="text-slate-200 font-semibold text-base border-b border-slate-700 pb-3">🖼️ Cover Image <span className="text-slate-500 font-normal text-sm">(optional)</span></h2>
          {coverPreview ? (
            <div className="relative rounded-xl overflow-hidden h-48">
              <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
              <button type="button" onClick={() => { setCoverPreview(null); setCoverFile(null); }} className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-indigo-500 hover:bg-indigo-500/5 transition-all">
              <Upload className="w-8 h-8 text-slate-500 mb-2" />
              <span className="text-slate-400 text-sm">Click to upload cover image</span>
              <span className="text-slate-600 text-xs mt-1">PNG, JPG up to 5MB</span>
              <input type="file" accept="image/*" className="hidden" onChange={handleCover} />
            </label>
          )}
        </section>

        {/* Submit */}
        <div className="flex gap-3 pb-8">
          <button type="button" onClick={() => navigate(`/society/${societyId}/events`)} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 font-semibold text-sm transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={actionLoading} className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2">
            {actionLoading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : (
              <><CalendarPlus className="w-4 h-4" /> Submit for Admin Approval</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
