import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  selectAllMentors,
  setMentors,
  addSession,
} from "../../redux/slices/mentoringSlice";
import Avatar from "../../components/common/Avatar";
import FormField from "../../components/common/FormField";
import FormActions from "../../components/common/FormActions";
import PageHeader from "../../components/common/PageHeader";

const TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

export default function StudentBookMentor() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");

  const availableMentors = useSelector(selectAllMentors);

  useEffect(() => {
    if (availableMentors.length === 0) {
      const mockMentors = [
    {
      id: 1,
      name: "Dr. Evelyn Reed",
      specialty: "Machine Learning & AI",
      title: "PhD in Machine Learning",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuA0jTMkVZrHrZTVmla4S4Je5c1D36iLLgtz5zB_oZrMcSJbuNexEisrvhdc-NMzmPBIa7YxLyXuCuyYIX6afgK26REr07GOIgtlWbvXQEBDFOkDEf6y7ay5EX9vStNbglIRnSDaNlE5sb1cDVFk0k-s8S_ZBpv3x5kDjuzUdCrCdZzCeCHwFaF1iWAc6nGD6f7KZNT4FSU6gJZtUzrM8VmaGMg_txG_BcWS1kfGr9qfhEKDxs-qmTPWTH-lYRZdpswsDEVNysWfygI",
      rating: 4.9,
      reviews: 156,
      hourlyRate: 50,
      availableSlots: ["10:00 AM", "11:00 AM", "2:00 PM", "3:00 PM", "4:00 PM"],
      bio: "Expert in machine learning, deep learning, and AI research. Currently mentoring 20+ students.",
    },
    {
      id: 2,
      name: "Ben Carter",
      specialty: "Full Stack Development",
      title: "Senior Software Engineer",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBE6tGmIelYR9Lgm-1pwjDVUA6-iB_nfG9VMQ-ziaxjkGxBhDazaCIJClQxvs0cIBqjYNIRgbAcDinkwDssSVNFnTKkpv2Wt6nXs24NWZVgE3q588PfVxEvcSE1g7ur4WMA43VNQVxcmMW9SI37Y9u6C8fz27mk9Iuo2hAbDp4jcrnrLB3f-UNr4_qhf5m0LJj6BbvR9oct4apHAS9DP7jDXJt2LJxsj5gOnJSb6OXZshL1SKL3_2RWaTcGGRlp9fSbU17T9l7-5Ek",
      rating: 5.0,
      reviews: 198,
      hourlyRate: 55,
      availableSlots: ["9:00 AM", "10:00 AM", "1:00 PM", "3:00 PM", "5:00 PM"],
      bio: "Senior engineer with 10+ years experience in JavaScript, React, and Node.js. Specializes in career guidance.",
    },
    {
      id: 3,
      name: "Dr. Anya Sharma",
      specialty: "Business & Economics",
      title: "Professor of Economics",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuD-xTMQV6m4x9u1aHS5QXnuoSyrcNcGtWqZyoqLVAtEs6PjGobk3G90rW-RFKGaMELavxqw3fzNVLNTPojJGzLJJ8RGxgrDUQAX2FArL_DAVd8n0yDsqIs9rHzUEHj0m8j_TtncwNtkZZVuao8mMa_IH87XxSjAUiLrMesI0trc8lLd-qaBRGQZhOj8_t8Z31SptB2XL1Wutq9Jcfmlr_7rsHb03YDxy-e9hcZZ7Ro2Hi_LicZHT1WfmHCQ5n6xIuruddxq52WuUp4",
      rating: 4.8,
      reviews: 142,
      hourlyRate: 45,
      availableSlots: ["11:00 AM", "12:00 PM", "2:00 PM", "4:00 PM"],
      bio: "Economics professor with expertise in finance, policy, and entrepreneurship. Great for business students.",
    },
    {
      id: 4,
      name: "Prof. Michael Chen",
      specialty: "Data Science & Analytics",
      title: "Associate Professor",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCmKP-2N3_5dBQ8Y_9w3E8zJ5zK9m7nZ4a1b2c3d4e5f6g7h8i9j0k1l2m3n",
      rating: 4.7,
      reviews: 128,
      hourlyRate: 52,
      availableSlots: ["10:00 AM", "1:00 PM", "3:00 PM", "4:00 PM"],
      bio: "Specializes in Python, R, and statistical analysis. Published researcher in data science.",
    },
    {
      id: 5,
      name: "Sarah Williams",
      specialty: "Product Management",
      title: "Senior Product Manager",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDqW_7xY_8zE_9fG_0hI_1jJ_2kK_3lL_4mM_5nN_6oO_7pP_8qQ_9rR_0sS_1t",
      rating: 4.9,
      reviews: 174,
      hourlyRate: 60,
      availableSlots: ["9:00 AM", "11:00 AM", "2:00 PM", "4:00 PM", "5:00 PM"],
      bio: "Expert in product strategy, user research, and startup growth. Founded 2 successful startups.",
    },
      ];
      dispatch(setMentors(mockMentors));
    }
  }, [dispatch, availableMentors.length]);

  const handleBookSession = () => {
    if (!selectedMentor || !selectedDate || !selectedTime || !topic) {
      alert("Please fill in all required fields!");
      return;
    }

    const newSession = {
      id: Date.now(),
      mentorId: selectedMentor.id,
      mentorName: selectedMentor.name,
      date: selectedDate,
      time: selectedTime,
      duration: parseInt(duration),
      topic,
      message,
      status: "pending",
    };

    dispatch(addSession(newSession));

    alert(
      `Session booked successfully with ${selectedMentor.name}!\n\nDate: ${selectedDate}\nTime: ${selectedTime}\nDuration: ${duration} hour(s)\nTopic: ${topic}`,
    );
    setSelectedMentor(null);
    setSelectedDate("");
    setSelectedTime("");
    setDuration("1");
    setTopic("");
    setMessage("");
  };

  return (
    <div className="w-full bg-[#0d1117] text-[#c9d1d9] min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#30363d] px-6 sm:px-10 lg:px-20 py-3 sticky top-0 bg-[#0d1117]/80 backdrop-blur-sm z-50">
        <div className="flex items-center gap-8">
          <button
            onClick={() => navigate("/student/dashboard")}
            className="text-white hover:text-[#238636] transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div className="flex items-center gap-4 text-white">
            <svg
              className="size-6 text-[#238636]"
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                fill="currentColor"
              ></path>
            </svg>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              CampusNexus
            </h2>
          </div>
        </div>

        <div className="flex flex-1 justify-end gap-2 sm:gap-4 md:gap-8 items-center">
          <div className="hidden lg:flex items-center gap-9">
            <button
              onClick={() => navigate("/student/dashboard")}
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
            >
              Dashboard
            </button>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/student/book-mentor"
            >
              Book Mentor
            </a>
            <a
              className="text-white text-sm font-medium leading-normal hover:text-[#238636] transition-colors"
              href="/mentors"
            >
              All Mentors
            </a>
          </div>
          <div className="flex gap-2">
            <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 bg-[#161b22] text-white gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 hover:bg-[#30363d] transition-colors">
              <span className="material-symbols-outlined text-xl">
                notifications
              </span>
            </button>
          </div>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
            size="10"
            hover={true}
            borderColor="[#238636]"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-10 lg:px-20 flex flex-1 justify-center py-5 md:py-10">
        <div className="layout-content-container flex flex-col w-full max-w-6xl">
          {/* Page Title */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              Book a Mentor
            </h1>
            <p className="text-[#8b949e]">
              Get personalized guidance from experienced mentors
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Mentor Selection */}
            <div className="lg:col-span-2">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 mb-6">
                <h2 className="text-white font-bold mb-4">Select a Mentor</h2>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availableMentors.map((mentor) => (
                    <button
                      key={mentor.id}
                      onClick={() => setSelectedMentor(mentor)}
                      className={`w-full p-4 rounded-lg border-2 transition-colors text-left ${
                        selectedMentor?.id === mentor.id
                          ? "border-[#238636] bg-[#238636]/10"
                          : "border-[#30363d] bg-[#0d1117] hover:border-[#238636]/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="w-12 h-12 rounded-full bg-cover bg-center flex-shrink-0"
                          style={{ backgroundImage: `url("${mentor.image}")` }}
                        />
                        <div className="flex-1">
                          <h3 className="text-white font-bold">
                            {mentor.name}
                          </h3>
                          <p className="text-[#8b949e] text-sm">
                            {mentor.specialty}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[#238636] text-sm">
                              ⭐ {mentor.rating}
                            </span>
                            <span className="text-[#8b949e] text-sm">
                              ({mentor.reviews} reviews)
                            </span>
                            <span className="text-[#238636] font-bold text-sm ml-auto">
                              ${mentor.hourlyRate}/hr
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Mentor Details */}
              {selectedMentor && (
                <div className="bg-[#161b22] border border-[#238636]/50 rounded-lg p-6">
                  <h3 className="text-white font-bold mb-3">
                    About {selectedMentor.name.split(" ")[0]}
                  </h3>
                  <p className="text-[#c9d1d9] mb-4">{selectedMentor.bio}</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#0d1117] p-3 rounded border border-[#30363d]">
                      <p className="text-[#8b949e] text-sm">Title</p>
                      <p className="text-white font-bold">
                        {selectedMentor.title}
                      </p>
                    </div>
                    <div className="bg-[#0d1117] p-3 rounded border border-[#30363d]">
                      <p className="text-[#8b949e] text-sm">Hourly Rate</p>
                      <p className="text-[#238636] font-bold">
                        ${selectedMentor.hourlyRate}/hour
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 sticky top-24">
                <h2 className="text-white font-bold mb-4">Booking Details</h2>
                <div className="space-y-4">
                  {/* Date Selection */}
                  <FormField
                    label="Preferred Date"
                    name="preferredDate"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />

                  {/* Time Selection */}
                  <FormField
                    label="Preferred Time"
                    name="preferredTime"
                    type="select"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    <option value="">Select a time</option>
                    {selectedMentor?.availableSlots.map((slot) => (
                      <option key={slot} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </FormField>

                  {/* Duration */}
                  <FormField
                    label="Duration (hours)"
                    name="duration"
                    type="select"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  >
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="3">3 hours</option>
                  </FormField>

                  {/* Topic */}
                  <FormField
                    label="Topic"
                    name="topic"
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., Career guidance, Project help..."
                  />

                  {/* Message */}
                  <FormField
                    label="Message (optional)"
                    name="message"
                    type="textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the mentor about your goals..."
                    rows={3}
                  />

                  {/* Cost Estimate */}
                  {selectedMentor && selectedDate && duration && (
                    <div className="bg-[#0d1117] p-3 rounded border border-[#238636]/30">
                      <p className="text-[#8b949e] text-sm mb-1">
                        Estimated Cost
                      </p>
                      <p className="text-[#238636] font-bold text-lg">
                        ${selectedMentor.hourlyRate * parseInt(duration)}
                      </p>
                    </div>
                  )}

                  {/* Form Actions */}
                  <FormActions
                    onSubmit={handleBookSession}
                    onCancel={() => navigate("/student/dashboard")}
                    submitText="Book Session"
                    cancelText="Cancel"
                    disabled={!selectedMentor}
                    className="flex-col"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
