import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../../contexts/NotificationContext';
import { createEvent, updateEvent } from '../../api/eventApi';
import { getUserSocieties } from '../../api/societyApi';

export default function CreateEventPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [societies, setSocieties] = useState([]);
  const [loadingSocieties, setLoadingSocieties] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    societyId: '',
    description: '',
    location: '',
    onlineUrl: '',
    venueType: 'physical',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    capacity: '100',
    tags: '',
    category: 'competition',
    eventType: 'general',
    participationType: 'individual',
    isPublic: true,
  });
  const [coverFile, setCoverFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const userId = user?._id || user?.id;
        if (!userId) return;
        setLoadingSocieties(true);
        const res = await getUserSocieties(userId);
        const userSocs = res.data || res || [];
        setSocieties(userSocs);
        if (userSocs.length > 0) {
          setFormData((prev) => ({ ...prev, societyId: userSocs[0]._id || userSocs[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch user societies:", err);
      } finally {
        setLoadingSocieties(false);
      }
    };
    fetchSocieties();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 5) {
      newErrors.title = 'Title requires at least 5 characters.';
    }
    if (!formData.societyId) {
      newErrors.societyId = 'Please select an organizing society.';
    }
    if (!formData.description || formData.description.trim().length < 10) {
      newErrors.description = 'Description requires at least 10 characters.';
    }
    
    if (formData.venueType === 'physical' && (!formData.location || formData.location.trim() === '')) {
      newErrors.location = 'Location is required for physical events.';
    }
    if (formData.venueType === 'online' && !formData.onlineUrl) {
      newErrors.onlineUrl = 'Meeting link is required for online events.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start Date & Time is required.';
    } else if (new Date(formData.startDate) <= new Date()) {
      newErrors.startDate = 'Start date must be in the future.';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End Date & Time is required.';
    } else if (new Date(formData.endDate) <= new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date.';
    }

    const cap = parseInt(formData.capacity, 10);
    if (!formData.capacity || isNaN(cap) || cap < 1) {
      newErrors.capacity = 'Capacity must be at least 1.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
        addNotification({
            type: 'error',
            title: 'Validation Error',
            message: 'Please fix the errors in the form before submitting.'
        });
        return;
    }
    
    setIsSubmitting(true);

    try {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        societyId: formData.societyId,
        campusId: user?.campusId,
        eventType: formData.eventType,
        category: formData.category,
        participationType: formData.participationType,
        startAt: new Date(formData.startDate).toISOString(),
        endAt: new Date(formData.endDate).toISOString(),
        venue: { 
            type: formData.venueType, 
            address: formData.location.trim(),
            onlineUrl: formData.onlineUrl.trim()
        },
        teamConfig: { minSize: 1, maxSize: 5 },
        isOnlineCompetition: true,
        tags: formData.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      // Only include registrationDeadline if user set one
      if (formData.registrationDeadline) {
        payload.registrationDeadline = new Date(formData.registrationDeadline).toISOString();
      }

      let submitData = payload;
      
      if (coverFile) {
        submitData = new FormData();
        Object.keys(payload).forEach(key => {
          if (typeof payload[key] === 'object' && payload[key] !== null) {
            submitData.append(key, JSON.stringify(payload[key]));
          } else {
            submitData.append(key, payload[key]);
          }
        });
        submitData.append('coverImage', coverFile);
      }

      await createEvent(submitData);
      
      addNotification({
        type: 'success',
        title: 'Event Created!',
        message: `"${payload.title}" has been created successfully.`,
      });

      navigate('/society/events');
    } catch (error) {
      console.error("Event creation error:", error);
      addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error.message || error.data?.message || 'Something went wrong while creating the event.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const today = new Date().toISOString().slice(0, 16);

  if (loadingSocieties) {
    return (
      <div className="w-full bg-background min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1dc964]"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background text-text-primary min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex flex-col gap-4">
          <button 
            type="button"
            onClick={() => navigate('/society/events')}
            className="flex items-center gap-1 text-text-secondary hover:text-[#58a6ff] transition-colors self-start text-sm"
          >
            ← Back to Events
          </button>
          <h1 className="text-white font-bold text-2xl tracking-tight">Create New Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-2xl p-8 mt-6 flex flex-col gap-6 shadow-xl">
          {/* TITLE & ORGANIZER */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Annual Tech Summit 2026"
              className={`bg-background border ${errors.title ? 'border-red-500' : 'border-border focus:border-[#58a6ff]'} text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors`}
            />
            {errors.title && <span className="text-red-400 text-sm mt-1">{errors.title}</span>}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Society / Organizer *</label>
            <select
              name="societyId"
              value={formData.societyId}
              onChange={handleChange}
              className={`bg-background border ${errors.societyId ? 'border-red-500' : 'border-border focus:border-[#58a6ff]'} text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors`}
            >
              <option value="" disabled>Select a society</option>
              {societies.map((soc) => (
                <option key={soc._id || soc.id} value={soc._id || soc.id}>
                  {soc.name}
                </option>
              ))}
            </select>
            {errors.societyId && <span className="text-red-400 text-sm mt-1">{errors.societyId}</span>}
          </div>

          {/* DESCRIPTION */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event in detail..."
              rows={4}
              className={`bg-background border ${errors.description ? 'border-red-500' : 'border-border focus:border-[#58a6ff]'} text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors`}
            />
            {errors.description && <span className="text-red-400 text-sm mt-1">{errors.description}</span>}
          </div>

          {/* EVENT CATEGORY & TYPE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="bg-background border border-border focus:border-[#58a6ff] text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors"
              >
                <option value="academic">Academic</option>
                <option value="cultural">Cultural</option>
                <option value="sports">Sports</option>
                <option value="social">Social</option>
                <option value="workshop">Workshop</option>
                <option value="competition">Competition</option>
                <option value="networking">Networking</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Event Type *</label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="bg-background border border-border focus:border-[#58a6ff] text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors"
              >
                <option value="general">General</option>
                <option value="hackathon">Hackathon</option>
                <option value="coding_competition">Coding Competition</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
              </select>
            </div>
          </div>

          {/* PARTICIPATION TYPE */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Participation Type *</label>
            <div className="flex gap-4">
              {['individual', 'team', 'both'].map((type) => (
                <label key={type} className="flex-1 cursor-pointer">
                  <input
                    type="radio"
                    name="participationType"
                    value={type}
                    checked={formData.participationType === type}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className={`text-center py-2 px-4 rounded-lg border transition-all ${
                    formData.participationType === type 
                    ? 'bg-primary/10 border-[#1dc964] text-[#1dc964]' 
                    : 'bg-background border-border text-text-secondary hover:border-[#484f58]'
                  }`}>
                    <span className="text-sm font-bold capitalize">{type}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* VENUE TYPE & LOCATION */}
          <div className="flex flex-col gap-4 p-4 bg-background rounded-xl border border-border">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-text-primary">Venue Type</label>
              <div className="flex bg-surface p-1 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, venueType: 'physical' }))}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.venueType === 'physical' ? 'bg-[#30363d] text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Physical
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(p => ({ ...p, venueType: 'online' }))}
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${formData.venueType === 'online' ? 'bg-[#30363d] text-white shadow-sm' : 'text-text-secondary hover:text-text-primary'}`}
                >
                  Online
                </button>
              </div>
            </div>

            {formData.venueType === 'physical' ? (
              <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                <label className="text-xs font-medium text-text-secondary">Campus Location / Address *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Main Auditorium, Room 301"
                  className={`bg-surface border ${errors.location ? 'border-red-500' : 'border-border focus:border-[#58a6ff]'} text-white rounded-lg px-4 py-2 w-full outline-none transition-colors text-sm`}
                />
                {errors.location && <span className="text-red-400 text-xs">{errors.location}</span>}
              </div>
            ) : (
              <div className="flex flex-col gap-2 animate-in fade-in duration-300">
                <label className="text-xs font-medium text-text-secondary">Online Meeting Link *</label>
                <input
                  type="url"
                  name="onlineUrl"
                  value={formData.onlineUrl}
                  onChange={handleChange}
                  placeholder="e.g. https://meet.google.com/abc-defg-hij"
                  className={`bg-surface border ${errors.onlineUrl ? 'border-red-500' : 'border-border focus:border-[#58a6ff]'} text-white rounded-lg px-4 py-2 w-full outline-none transition-colors text-sm`}
                />
                {errors.onlineUrl && <span className="text-red-400 text-xs">{errors.onlineUrl}</span>}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Maximum Capacity *</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              placeholder="e.g. 100"
              min="1"
              className={`bg-background border ${errors.capacity ? 'border-red-500' : 'border-border focus:border-[#58a6ff]'} text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors`}
            />
            {errors.capacity && <span className="text-red-400 text-sm mt-1">{errors.capacity}</span>}
          </div>

          {/* DATE AND TIME */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Start Date & Time *</label>
              <input
                type="datetime-local"
                name="startDate"
                min={today}
                value={formData.startDate}
                onChange={handleChange}
                className={`bg-background border ${errors.startDate ? 'border-red-500' : 'border-border focus:border-[#58a6ff]'} text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors`}
              />
              {errors.startDate && <span className="text-red-400 text-sm mt-1">{errors.startDate}</span>}
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">End Date & Time *</label>
              <input
                type="datetime-local"
                name="endDate"
                min={formData.startDate || today}
                value={formData.endDate}
                onChange={handleChange}
                className={`bg-background border ${errors.endDate ? 'border-red-500' : 'border-border focus:border-[#58a6ff]'} text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors`}
              />
              {errors.endDate && <span className="text-red-400 text-sm mt-1">{errors.endDate}</span>}
            </div>
          </div>

          {/* REGISTRATION DEADLINE */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Registration Deadline (optional)</label>
            <input
              type="datetime-local"
              name="registrationDeadline"
              max={formData.startDate}
              value={formData.registrationDeadline}
              onChange={handleChange}
              className={`bg-background border border-border focus:border-[#58a6ff] text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors`}
            />
            <span className="text-xs text-text-secondary">Leave blank if registration is open until start.</span>
          </div>

          {/* TAGS */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-primary">Tags (optional)</label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              placeholder="tech, workshop, networking (comma-separated)"
              className="bg-background border border-border focus:border-[#58a6ff] text-white rounded-lg px-4 py-2.5 w-full outline-none transition-colors"
            />
            <span className="text-xs text-text-secondary">Separate tags with commas</span>
          </div>

          {/* IMAGE AND VISIBILITY */}
          <div className="flex flex-col gap-6 pb-2 border-b border-border mb-2">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-text-primary">Cover Image (optional)</label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#30363d] file:text-white hover:file:bg-[#484f58] cursor-pointer transition-colors"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div className="relative">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`block w-10 h-6 rounded-full transition-colors ${formData.isPublic ? 'bg-[#2ea043]' : 'bg-[#30363d]'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.isPublic ? 'transform translate-x-4' : ''}`}></div>
              </div>
              <span className="text-sm font-semibold text-text-primary tracking-wide">Make this event public</span>
            </label>
          </div>

          {/* ACTION BUTTONS */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-lg transition-colors duration-200 focus:outline-none disabled:opacity-50 flex justify-center items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Publishing...
                </>
              ) : 'Publish Event'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/society/events')}
              className="text-text-secondary hover:text-white text-sm text-center block w-full mt-4 cursor-pointer outline-none transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
