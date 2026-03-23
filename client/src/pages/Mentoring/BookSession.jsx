import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectAllMentors, setMentors } from "../../redux/slices/mentoringSlice";
import MentorTopBar from "../../components/mentoring/MentorTopBar";

export default function BookSession() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mentors = useSelector(selectAllMentors);
  
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [topic, setTopic] = useState("");

  useEffect(() => {
    if (mentors.length === 0) {
      dispatch(setMentors([
        {
          id: 1,
          name: "Dr. Alex Johnson",
          specialty: "Web Development",
          hourlyRate: 50,
          rating: 4.9,
          reviews: 156,
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
          availableSlots: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM"],
        },
        {
          id: 2,
          name: "Sarah Williams",
          specialty: "Data Science",
          hourlyRate: 55,
          rating: 4.8,
          reviews: 142,
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
          availableSlots: ["9:00 AM", "10:00 AM", "3:00 PM", "4:00 PM"],
        },
        {
          id: 3,
          name: "Michael Chen",
          specialty: "Mobile Development",
          hourlyRate: 52,
          rating: 4.7,
          reviews: 128,
          image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
          availableSlots: ["11:00 AM", "12:00 PM", "4:00 PM", "5:00 PM"],
        },
      ]));
    }
  }, [dispatch, mentors.length]);

  const handleBookSession = () => {
    if (!selectedMentor || !selectedDate || !selectedTime || !topic) {
      alert("Please fill in all required fields!");
      return;
    }
    alert(
      `Session booked with ${selectedMentor.name} on ${selectedDate} at ${selectedTime}`,
    );
    navigate("/mentor-sessions");
  };

  const calculateCost = () => {
    if (!selectedMentor || !duration) return 0;
    return (selectedMentor.hourlyRate * parseFloat(duration)).toFixed(2);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col font-display text-[#c9d1d9] group/design-root overflow-x-hidden bg-[#112118]">
      <div className="layout-container flex h-full grow flex-col">
        {/* TopNavBar */}
        <MentorTopBar backPath="/mentor-sessions" />

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-1 justify-center py-8">
          <div className="layout-content-container flex flex-col w-full max-w-5xl flex-1">
            {/* Page Heading */}
            <div className="mb-8">
              <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] mb-2">
                Book a Mentoring Session
              </h1>
              <p className="text-[#9eb7a9] text-base font-normal leading-normal">
                Select a mentor and schedule your next mentoring session
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Mentor Selection */}
              <div className="flex flex-col gap-4">
                <h2 className="text-white font-semibold text-lg">
                  Select Mentor
                </h2>
                {mentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    onClick={() => setSelectedMentor(mentor)}
                    className={`p-4 rounded-xl cursor-pointer transition-all border ${
                      selectedMentor?.id === mentor.id
                        ? "bg-[#161b22] border-[#1dc964]"
                        : "bg-[#161b22] border-[#30363d] hover:border-[#1dc964]"
                    }`}
                  >
                    <img
                      src={mentor.image}
                      alt={mentor.name}
                      className="w-12 h-12 rounded-full mb-3 border border-[#30363d]"
                    />
                    <h3 className="text-white font-semibold">{mentor.name}</h3>
                    <p className="text-[#9eb7a9] text-sm">{mentor.specialty}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-yellow-400">
                        ⭐ {mentor.rating}
                      </span>
                      <span className="text-[#9eb7a9] text-xs">
                        ({mentor.reviews})
                      </span>
                    </div>
                    <p className="text-[#1dc964] font-bold mt-2">
                      ${mentor.hourlyRate}/hr
                    </p>
                  </div>
                ))}
              </div>

              {/* Booking Form */}
              <div className="lg:col-span-2">
                {selectedMentor ? (
                  <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl">
                    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#30363d]">
                      <img
                        src={selectedMentor.image}
                        alt={selectedMentor.name}
                        className="w-14 h-14 rounded-full border border-[#30363d]"
                      />
                      <div>
                        <h3 className="text-white font-bold text-lg">
                          {selectedMentor.name}
                        </h3>
                        <p className="text-[#9eb7a9]">
                          {selectedMentor.specialty}
                        </p>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-3">
                        Select Date *
                      </label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none"
                      />
                    </div>

                    {/* Time Selection */}
                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-3">
                        Select Time *
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedMentor.availableSlots.map((slot) => (
                          <button
                            key={slot}
                            onClick={() => setSelectedTime(slot)}
                            className={`p-3 rounded-lg font-semibold transition-colors border ${
                              selectedTime === slot
                                ? "bg-[#1dc964] text-[#112118] border-[#1dc964]"
                                : "bg-[#0d1117] text-white border-[#30363d] hover:border-[#1dc964]"
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-3">
                        Duration *
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none"
                      >
                        <option value="0.5">30 minutes</option>
                        <option value="1">1 hour</option>
                        <option value="1.5">1.5 hours</option>
                        <option value="2">2 hours</option>
                      </select>
                    </div>

                    {/* Topic */}
                    <div className="mb-6">
                      <label className="block text-white font-semibold mb-3">
                        What do you want to discuss? *
                      </label>
                      <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="e.g., React hooks, API design..."
                        className="w-full p-3 bg-[#0d1117] text-white rounded-lg border border-[#30363d] focus:border-[#1dc964] focus:outline-none placeholder:text-[#9eb7a9]"
                      />
                    </div>

                    {/* Cost Summary */}
                    <div className="p-4 bg-[#0d1117] rounded-lg mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-[#9eb7a9]">
                          ${selectedMentor.hourlyRate}/hr × {duration} hour(s)
                        </span>
                        <span className="text-white font-bold text-lg">
                          ${calculateCost()}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                      <button
                        onClick={handleBookSession}
                        className="flex items-center gap-2 px-6 py-3 bg-[#1dc964] text-[#112118] font-bold rounded-lg hover:opacity-90 transition-opacity flex-1"
                      >
                        <span className="material-symbols-outlined">
                          calendar_add_on
                        </span>
                        Book Session
                      </button>
                      <button
                        onClick={() => setSelectedMentor(null)}
                        className="flex items-center gap-2 px-6 py-3 bg-[#30363d] text-white font-bold rounded-lg hover:bg-[#404851] transition-colors"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-[#161b22] border border-[#30363d] rounded-xl text-center">
                    <span className="material-symbols-outlined text-6xl text-[#9eb7a9] mb-4 inline-block">
                      person_add
                    </span>
                    <p className="text-[#9eb7a9]">
                      Select a mentor to start booking
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
