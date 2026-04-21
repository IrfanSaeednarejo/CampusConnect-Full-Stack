import { useDispatch, useSelector } from "react-redux";
import {
  createStudyGroupThunk,
  selectAllStudyGroups,
} from "../../redux/slices/studyGroupSlice";
import { useFormState, useNavigation } from "../../hooks";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import PageContent from "../../components/common/PageContent";
import InfoBox from "../../components/common/InfoBox";
import SchedulePicker from "../../components/studyGroups/SchedulePicker";

const CATEGORY_MAP = {
  COMP: "Computer Science",
  PHYS: "Physics",
  MATH: "Mathematics",
  ENGG: "Engineering",
  CHEM: "Chemistry",
  PSYC: "Psychology",
};

function getCategoryFromCourse(courseCode) {
  const prefix = courseCode.substring(0, 4).toUpperCase();
  return CATEGORY_MAP[prefix] || "Other";
}

export default function CreateStudyGroup() {
  const { goTo } = useNavigation();
  const dispatch = useDispatch();
  const allGroups = useSelector(selectAllStudyGroups);
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (values) => {
    try {
      const payload = {
        name: values.name,
        course: values.course,
        subject: values.course,
        description: values.description,
        schedule: values.schedule,
        maxMembers: values.maxMembers ? parseInt(values.maxMembers) : 20,
        requireJoinApproval: values.requireJoinApproval,
      };

      const result = await dispatch(createStudyGroupThunk(payload)).unwrap();
      showSuccess(`Study group "${result.name}" created successfully!`);
      goTo(`/study-groups/${result._id}`);
    } catch (error) {
      showError(error || "Failed to create study group");
    }
  };

  const { values, handleChange, handleSubmit: onSubmit, setValue } = useFormState(
    {
      name: "",
      course: "",
      description: "",
      schedule: [],
      maxMembers: "",
      requireJoinApproval: false,
    },
    handleSubmit
  );

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      {/* Header */}
      <PageHeader
        title="Create Study Group"
        subtitle="Start a new study group for your course"
        icon="add_circle"
        backPath="/study-groups"
      />

      {/* Main Content */}
      <PageContent>
        <Card>
          <form onSubmit={onSubmit} className="space-y-6">
            {/* Group Name */}
            <FormField
              label="Group Name"
              name="name"
              value={values.name}
              onChange={handleChange}
              required
              placeholder="e.g., COMP1511 Exam Prep"
            />

            {/* Course Code */}
            <FormField
              label="Course Code"
              name="course"
              value={values.course}
              onChange={handleChange}
              required
              placeholder="e.g., COMP1511"
            />

            {/* Description */}
            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={values.description}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe the purpose and goals of your study group..."
            />

            {/* Meeting Schedule */}
            <SchedulePicker
              value={values.schedule}
              onChange={(newSchedule) => setValue('schedule', newSchedule)}
            />

            {/* Max Members */}
            <FormField
              label="Maximum Members"
              name="maxMembers"
              type="number"
              value={values.maxMembers}
              onChange={handleChange}
              min="2"
              max="50"
              placeholder="e.g., 20"
              helpText="Between 2 and 50 members"
            />

            {/* Approval Policy */}
            <div className="flex items-center gap-3 bg-[#1c2128] border border-[#30363d] p-4 rounded-xl">
               <input 
                  type="checkbox" 
                  id="requireJoinApproval"
                  name="requireJoinApproval"
                  checked={values.requireJoinApproval}
                  onChange={(e) => setValue('requireJoinApproval', e.target.checked)}
                  className="w-5 h-5 accent-[#238636]"
               />
               <div>
                  <label htmlFor="requireJoinApproval" className="font-bold text-white block">Require Join Approval</label>
                  <p className="text-xs text-[#8b949e]">New members will need your approval before they can join and chat.</p>
               </div>
            </div>

            {/* Info Box */}
            <InfoBox title="Group Guidelines">
              <ul className="list-disc list-inside space-y-1">
                <li>Be respectful and inclusive to all members</li>
                <li>Share knowledge and help each other succeed</li>
                <li>Maintain academic integrity standards</li>
              </ul>
            </InfoBox>

            {/* Action Buttons */}
            <FormActions
              onCancel={() => goTo("/study-groups")}
              submitLabel="Create Group"
            />
          </form>
        </Card>
      </PageContent>
    </div>
  );
}
