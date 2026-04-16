import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent } from "../../../redux/slices/eventSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import Button from "../../../components/common/Button";

// Dummy check in verification until API is ready
export default function QRCheckInPanel() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const event = useSelector(selectSelectedEvent);
  const loading = !event; // Assuming initial fetch covers it

  const [scanStatus, setScanStatus] = useState("idle"); // 'idle' | 'scanning' | 'success' | 'failed'
  const [lastScannedUser, setLastScannedUser] = useState(null);
  const [manualInput, setManualInput] = useState("");

  useEffect(() => {
    if (eventId) dispatch(fetchEventById(eventId));
  }, [dispatch, eventId]);

  if (loading) {
    return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;
  }

  const handleSimulateScan = () => {
    setScanStatus("scanning");
    setTimeout(() => {
      // Simulate backend logic
      const isAdmitted = Math.random() > 0.3; // 70% chance success
      if (isAdmitted) {
        setScanStatus("success");
        setLastScannedUser({ name: "Alice Johnson", id: "#STU-9281", type: "Participant" });
      } else {
        setScanStatus("failed");
        setLastScannedUser({ name: "Unknown ID", reason: "Ticket not found or already scanned." });
      }
      setTimeout(() => setScanStatus("idle"), 3000); // Reset after 3 seconds
    }, 1500);
  };

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    if (!manualInput) return;
    setScanStatus("scanning");
    setTimeout(() => {
      setScanStatus("success");
      setLastScannedUser({ name: manualInput, id: "#MAN-1122", type: "Manual Entry" });
      setManualInput("");
      setTimeout(() => setScanStatus("idle"), 3000);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col text-[#e6edf3]">
      <div className="bg-[#161b22] border-b border-[#30363d] p-4 flex justify-between items-center shadow-lg">
        <button onClick={() => navigate(`/events/${eventId}`)} className="text-[#8b949e] hover:text-white flex items-center">
          <span className="material-symbols-outlined mr-2">arrow_back</span> Exit Scanner
        </button>
        <div className="text-right">
          <h1 className="text-lg font-bold text-white">Event Check-In</h1>
          <p className="text-xs text-[#8b949e] line-clamp-1">{event.title}</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-4 max-w-md mx-auto w-full">
        
        {/* Scanner Area */}
        <div className="relative w-full aspect-square bg-[#010409] border-[3px] border-dashed rounded-2xl flex flex-col justify-center items-center overflow-hidden shadow-2xl mb-8">
           {scanStatus === 'idle' && (
             <>
               <span className="material-symbols-outlined text-[100px] text-[#30363d] mb-4">qr_code_scanner</span>
               <p className="text-[#8b949e] font-semibold text-center px-4">Position the QR code within the frame.</p>
               {/* Hidden button simulating camera feed detection */}
               <button onClick={handleSimulateScan} className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair text-[0px]">Simulate Scan</button>
             </>
           )}

           {scanStatus === 'scanning' && (
             <div className="text-center">
               <CircularProgress />
               <p className="text-[#1f6feb] font-semibold mt-4 animate-pulse">Verifying ticket...</p>
             </div>
           )}

           {scanStatus === 'success' && (
             <div className="absolute inset-0 bg-[#2ea043]/20 flex flex-col justify-center items-center text-center p-6 border-4 border-[#2ea043]">
                <span className="material-symbols-outlined text-7xl text-[#3fb950] mb-2 animate-bounce">check_circle</span>
                <h2 className="text-2xl font-black text-white">ADMIT</h2>
                <p className="text-lg text-[#3fb950] font-semibold mt-2">{lastScannedUser?.name}</p>
                <p className="text-sm text-[#8b949e]">{lastScannedUser?.id} • {lastScannedUser?.type}</p>
             </div>
           )}

           {scanStatus === 'failed' && (
             <div className="absolute inset-0 bg-[#da3633]/20 flex flex-col justify-center items-center text-center p-6 border-4 border-[#da3633]">
                <span className="material-symbols-outlined text-7xl text-[#ff7b72] mb-2">cancel</span>
                <h2 className="text-2xl font-black text-[#ff7b72]">DENIED</h2>
                <p className="text-sm text-white font-semibold mt-2">{lastScannedUser?.reason}</p>
             </div>
           )}
        </div>

        {/* Manual Fallback */}
        <div className="w-full bg-[#161b22] border border-[#30363d] rounded-xl p-5 shadow-lg">
           <h3 className="text-sm font-bold uppercase tracking-wider text-[#8b949e] border-b border-[#30363d] pb-2 mb-4">Manual Entry</h3>
           <form onSubmit={handleManualCheckIn} className="flex gap-2">
             <input 
               type="text" 
               placeholder="Enter Email or Reg ID..." 
               className="flex-1 bg-[#0d1117] text-sm text-white px-3 py-2 rounded border border-[#30363d] focus:border-[#1dc964] outline-none"
               value={manualInput}
               onChange={e => setManualInput(e.target.value)}
             />
             <Button variant="primary" type="submit" disabled={scanStatus !== 'idle' || !manualInput}>Locate</Button>
           </form>
        </div>

      </div>
    </div>
  );
}
