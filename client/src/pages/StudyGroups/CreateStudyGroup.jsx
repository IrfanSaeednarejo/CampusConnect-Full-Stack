import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  createStudyGroupThunk,
  selectStudyGroupActionLoading,
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";
import { toast } from "react-hot-toast";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SUBJECTS = [
  "Computer Science", "Mathematics", "Physics", "Engineering",
  "Chemistry", "Biology", "Psychology", "Economics", "Literature", "Other"
];

export default function CreateStudyGroup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const actionLoading = useSelector(selectStudyGroupActionLoading);
  const isAdmin = user?.roles?.includes("admin");

  const [form, setForm] = useState({
    name: "",
    subject: "",
    course: "",
    description: "",
    maxMembers: "20",
    requireJoinApproval: true,
    isPrivate: false,
    tags: "",
  });
  const [schedule, setSchedule] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ day: 1, startTime: "09:00", endTime: "10:00" });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const addSlot = () => {
    if (schedule.some(s => s.day === scheduleForm.day)) {
      toast.error("Already have a slot for this day");
      return;
    }
    setSchedule(p => [...p, { ...scheduleForm, recurring: true }]);
  };

  const removeSlot = (day) => setSchedule(p => p.filter(s => s.day !== day));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Group name is required");
    if (!form.subject) return toast.error("Please select a subject");

    const tagsArr = form.tags.split(",").map(t => t.trim().toLowerCase()).filter(Boolean);

    try {
      const result = await dispatch(createStudyGroupThunk({
        name: form.name.trim(),
        subject: form.subject,
        course: form.course.trim(),
        description: form.description.trim(),
        maxMembers: parseInt(form.maxMembers) || 20,
        requireJoinApproval: form.requireJoinApproval,
        isPrivate: form.isPrivate,
        tags: tagsArr,
        schedule,
      })).unwrap();
      toast.success(isAdmin ? "Study group created!" : "Request submitted for review!");
      navigate(`/study-groups/${result._id}`);
    } catch (err) {
      toast.error(err || "Failed to create study group");
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <div className="bg-[#0d1117] border-b border-[#30363d]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <button onClick={() => navigate("/study-groups")} className="flex items-center gap-1 text-[#8b949e] hover:text-[#c9d1d9] text-sm mb-5 transition-colors">
            <span className="material-symbols-outlined text-sm">arrow_back</span> Back
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#238636]/15 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-[#238636]">add_circle</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{isAdmin ? "Create Study Group" : "Request a Study Group"}</h1>
              <p className="text-[#8b949e] text-xs">{isAdmin ? "Create a new group for your campus" : "Submit a request — admin will review it"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Non-admin info banner */}
        {!isAdmin && (
          <div className="flex items-start gap-3 bg-[#1f6feb]/10 border border-[#1f6feb]/20 rounded-xl p-4">
            <span className="material-symbols-outlined text-[#58a6ff] shrink-0">info</span>
            <p className="text-[#58a6ff] text-sm">Your request will be reviewed by an administrator before becoming active. You'll be notified once it's approved.</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Info */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide">Basic Info</h2>

            <div>
              <label className="text-[#c9d1d9] text-sm font-medium block mb-1">Group Name <span className="text-[#f85149]">*</span></label>
              <input name="name" value={form.name} onChange={handleChange} required
                placeholder="e.g. Algorithms Study Club"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636]/60 transition-colors" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#c9d1d9] text-sm font-medium block mb-1">Subject <span className="text-[#f85149]">*</span></label>
                <select name="subject" value={form.subject} onChange={handleChange} required
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#238636]/60 transition-colors">
                  <option value="">Select subject</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#c9d1d9] text-sm font-medium block mb-1">Course Code</label>
                <input name="course" value={form.course} onChange={handleChange}
                  placeholder="e.g. CS301"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636]/60 transition-colors" />
              </div>
            </div>

            <div>
              <label className="text-[#c9d1d9] text-sm font-medium block mb-1">Description</label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={3}
                placeholder="What will this group study? What are the goals?"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636]/60 transition-colors resize-none" />
            </div>

            <div>
              <label className="text-[#c9d1d9] text-sm font-medium block mb-1">Tags <span className="text-[#8b949e] font-normal">(comma separated)</span></label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="algorithms, sorting, exam-prep"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#238636]/60 transition-colors" />
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide">Weekly Schedule</h2>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[#8b949e] text-xs block mb-1">Day</label>
                <select value={scheduleForm.day} onChange={e => setScheduleForm(p => ({ ...p, day: Number(e.target.value) }))}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#238636]/60">
                  {DAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[#8b949e] text-xs block mb-1">Start</label>
                <input type="time" value={scheduleForm.startTime} onChange={e => setScheduleForm(p => ({ ...p, startTime: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#238636]/60" />
              </div>
              <div>
                <label className="text-[#8b949e] text-xs block mb-1">End</label>
                <input type="time" value={scheduleForm.endTime} onChange={e => setScheduleForm(p => ({ ...p, endTime: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-3 py-2 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#238636]/60" />
              </div>
            </div>
            <button type="button" onClick={addSlot} className="flex items-center gap-1.5 text-sm text-[#238636] font-bold hover:text-[#2ea043] transition-colors">
              <span className="material-symbols-outlined text-sm">add</span> Add time slot
            </button>
            {schedule.length > 0 && (
              <div className="space-y-2">
                {schedule.map(s => (
                  <div key={s.day} className="flex items-center justify-between bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5">
                    <span className="text-[#c9d1d9] text-sm">{DAYS[s.day]} · {s.startTime}–{s.endTime}</span>
                    <button type="button" onClick={() => removeSlot(s.day)} className="text-[#f85149] hover:text-[#ff7b72] transition-colors">
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 space-y-4">
            <h2 className="text-white font-bold text-sm uppercase tracking-wide">Settings</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[#c9d1d9] text-sm font-medium block mb-1">Max Members</label>
                <input name="maxMembers" type="number" value={form.maxMembers} onChange={handleChange} min="2" max="1000"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#c9d1d9] focus:outline-none focus:border-[#238636]/60 transition-colors" />
              </div>
            </div>

            {[
              { name: "requireJoinApproval", label: "Require Join Approval", desc: "New members need your approval before accessing the group chat." },
              { name: "isPrivate", label: "Private Group", desc: "Group won't appear in public listings — only invited members can join." },
            ].map(opt => (
              <label key={opt.name} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5">
                  <input type="checkbox" name={opt.name} checked={form[opt.name]} onChange={handleChange} className="sr-only" />
                  <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${
                    form[opt.name] ? "bg-[#238636] border-[#238636]" : "bg-[#0d1117] border-[#30363d] group-hover:border-[#238636]/50"
                  }`}>
                    {form[opt.name] && <span className="material-symbols-outlined text-white text-xs">check</span>}
                  </div>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{opt.label}</p>
                  <p className="text-[#8b949e] text-xs">{opt.desc}</p>
                </div>
              </label>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button type="button" onClick={() => navigate("/study-groups")}
              className="flex-1 py-3 rounded-xl border border-[#30363d] text-[#8b949e] font-bold text-sm hover:bg-[#161b22] transition-all">
              Cancel
            </button>
            <button type="submit" disabled={actionLoading}
              className="flex-1 py-3 rounded-xl bg-[#238636] text-white font-bold text-sm hover:bg-[#2ea043] transition-all shadow-lg shadow-[#238636]/20 disabled:opacity-60 flex items-center justify-center gap-2">
              {actionLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>{isAdmin ? "Create Group" : "Submit Request"}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
