import React from "react";
import PropTypes from "prop-types";
import Input from "../common/Input";
import Button from "../common/Button";

/**
 * StudyGroupForm Component
 * Reusable form for creating or editing a study group
 */
const StudyGroupForm = ({ formData, onChange, onSubmit, saving, onCancel }) => (
  <form className="flex flex-col gap-6" onSubmit={onSubmit}>
    <Input
      label="Group Name"
      name="name"
      value={formData.name}
      onChange={onChange}
      placeholder="e.g., CS101 Final Exam Prep"
      required
      className="h-12"
      containerClassName="w-full"
    />
    <Input
      label="Course/Subject"
      name="course"
      value={formData.course}
      onChange={onChange}
      placeholder="Search for a course like 'CS101'"
      required
      className="h-12"
      containerClassName="w-full"
    />
    <Input
      label="Description"
      name="description"
      value={formData.description}
      onChange={onChange}
      placeholder="Describe the group's goals, study methods, or member expectations."
      required
      as="textarea"
      className="min-h-32"
      containerClassName="w-full"
    />
    <Input
      label="Schedule"
      name="schedule"
      value={formData.schedule}
      onChange={onChange}
      placeholder="e.g., Tuesdays at 4 PM, Library Room 3"
      required
      className="h-12"
      containerClassName="w-full"
    />
    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
      <Button
        variant="ghost"
        type="button"
        onClick={onCancel}
        className="h-11 px-6"
      >
        Cancel
      </Button>
      <Button
        variant="success"
        type="submit"
        loading={saving}
        className="h-11 px-6"
      >
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  </form>
);

StudyGroupForm.propTypes = {
  formData: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  saving: PropTypes.bool,
  onCancel: PropTypes.func.isRequired,
};

export default StudyGroupForm;
