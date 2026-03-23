import { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  selectSocietyById,
  selectRegisteredSocieties,
  joinSociety,
  leaveSociety,
} from "../../redux/slices/societySlice";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Avatar from "../../components/common/Avatar";
import EmptyState from "../../components/common/EmptyState";

export default function SocietyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("overview");

  const societyId = Number(id);
  const society = useSelector(selectSocietyById(societyId));
  const registeredSocieties = useSelector(selectRegisteredSocieties);
  const isMember = useMemo(
    () => registeredSocieties.some((s) => s.id === societyId),
    [registeredSocieties, societyId]
  );

  // Mock data for members and events
  const [members] = useState([
    { id: 1, name: "Sarah Johnson", role: "President", avatar: "SJ", email: "sarah.j@university.edu" },
    { id: 2, name: "Alex Chen", role: "Vice President", avatar: "AC", email: "alex.c@university.edu" },
    { id: 3, name: "Emma Wilson", role: "Secretary", avatar: "EW", email: "emma.w@university.edu" },
    { id: 4, name: "Michael Brown", role: "Member", avatar: "MB", email: "michael.b@university.edu" },
    { id: 5, name: "Lisa Wang", role: "Member", avatar: "LW", email: "lisa.w@university.edu" },
  ]);

  const [events] = useState([
    {
      id: 1,
      title: "Workshop: Introduction to AI",
      date: "March 15, 2026",
      time: "3:00 PM",
      location: "Room 201",
      attendees: 45,
    },
    {
      id: 2,
      title: "Tech Talk: Future of Web Development",
      date: "March 22, 2026",
      time: "4:00 PM",
      location: "Auditorium",
      attendees: 78,
    },
    {
      id: 3,
      title: "Networking Mixer",
      date: "March 28, 2026",
      time: "6:00 PM",
      location: "Student Lounge",
      attendees: 32,
    },
  ]);

  const [posts] = useState([
    {
      id: 1,
      author: "Sarah Johnson",
      avatar: "SJ",
      content: "Excited to announce our upcoming AI Workshop! Register now to secure your spot!",
      timestamp: "2 hours ago",
      likes: 24,
    },
    {
      id: 2,
      author: "Alex Chen",
      avatar: "AC",
      content: "Great turnout at yesterday's meeting! Thanks everyone for the amazing ideas.",
      timestamp: "1 day ago",
      likes: 18,
    },
  ]);

  if (!society) {
    return (
      <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
        <div className="flex items-center justify-center h-screen">
          <Card padding="p-12">
            <EmptyState
              icon="error"
              title="Society not found"
              description="The society you're looking for doesn't exist"
              action={
                <Button onClick={() => navigate("/societies")} variant="primary">
                  Back to Societies
                </Button>
              }
            />
          </Card>
        </div>
      </div>
    );
  }

  const handleJoinLeave = () => {
    if (!society) {
      return;
    }
    if (isMember) {
      dispatch(leaveSociety(society.id));
    } else {
      dispatch(joinSociety(society.id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-[#0d1117]">
      {/* Header */}
      <PageHeader
        title={society.name}
        subtitle={society.description}
        icon="groups"
        backPath="/societies"
        action={
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => navigate(`/society/edit/${society.id}`)}
              variant="secondary"
              className="min-w-0"
            >
              Edit Society
            </Button>
            <Button
              onClick={handleJoinLeave}
              variant={isMember ? "secondary" : "primary"}
            >
              {isMember ? "Leave Society" : "Join Society"}
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Society Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
          <Card padding="p-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-[#238636] mb-2">
                people
              </span>
              <div className="text-2xl font-bold text-white">{society.members}</div>
              <div className="text-sm text-[#8b949e] mt-1">Members</div>
            </div>
          </Card>
          <Card padding="p-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-[#238636] mb-2">
                event
              </span>
              <div className="text-2xl font-bold text-white">{society.events}</div>
              <div className="text-sm text-[#8b949e] mt-1">Events</div>
            </div>
          </Card>
          <Card padding="p-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-[#238636] mb-2">
                category
              </span>
              <div className="text-2xl font-bold text-white">{society.category}</div>
              <div className="text-sm text-[#8b949e] mt-1">Category</div>
            </div>
          </Card>
          <Card padding="p-6">
            <div className="text-center">
              <span className="material-symbols-outlined text-3xl text-[#238636] mb-2">
                person
              </span>
              <div className="text-lg font-bold text-white">{society.head}</div>
              <div className="text-sm text-[#8b949e] mt-1">Society Head</div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#30363d]">
          {["overview", "members", "events", "posts"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                activeTab === tab
                  ? "text-[#238636] border-b-2 border-[#238636]"
                  : "text-[#8b949e] hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && (
          <Card padding="p-6">
            <h3 className="text-xl font-bold text-white mb-4">About</h3>
            <p className="text-[#8b949e] mb-6">{society.description}</p>
            
            <h4 className="text-lg font-bold text-white mb-3">What We Do</h4>
            <ul className="space-y-2 text-[#8b949e]">
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#238636] text-sm mt-1">check_circle</span>
                <span>Regular workshops and technical sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#238636] text-sm mt-1">check_circle</span>
                <span>Networking events with industry professionals</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#238636] text-sm mt-1">check_circle</span>
                <span>Collaborative projects and competitions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[#238636] text-sm mt-1">check_circle</span>
                <span>Mentorship and skill development programs</span>
              </li>
            </ul>
          </Card>
        )}

        {activeTab === "members" && (
          <div className="space-y-4">
            {members.map((member) => (
              <Card key={member.id} padding="p-4" hover={true}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={member.avatar}
                      size="12"
                      borderColor="[#238636]"
                    />
                    <div>
                      <h4 className="text-white font-medium">{member.name}</h4>
                      <p className="text-sm text-[#8b949e]">{member.role}</p>
                    </div>
                  </div>
                  <a
                    href={`mailto:${member.email}`}
                    className="text-[#238636] hover:text-[#2ea043] text-sm font-medium"
                  >
                    Contact
                  </a>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "events" && (
          <div className="space-y-4">
            {events.map((event) => (
              <Card key={event.id} padding="p-6" hover={true}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-white mb-2">{event.title}</h4>
                    <div className="space-y-1 text-sm text-[#8b949e]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">people</span>
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                  </div>
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {activeTab === "posts" && (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} padding="p-6">
                <div className="flex items-start gap-4">
                  <Avatar name={post.avatar} size="10" borderColor="[#238636]" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-medium">{post.author}</h4>
                      <span className="text-xs text-[#8b949e]">{post.timestamp}</span>
                    </div>
                    <p className="text-[#8b949e] mb-3">{post.content}</p>
                    <button className="flex items-center gap-1 text-[#8b949e] hover:text-[#238636] text-sm">
                      <span className="material-symbols-outlined text-sm">favorite</span>
                      <span>{post.likes}</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
