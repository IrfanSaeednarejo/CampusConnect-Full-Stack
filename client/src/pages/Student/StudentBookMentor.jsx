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
import useHomeTheme from "../../hooks/useHomeTheme";
import { cn, getStudentTheme } from "./studentTheme";

export default function StudentBookMentor() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState("1");
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const isDark = useHomeTheme();
  const theme = getStudentTheme(isDark);

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
          rating: 5,
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
      duration: parseInt(duration, 10),
      topic,
      message,
      status: "pending",
    };

    dispatch(addSession(newSession));

    alert(
      `Session booked successfully with ${selectedMentor.name}!\n\nDate: ${selectedDate}\nTime: ${selectedTime}\nDuration: ${duration} hour(s)\nTopic: ${topic}`
    );

    setSelectedMentor(null);
    setSelectedDate("");
    setSelectedTime("");
    setDuration("1");
    setTopic("");
    setMessage("");
  };

  return (
    <div className={cn("min-h-screen", theme.page)}>
      <header className={cn("sticky top-0 z-50 border-b backdrop-blur-sm", theme.header)}>
        <div className="flex items-center justify-between px-6 py-3 sm:px-10 lg:px-20">
          <div className="flex items-center gap-8">
            <button onClick={() => navigate("/student/dashboard")} className={theme.navLink}>
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex items-center gap-4">
              <svg className="size-6 text-[#238636]" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 6H42L36 24L42 42H6L12 24L6 6Z" fill="currentColor"></path>
              </svg>
              <h2 className={cn("text-lg font-semibold tracking-[-0.015em]", theme.text)}>CampusNexus</h2>
            </div>
          </div>
          <Avatar
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAnPK_XOPkn_xRuJjkJ28yxLKxQIg3E7DdzwpZWAUgeAqsJeg1D0pmo858Xb6Fnx4adCLic40zRTqLsOgB5E6boNvQW2Wu0w08lQ8gAHHahDiL6kDHGnwyILKuDNZcMSbweDjM8qBupJvllgQTJWoxWH6d86ONwwFSFxfNP61cxoz4janxWpttRZcAk3RL0x_QOxMM51XYQYX2b552BqA-0bjn5bBeUsZ_NyXsgVxC2-H7bNrQwoisuCAVm2GoW5vct4koHXzgMiuI"
            size="10"
            hover={true}
            borderColor="[#238636]"
          />
        </div>
      </header>

      <main className="flex flex-1 justify-center px-4 py-6 sm:px-10 md:py-10 lg:px-20">
        <div className="layout-content-container flex w-full max-w-6xl flex-col">
          <section className={cn("rounded-[28px] border p-6 sm:p-8", theme.hero)}>
            <div className="mb-8">
              <h1 className={cn("text-3xl font-bold sm:text-4xl", theme.text)}>Book a Mentor</h1>
              <p className={cn("mt-2 text-base", theme.muted)}>
                Get personalized guidance from experienced mentors
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <div className={cn("mb-6 rounded-[24px] border p-6", theme.card)}>
                  <h2 className={cn("mb-4 text-lg font-medium", theme.text)}>Select a Mentor</h2>
                  <div className="max-h-96 space-y-3 overflow-y-auto">
                    {availableMentors.map((mentor) => (
                      <button
                        key={mentor.id}
                        onClick={() => setSelectedMentor(mentor)}
                        className={cn(
                          "w-full rounded-[20px] border p-4 text-left transition-colors",
                          selectedMentor?.id === mentor.id ? theme.elevatedCard : theme.subtleCard
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="h-12 w-12 flex-shrink-0 rounded-full bg-cover bg-center"
                            style={{ backgroundImage: `url("${mentor.image}")` }}
                          />
                          <div className="flex-1">
                            <h3 className={cn("font-semibold", theme.text)}>{mentor.name}</h3>
                            <p className={cn("text-sm", theme.muted)}>{mentor.specialty}</p>
                            <div className="mt-1 flex items-center gap-2 text-sm">
                              <span className={isDark ? "text-[#238636]" : "text-slate-900"}>{mentor.rating}</span>
                              <span className={theme.muted}>({mentor.reviews} reviews)</span>
                              <span className={cn("ml-auto font-semibold", theme.text)}>${mentor.hourlyRate}/hr</span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedMentor && (
                  <div className={cn("rounded-[24px] border p-6", theme.card)}>
                    <h3 className={cn("mb-3 text-lg font-medium", theme.text)}>
                      About {selectedMentor.name.split(" ")[0]}
                    </h3>
                    <p className={cn("mb-4", theme.muted)}>{selectedMentor.bio}</p>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className={cn("rounded-2xl border p-3", theme.subtleCard)}>
                        <p className={cn("text-sm", theme.muted)}>Title</p>
                        <p className={cn("font-semibold", theme.text)}>{selectedMentor.title}</p>
                      </div>
                      <div className={cn("rounded-2xl border p-3", theme.subtleCard)}>
                        <p className={cn("text-sm", theme.muted)}>Hourly Rate</p>
                        <p className={cn("font-semibold", theme.text)}>${selectedMentor.hourlyRate}/hour</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className={cn("sticky top-24 rounded-[24px] border p-6", theme.elevatedCard)}>
                  <h2 className={cn("mb-4 text-lg font-medium", theme.text)}>Booking Details</h2>
                  <div className="space-y-4">
                    <FormField
                      label="Preferred Date"
                      name="preferredDate"
                      type="date"
                      value={selectedDate}
                      onChange={(event) => setSelectedDate(event.target.value)}
                      isDark={isDark}
                    />
                    <FormField
                      label="Preferred Time"
                      name="preferredTime"
                      type="select"
                      value={selectedTime}
                      onChange={(event) => setSelectedTime(event.target.value)}
                      isDark={isDark}
                    >
                      <option value="">Select a time</option>
                      {selectedMentor?.availableSlots.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </FormField>
                    <FormField
                      label="Duration (hours)"
                      name="duration"
                      type="select"
                      value={duration}
                      onChange={(event) => setDuration(event.target.value)}
                      isDark={isDark}
                    >
                      <option value="1">1 hour</option>
                      <option value="2">2 hours</option>
                      <option value="3">3 hours</option>
                    </FormField>
                    <FormField
                      label="Topic"
                      name="topic"
                      type="text"
                      value={topic}
                      onChange={(event) => setTopic(event.target.value)}
                      placeholder="e.g., Career guidance, Project help..."
                      isDark={isDark}
                    />
                    <FormField
                      label="Message (optional)"
                      name="message"
                      type="textarea"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Tell the mentor about your goals..."
                      rows={3}
                      isDark={isDark}
                    />

                    {selectedMentor && selectedDate && duration && (
                      <div className={cn("rounded-2xl border p-3", theme.subtleCard)}>
                        <p className={cn("mb-1 text-sm", theme.muted)}>Estimated Cost</p>
                        <p className={cn("text-lg font-semibold", theme.text)}>
                          ${selectedMentor.hourlyRate * parseInt(duration, 10)}
                        </p>
                      </div>
                    )}

                    <FormActions
                      onSubmit={handleBookSession}
                      onCancel={() => navigate("/student/dashboard")}
                      submitText="Book Session"
                      cancelText="Cancel"
                      disabled={!selectedMentor}
                      className="flex-col"
                      isDark={isDark}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
