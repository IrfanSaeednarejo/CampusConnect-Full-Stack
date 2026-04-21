import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectSelectedEvent, registerForEventThunk } from "../../redux/slices/eventSlice";
import { selectUser } from "../../redux/slices/authSlice";
import CircularProgress from "../../components/common/CircularProgress";
import { toast } from "react-hot-toast";

export default function RegisterEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const event = useSelector(selectSelectedEvent);
  const user = useSelector(selectUser);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    additionalInfo: "",
    screenshot: null
  });
  const [preview, setPreview] = useState(null);

  // Check if already registered
  const isRegistered = event?.registrations?.some(r => r.userId === user?._id || r.userId?._id === user?._id);
  const myRegistration = event?.registrations?.find(r => r.userId === user?._id || r.userId?._id === user?._id);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, screenshot: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (event?.fee?.amount > 0 && !formData.screenshot) {
      toast.error("Payment screenshot is required for this event");
      return;
    }

    const submissionData = new FormData();
    submissionData.append("additionalInfo", JSON.stringify({ note: formData.additionalInfo }));
    if (formData.screenshot) {
      submissionData.append("paymentScreenshot", formData.screenshot);
    }

    setLoading(true);
    try {
      const resultAction = await dispatch(registerForEventThunk({ eventId: id, formData: submissionData }));
      if (registerForEventThunk.fulfilled.match(resultAction)) {
        toast.success("Registration submitted! Waiting for approval.");
        navigate(`/events/${id}`);
      } else {
        toast.error(resultAction.payload || "Registration failed");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!event) return <div className="p-10 flex justify-center"><CircularProgress /></div>;

  if (isRegistered) {
    return (
      <div className="p-8 text-center animate-fade-in flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-20 h-20 bg-[#1dc964]/20 rounded-full flex items-center justify-center mb-6">
          <span className="material-symbols-outlined text-4xl text-[#1dc964]">check_circle</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You're already on the list!</h2>
        <p className="text-[#8b949e] max-w-md mb-6">
          Your registration status is currently <span className="text-white font-bold uppercase">{myRegistration?.status}</span>.
          {myRegistration?.status === 'pending' && " The society head will review your details soon."}
        </p>
        <button 
          onClick={() => navigate(`/events/${id}`)}
          className="bg-[#21262d] text-white px-6 py-2 rounded-lg border border-[#30363d] hover:bg-[#30363d] transition-colors"
        >
          Back to Overview
        </button>
      </div>
    );
  }

  const isFree = !event.fee?.amount || event.fee.amount === 0;

  return (
    <div className="p-6 md:p-8 animate-fade-in max-w-3xl mx-auto">
      <div className="mb-8 border-b border-[#30363d] pb-4">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1dc964]">app_registration</span>
          Register for {event.title}
        </h2>
        <p className="text-[#8b949e] mt-1">Please fill in the details below to secure your spot.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* User Info (Read Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Full Name</label>
            <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg text-white opacity-70">
              {user?.profile?.displayName || `${user?.profile?.firstName} ${user?.profile?.lastName}`}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#8b949e] uppercase tracking-wider">Email Address</label>
            <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg text-white opacity-70">
              {user?.email}
            </div>
          </div>
        </div>

        {/* Fee Section */}
        <div className={`p-6 rounded-xl border ${isFree ? 'bg-[#238636]/10 border-[#238636]/30' : 'bg-[#e3b341]/10 border-[#e3b341]/30'}`}>
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-bold text-white text-lg">{isFree ? 'Free Event' : 'Paid Registration'}</h4>
              <p className="text-sm text-[#8b949e]">{isFree ? 'No payment required for this event.' : `Please pay PKR ${event.fee.amount.toLocaleString()} to the society account.`}</p>
            </div>
            {!isFree && (
              <div className="text-2xl font-black text-[#e3b341]">
                PKR {event.fee.amount}
              </div>
            )}
          </div>
        </div>

        {/* Payment Screenshot Upload */}
        {!isFree && (
          <div className="space-y-4">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-[#e3b341]">receipt_long</span>
              Payment Screenshot
              <span className="text-red-500">*</span>
            </label>
            
            <div className="relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                required
              />
              <div className={`border-2 border-dashed rounded-xl p-8 transition-all flex flex-col items-center justify-center gap-4 ${preview ? 'border-[#1dc964] bg-[#1dc964]/5' : 'border-[#30363d] group-hover:border-[#8b949e] bg-[#0d1117]'}`}>
                {preview ? (
                  <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden border border-[#30363d]">
                    <img src={preview} alt="Screenshot preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold">Change Image</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-5xl text-[#30363d]">upload_file</span>
                    <div className="text-center">
                      <p className="text-white font-medium">Click to upload or drag and drop</p>
                      <p className="text-xs text-[#8b949e] mt-1">PNG, JPG or JPEG (Max 5MB)</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="space-y-2">
          <label className="text-sm font-bold text-white">Additional Notes (Optional)</label>
          <textarea
            value={formData.additionalInfo}
            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            placeholder="Anything else you'd like the organizers to know?"
            rows={4}
            className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg p-3 text-white focus:outline-none focus:border-[#1dc964] transition-colors resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 px-6 py-3 rounded-lg border border-[#30363d] text-white font-bold hover:bg-[#21262d] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-[2] bg-[#1dc964] text-black px-6 py-3 rounded-lg font-bold hover:bg-[#1fb15b] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <><CircularProgress size={20} color="black" /> Submitting...</>
            ) : (
              'Confirm Registration'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
