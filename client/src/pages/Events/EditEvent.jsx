import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import FormField from "@/components/common/FormField";
import FormActions from "@/components/common/FormActions";
import { fetchEventById, updateEventThunk, selectSelectedEvent, selectEventLoading } from "@/redux/slices/eventSlice";

const EVENT_CATEGORIES = [
  "academic", "cultural", "sports", "social",
  "workshop", "competition", "networking", "other",
];

const EVENT_TYPES = [
  "general", "hackathon", "coding_competition", "workshop", "seminar",
];

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const event = useSelector(selectSelectedEvent);
  const loading = useSelector(selectEventLoading);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
    eventType: "general",
    venueType: "physical",
    venueAddress: "",
    venueOnlineUrl: "",
    startAt: "",
    endAt: "",
    maxCapacity: 0,
  });

  useEffect(() => {
    if (id) {
      dispatch(fetchEventById(id));
    }
  }, [dispatch, id]);

  // Sync to form data when event is loaded
  useEffect(() => {
    if (event && (event._id === id || event.id === id)) {
      setFormData({
        title: event.title || "",
        description: event.description || "",
        category: event.category || "general",
        eventType: event.eventType || "general",
        venueType: event.venue?.type || "physical",
        venueAddress: event.venue?.address || "",
        venueOnlineUrl: event.venue?.onlineUrl || "",
        startAt: event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : "",
        endAt: event.endAt ? new Date(event.endAt).toISOString().slice(0, 16) : "",
        maxCapacity: event.maxCapacity || 0,
      });
    }
  }, [event, id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create payload
    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      eventType: formData.eventType,
      startAt: new Date(formData.startAt).toISOString(),
      endAt: new Date(formData.endAt).toISOString(),
      maxCapacity: formData.maxCapacity,
      venue: {
        type: formData.venueType,
        address: formData.venueAddress,
        onlineUrl: formData.venueOnlineUrl,
      }
    };

    const resultAction = await dispatch(updateEventThunk({ id, formData: payload }));
    if (updateEventThunk.fulfilled.match(resultAction)) {
      navigate(`/events/${id}/manage`);
    }
  };

  if (loading && !event) {
    return <div className="h-screen flex items-center justify-center bg-[#0d1117] text-[#8b949e]">Loading...</div>;
  }

  return (
    <div className="text-white pb-10">
      <header className="bg-[#161b22] border-b border-[#30363d] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/events/${id}/manage`)}
              className="flex items-center gap-2 text-[#8b949e] hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-xl">arrow_back</span>
              <span className="text-sm font-medium">Back to Manage HQ</span>
            </button>
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-4xl text-[#1dc964]">edit_calendar</span>
              <div>
                <h1 className="text-2xl font-bold text-white">Edit Event</h1>
                <p className="text-sm text-[#8b949e]">Update information for {event?.title}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="bg-[#161b22] border border-[#30363d] rounded-lg p-8 space-y-6">
          <FormField
            label="Event Title"
            name="title"
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <FormField
            label="Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
            >
              {EVENT_TYPES.map((type) => (
               <option key={type} value={type}>{type.replace("_", " ").toUpperCase()}</option>
              ))}
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

          <FormField
            label="Venue Type"
            name="venueType"
            type="select"
            value={formData.venueType}
            onChange={(e) => setFormData({ ...formData, venueType: e.target.value })}
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
            />
          )}

          {(formData.venueType === "online" || formData.venueType === "hybrid") && (
            <FormField
              label="Online URL"
              name="venueOnlineUrl"
              type="url"
              value={formData.venueOnlineUrl}
              onChange={(e) => setFormData({ ...formData, venueOnlineUrl: e.target.value })}
            />
          )}

          <FormField
            label="Max Capacity (0 for unlimited)"
            name="maxCapacity"
            type="number"
            value={formData.maxCapacity}
            onChange={(e) => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
            min="0"
          />

          <div className="pt-6">
            <FormActions
              onCancel={() => navigate(`/events/${id}/manage`)}
              onSubmit={handleSubmit}
              cancelText="Cancel"
              submitText={loading ? "Saving..." : "Save Changes"}
              submitVariant="primary"
              disabled={loading}
            />
          </div>
        </form>
      </main>
    </div>
  );
}
