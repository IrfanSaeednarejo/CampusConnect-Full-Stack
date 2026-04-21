import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";
import { createEventThunk, selectEventLoading, selectEventError } from "@/redux/slices/eventSlice";
import { selectAllSocieties, fetchSocieties } from "@/redux/slices/societySlice";
import { selectRole } from "@/redux/slices/authSlice";

const EVENT_CATEGORIES = [
  "academic", "cultural", "sports", "social",
  "workshop", "competition", "networking", "other",
];

const EVENT_TYPES = [
  "general", "hackathon", "coding_competition", "workshop", "seminar",
];

export default function CreateEvent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const loading = useSelector(selectEventLoading);
  const error = useSelector(selectEventError);
  const societies = useSelector(selectAllSocieties);
  const role = useSelector(selectRole);

  useEffect(() => {
    if (societies.length === 0) {
      dispatch(fetchSocieties());
    }
  }, [dispatch, societies.length]);

  const defaultSociety = societies.length > 0 ? societies[0]._id || societies[0].id : "";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "competition",
    eventType: "hackathon",
    societyId: defaultSociety,
    campusId: "",
    venueType: "physical",
    venueAddress: "",
    venueOnlineUrl: "",
    startAt: "",
    endAt: "",
    registrationDeadline: "",
    submissionDeadline: "",
    participationType: "individual",
    maxCapacity: 0,
    feeAmount: 0,
    feeCurrency: "PKR",
    coverImage: null,
  });

  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (defaultSociety && !formData.societyId) {
      setFormData(prev => ({ ...prev, societyId: defaultSociety }));
    }
  }, [defaultSociety, formData.societyId]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, coverImage: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const submitData = new FormData();
    submitData.append("title", formData.title);
    submitData.append("description", formData.description);
    submitData.append("category", formData.category);
    submitData.append("eventType", formData.eventType);
    submitData.append("societyId", formData.societyId);
    submitData.append("participationType", formData.participationType);
    
    if (formData.startAt) submitData.append("startAt", new Date(formData.startAt).toISOString());
    if (formData.endAt) submitData.append("endAt", new Date(formData.endAt).toISOString());
    if (formData.registrationDeadline) submitData.append("registrationDeadline", new Date(formData.registrationDeadline).toISOString());
    if (formData.submissionDeadline) submitData.append("submissionDeadline", new Date(formData.submissionDeadline).toISOString());
    
    submitData.append("maxCapacity", formData.maxCapacity.toString());
    
    // Send venue as JSON string to match backend expectations
    const venue = {
      type: formData.venueType,
      address: formData.venueAddress,
      onlineUrl: formData.venueOnlineUrl
    };
    submitData.append("venue", JSON.stringify(venue));

    // Send fee
    const fee = {
      amount: formData.feeAmount,
      currency: formData.feeCurrency
    };
    submitData.append("fee", JSON.stringify(fee));

    if (formData.coverImage) {
      submitData.append("coverImage", formData.coverImage);
    }

    const resultAction = await dispatch(createEventThunk(submitData));
    if (createEventThunk.fulfilled.match(resultAction)) {
      navigate(`/events/${resultAction.payload?._id || resultAction.payload?.id}`);
    }
  };

  // We only want Society Heads or Admins to create events generally.
  if (role !== "society_head" && role !== "admin") {
    return (
      <div className="flex justify-center items-center h-screen bg-[#0d1117] text-white">
        Only Society Heads or Admins can create events.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      {/* Header */}
      <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="text-sm font-medium">Back</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-[#1dc964]">celebration</span>
              <div>
                <h1 className="text-2xl font-bold text-white">Create New Event</h1>
                <p className="text-sm text-[#8b949e]">Host a new activity for your society</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form
          onSubmit={handleSubmit}
          className="bg-[#161b22] border border-[#30363d] rounded-lg p-8"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <FormField
              label="Event Title"
              name="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g., Intro to Machine Learning"
              required
            />

            <FormField
              label="Description"
              name="description"
              type="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the event details..."
              rows={5}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Category"
                name="category"
                type="select"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {EVENT_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </FormField>

              <FormField
                label="Event Type"
                name="eventType"
                type="select"
                value={formData.eventType}
                onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                required
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type} value={type}>{type.replace("_", " ").toUpperCase()}</option>
                ))}
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Organizing Society"
                name="societyId"
                type="select"
                value={formData.societyId}
                onChange={(e) => setFormData({ ...formData, societyId: e.target.value })}
                required
              >
                <option value="" disabled>Select a society</option>
                {societies.map((soc) => (
                  <option key={soc._id || soc.id} value={soc._id || soc.id}>{soc.name}</option>
                ))}
              </FormField>

              <FormField
                label="Participation Type"
                name="participationType"
                type="select"
                value={formData.participationType}
                onChange={(e) => setFormData({ ...formData, participationType: e.target.value })}
                required
              >
                <option value="individual">Individual Only</option>
                <option value="team">Teams Only</option>
                <option value="both">Both (Mixed)</option>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Start Date & Time"
                name="startAt"
                type="datetime-local"
                value={formData.startAt}
                onChange={(e) => setFormData({ ...formData, startAt: e.target.value })}
                required
              />
              <FormField
                label="End Date & Time"
                name="endAt"
                type="datetime-local"
                value={formData.endAt}
                onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Registration Deadline"
                name="registrationDeadline"
                type="datetime-local"
                value={formData.registrationDeadline}
                onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                placeholder="Before start time"
              />
              <FormField
                label="Submission Deadline"
                name="submissionDeadline"
                type="datetime-local"
                value={formData.submissionDeadline}
                onChange={(e) => setFormData({ ...formData, submissionDeadline: e.target.value })}
                placeholder="Before end time"
              />
            </div>

            <FormField
              label="Venue Type"
              name="venueType"
              type="select"
              value={formData.venueType}
              onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
              required
            >
              <option value="physical">Physical</option>
              <option value="online">Online</option>
              <option value="hybrid">Hybrid</option>
            </FormField>

            {(formData.venueType === "physical" || formData.venueType === "hybrid") && (
              <FormField
                label="Venue Address"
                name="venueAddress"
                type="text"
                value={formData.venueAddress}
                onChange={(e) => setFormData({ ...formData, venueAddress: e.target.value })}
                placeholder="E.g., Room 101, Computer Science Dept"
                required={formData.venueType === "physical"}
              />
            )}

            {(formData.venueType === "online" || formData.venueType === "hybrid") && (
              <FormField
                label="Online URL"
                name="venueOnlineUrl"
                type="url"
                value={formData.venueOnlineUrl}
                onChange={(e) => setFormData({ ...formData, venueOnlineUrl: e.target.value })}
                placeholder="E.g., https://zoom.us/j/123456"
                required={formData.venueType === "online"}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Max Capacity (0 for unlimited)"
                name="maxCapacity"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                min="0"
              />
              <FormField
                label="Registration Fee (PKR)"
                name="feeAmount"
                type="number"
                value={formData.feeAmount}
                onChange={(e) => setFormData({ ...formData, feeAmount: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            {/* Cover Image */}
            <div>
              <label className="block text-sm font-medium text-[#8b949e] mb-2">
                Cover Image
              </label>
              <div 
                className="w-full h-48 rounded-lg border-2 border-dashed border-[#30363d] flex flex-col items-center justify-center bg-[#0d1117] cursor-pointer hover:border-[#1dc964]/50 transition-colors"
                onClick={() => document.getElementById('cover-upload').click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Cover" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-4xl text-[#8b949e]">image</span>
                    <span className="text-xs text-[#8b949e] mt-2">Upload Cover Image</span>
                  </>
                )}
              </div>
              <input 
                id="cover-upload"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>

            <div className="pt-6">
              <FormActions
                onCancel={() => navigate(-1)}
                onSubmit={handleSubmit}
                cancelText="Cancel"
                submitText={loading ? "Creating..." : "Create Event"}
                submitVariant="primary"
                disabled={loading}
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
