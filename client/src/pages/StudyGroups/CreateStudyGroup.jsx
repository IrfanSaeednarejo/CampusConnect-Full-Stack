import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import useHomeTheme from "@/hooks/useHomeTheme";
import {
  createStudyGroupThunk,
  selectStudyGroupActionLoading,
} from "../../redux/slices/studyGroupSlice";
import { useAuth } from "../../hooks/useAuth";
import {
  getStudyGroupTheme,
  studyGroupPageTitle,
  studyGroupSectionEyebrow,
} from "../../components/studyGroups/studyGroupTheme";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const SUBJECTS = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Engineering",
  "Chemistry",
  "Biology",
  "Psychology",
  "Economics",
  "Literature",
  "Other",
];

const optionRows = [
  {
    name: "requireJoinApproval",
    label: "Require Join Approval",
    desc: "New members need your approval before accessing the group chat.",
  },
  {
    name: "isPrivate",
    label: "Private Group",
    desc: "Group will stay hidden from public listings unless members are invited.",
  },
];

function SectionCard({ title, description, children, theme }) {
  return (
    <section className={`rounded-[28px] border p-6 sm:p-7 ${theme.surface}`}>
      <div className="mb-5 space-y-1">
        <p className={`${studyGroupSectionEyebrow} ${theme.muted}`}>{title}</p>
        {description && <p className={`text-sm ${theme.muted}`}>{description}</p>}
      </div>
      {children}
    </section>
  );
}

export default function CreateStudyGroup() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const actionLoading = useSelector(selectStudyGroupActionLoading);
  const isDark = useHomeTheme();
  const theme = getStudyGroupTheme(isDark);
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
  const [scheduleForm, setScheduleForm] = useState({
    day: 1,
    startTime: "09:00",
    endTime: "10:00",
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const addSlot = () => {
    if (schedule.some((slot) => slot.day === scheduleForm.day)) {
      toast.error("Already have a slot for this day");
      return;
    }
    setSchedule((prev) => [...prev, { ...scheduleForm, recurring: true }]);
  };

  const removeSlot = (day) => setSchedule((prev) => prev.filter((slot) => slot.day !== day));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Group name is required");
    if (!form.subject) return toast.error("Please select a subject");

    const tagsArr = form.tags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);

    try {
      const result = await dispatch(
        createStudyGroupThunk({
          name: form.name.trim(),
          subject: form.subject,
          course: form.course.trim(),
          description: form.description.trim(),
          maxMembers: parseInt(form.maxMembers, 10) || 20,
          requireJoinApproval: form.requireJoinApproval,
          isPrivate: form.isPrivate,
          tags: tagsArr,
          schedule,
        })
      ).unwrap();
      toast.success(isAdmin ? "Study group created!" : "Request submitted for review!");
      navigate(`/study-groups/${result._id}`);
    } catch (err) {
      toast.error(err || "Failed to create study group");
    }
  };

  return (
    <div className={`min-h-screen ${theme.page}`}>
      <div className={`border-b ${theme.hero}`}>
        <div className="mx-auto flex max-w-3xl flex-col gap-5 px-4 py-8 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate("/study-groups")}
            className={`flex items-center gap-2 text-sm font-medium transition-colors ${theme.muted} ${isDark ? "hover:text-white" : "hover:text-slate-900"}`}
          >
            <span className="material-symbols-outlined text-base">arrow_back</span>
            Back to groups
          </button>

          <div className={`rounded-[28px] border p-6 sm:p-7 ${theme.surface}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border ${theme.accentSurface}`}>
                  <span className={`material-symbols-outlined text-[22px] ${theme.iconAccent}`}>
                    add_circle
                  </span>
                </div>
                <div className="space-y-2">
                  <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${theme.accentSurface} ${theme.iconAccent}`}>
                    {isAdmin ? "Admin Create Flow" : "Approval Request"}
                  </div>
                  <h1 className={`${studyGroupPageTitle} ${theme.title}`}>
                    {isAdmin ? "Create Study Group" : "Request a Study Group"}
                  </h1>
                  <p className={`max-w-2xl text-sm sm:text-base ${theme.muted}`}>
                    {isAdmin
                      ? "Set up a collaborative group with a clean structure, clear schedule, and the right access controls."
                      : "Submit a study-group request with the focus area, schedule, and access preferences for admin review."}
                  </p>
                </div>
              </div>

              <div className={`rounded-2xl border px-4 py-3 text-sm ${theme.surfaceMuted}`}>
                <p className={`font-medium ${theme.title}`}>{schedule.length} weekly slot{schedule.length === 1 ? "" : "s"}</p>
                <p className={theme.muted}>Ready before launch</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        {!isAdmin && (
          <div className={`rounded-3xl border p-4 sm:p-5 ${theme.infoSurface}`}>
            <div className="flex items-start gap-3">
              <span className={`material-symbols-outlined mt-0.5 text-lg ${theme.infoText}`}>info</span>
              <div>
                <p className={`text-sm font-medium ${theme.title}`}>Review required</p>
                <p className={`mt-1 text-sm ${theme.infoText}`}>
                  Your request will be reviewed by an administrator before it becomes visible to members.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard
            title="Basic Info"
            description="Define the group identity, academic focus, and discoverability details."
            theme={theme}
          >
            <div className="space-y-5">
              <div>
                <label className={`mb-2 block text-sm font-medium ${theme.text}`}>
                  Group Name <span className={theme.dangerText}>*</span>
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  placeholder="Algorithms Study Club"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none ${theme.input}`}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={`mb-2 block text-sm font-medium ${theme.text}`}>
                    Subject <span className={theme.dangerText}>*</span>
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none ${theme.input}`}
                  >
                    <option value="">Select subject</option>
                    {SUBJECTS.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`mb-2 block text-sm font-medium ${theme.text}`}>Course Code</label>
                  <input
                    name="course"
                    value={form.course}
                    onChange={handleChange}
                    placeholder="CS301"
                    className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${theme.text}`}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="What will this group study, and what should members expect each week?"
                  className={`w-full resize-none rounded-2xl border px-4 py-3 text-sm transition focus:outline-none ${theme.input}`}
                />
              </div>

              <div>
                <label className={`mb-2 block text-sm font-medium ${theme.text}`}>
                  Tags <span className={`font-normal ${theme.muted}`}>(comma separated)</span>
                </label>
                <input
                  name="tags"
                  value={form.tags}
                  onChange={handleChange}
                  placeholder="algorithms, sorting, exam-prep"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none ${theme.input}`}
                />
              </div>
            </div>
          </SectionCard>

          <SectionCard
            title="Weekly Schedule"
            description="Add recurring slots so members know when the group meets."
            theme={theme}
          >
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className={`mb-2 block text-xs font-semibold uppercase tracking-[0.16em] ${theme.muted}`}>
                    Day
                  </label>
                  <select
                    value={scheduleForm.day}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, day: Number(e.target.value) }))
                    }
                    className={`w-full rounded-2xl border px-3.5 py-3 text-sm transition focus:outline-none ${theme.input}`}
                  >
                    {DAYS.map((day, index) => (
                      <option key={day} value={index}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`mb-2 block text-xs font-semibold uppercase tracking-[0.16em] ${theme.muted}`}>
                    Start
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.startTime}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, startTime: e.target.value }))
                    }
                    className={`w-full rounded-2xl border px-3.5 py-3 text-sm transition focus:outline-none ${theme.input}`}
                  />
                </div>

                <div>
                  <label className={`mb-2 block text-xs font-semibold uppercase tracking-[0.16em] ${theme.muted}`}>
                    End
                  </label>
                  <input
                    type="time"
                    value={scheduleForm.endTime}
                    onChange={(e) =>
                      setScheduleForm((prev) => ({ ...prev, endTime: e.target.value }))
                    }
                    className={`w-full rounded-2xl border px-3.5 py-3 text-sm transition focus:outline-none ${theme.input}`}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={addSlot}
                className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-medium transition ${theme.buttonSecondary}`}
              >
                <span className="material-symbols-outlined text-base">add</span>
                Add time slot
              </button>

              {schedule.length > 0 && (
                <div className="space-y-3">
                  {schedule.map((slot) => (
                    <div
                      key={slot.day}
                      className={`flex items-center justify-between rounded-2xl border px-4 py-3 ${theme.surfaceMuted}`}
                    >
                      <div>
                        <p className={`text-sm font-medium ${theme.title}`}>
                          {DAYS[slot.day]} - {slot.startTime} to {slot.endTime}
                        </p>
                        <p className={`text-xs ${theme.muted}`}>Recurring weekly session</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSlot(slot.day)}
                        className={`rounded-xl border p-2 transition ${theme.buttonDanger}`}
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </SectionCard>

          <SectionCard
            title="Settings"
            description="Choose membership limits and how access should work."
            theme={theme}
          >
            <div className="space-y-5">
              <div className="max-w-xs">
                <label className={`mb-2 block text-sm font-medium ${theme.text}`}>Max Members</label>
                <input
                  name="maxMembers"
                  type="number"
                  value={form.maxMembers}
                  onChange={handleChange}
                  min="2"
                  max="1000"
                  className={`w-full rounded-2xl border px-4 py-3 text-sm transition focus:outline-none ${theme.input}`}
                />
              </div>

              <div className="space-y-3">
                {optionRows.map((option) => (
                  <label
                    key={option.name}
                    className={`flex cursor-pointer items-start gap-4 rounded-2xl border p-4 transition ${theme.surfaceMuted} ${theme.hoverSurface}`}
                  >
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        name={option.name}
                        checked={form[option.name]}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <div
                        className={`flex h-5 w-5 items-center justify-center rounded-md border transition ${
                          form[option.name]
                            ? isDark
                              ? "border-[#238636] bg-[#238636]"
                              : "border-slate-900 bg-slate-900"
                            : isDark
                              ? "border-[#30363d] bg-[#0d1117]"
                              : "border-slate-300 bg-white"
                        }`}
                      >
                        {form[option.name] && (
                          <span className="material-symbols-outlined text-[12px] text-white">check</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className={`text-sm font-medium ${theme.title}`}>{option.label}</p>
                      <p className={`mt-1 text-xs ${theme.muted}`}>{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </SectionCard>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/study-groups")}
              className={`flex-1 rounded-2xl border px-5 py-3 text-sm font-medium transition ${theme.buttonSecondary}`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className={`flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${theme.buttonPrimary}`}
            >
              {actionLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Submitting...
                </>
              ) : isAdmin ? (
                "Create Group"
              ) : (
                "Submit Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
