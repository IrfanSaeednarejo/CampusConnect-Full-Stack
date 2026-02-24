import { useDispatch, useSelector } from "react-redux";
import {
  addStudyGroup,
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
      const newGroup = {
        id: allGroups.length > 0 ? Math.max(...allGroups.map((g) => g.id)) + 1 : 1,
        name: values.name,
        course: values.course,
        description: values.description,
        meetingSchedule: values.meetingSchedule || "TBD",
        maxMembers: values.maxMembers ? parseInt(values.maxMembers) : null,
        members: 1,
        category: getCategoryFromCourse(values.course),
      };

      dispatch(addStudyGroup(newGroup));
      showSuccess("Study group created successfully!");
      goTo("/study-groups");
    } catch (error) {
      showError("Failed to create study group");
      console.error("Create group error:", error);
    }
  };

  const { values, handleChange, handleSubmit: onSubmit } = useFormState(
    {
      name: "",
      course: "",
      description: "",
      meetingSchedule: "",
      maxMembers: "",
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
            <FormField
              label="Meeting Schedule"
              name="meetingSchedule"
              value={values.meetingSchedule}
              onChange={handleChange}
              placeholder="e.g., Thursdays at 6 PM in Library Room 203"
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
              helpText="Leave blank for unlimited members"
            />

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
