import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectStudyGroupById,
  updateStudyGroup,
} from "../../redux/slices/studyGroupSlice";
import { useFormState, useNavigation } from "../../hooks";
import { useNotification } from "../../contexts/NotificationContext.jsx";
import PageHeader from "../../components/common/PageHeader";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import Sidebar from "../../components/layout/Sidebar";
import Card from "../../components/common/Card";
import PageContent from "../../components/common/PageContent";

export default function EditStudyGroup() {
  const { goTo } = useNavigation();
  const dispatch = useDispatch();
  const { id } = useParams();
  const { showSuccess, showError } = useNotification();

  const group = useSelector(selectStudyGroupById(id));

  const handleSubmit = async (values) => {
    try {
      const updateData = {
        name: values.name,
        course: values.course,
        description: values.description,
        meetingSchedule: values.meetingSchedule || "TBD",
        maxMembers: values.maxMembers ? parseInt(values.maxMembers) : null,
      };

      await dispatch(updateStudyGroup({ id, data: updateData })).unwrap();
      showSuccess("Study group updated successfully!");
      goTo(`/study-groups/${id}`);
    } catch (error) {
      showError(error || "Failed to update study group");
      console.error("Update group error:", error);
    }
  };

  const { values, setFormValues, handleChange, handleSubmit: onSubmit } = useFormState(
    {
      name: "",
      course: "",
      description: "",
      meetingSchedule: "",
      maxMembers: "",
    },
    handleSubmit
  );

  useEffect(() => {
    if (group) {
      setFormValues({
        name: group.name || "",
        course: group.course || "",
        description: group.description || "",
        meetingSchedule: group.meetingSchedule || "",
        maxMembers: group.maxMembers ? group.maxMembers.toString() : "",
      });
    }
  }, [group, setFormValues]);

  return (
    <div className="flex h-screen bg-[#0d1117]">
      {/* Unified Sidebar */}
      <Sidebar />

      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {/* Header */}
        <PageHeader
          title="Edit Study Group"
          subtitle="Update your study group details"
          icon="edit"
          backPath={`/study-groups/${id}`}
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
              />

              {/* Course Code */}
              <FormField
                label="Course Code"
                name="course"
                value={values.course}
                onChange={handleChange}
                required
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
              />

              {/* Meeting Schedule */}
              <FormField
                label="Meeting Schedule"
                name="meetingSchedule"
                value={values.meetingSchedule}
                onChange={handleChange}
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
              />

              {/* Action Buttons */}
              <FormActions
                onCancel={() => goTo(`/study-groups/${id}`)}
                submitLabel="Save Changes"
              />
            </form>
          </Card>
        </PageContent>
      </div>
    </div>
  );
}
