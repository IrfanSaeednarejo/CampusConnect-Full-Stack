import { Link } from "react-router-dom";

export default function CreateTask() {
  const documents = [
    {
      title: "Introduction to Neural Networks",
      type: "Note",
      tags: ["ML", "AI"],
      author: "Dr. Elena Vance",
      lastModified: "2 hours ago",
    },
    {
      title: "Quantum Entanglement Theory Paper",
      type: "Paper",
      tags: ["Physics", "Quantum"],
      author: "Prof. Alistair Finch",
      lastModified: "Yesterday",
    },
    {
      title: "Lecture Notes: Advanced Calculus",
      type: "Lecture",
      tags: ["Math", "Calculus"],
      author: "Sarah Chen",
      lastModified: "3 days ago",
    },
    {
      title: "Research Proposal: Climate Modeling",
      type: "Report",
      tags: ["Climate", "Research"],
      author: "John Doe",
      lastModified: "1 week ago",
    },
    {
      title: "Meeting Notes: Project Alpha Kick-off",
      type: "Note",
      tags: ["Project", "Team"],
      author: "Dr. Jane Smith",
      lastModified: "2 weeks ago",
    },
    {
      title: "Article Summary: Blockchain for Supply Chain",
      type: "Note",
      tags: ["Blockchain", "Supply Chain"],
      author: "Mike Ross",
      lastModified: "3 weeks ago",
    },
    {
      title: "Dataset Analysis: Urban Population Trends",
      type: "Report",
      tags: ["Data Science", "Urban Studies"],
      author: "Dr. Maya Patel",
      lastModified: "1 month ago",
    },
    {
      title: "Literature Review: Renewable Energy Policy",
      type: "Paper",
      tags: ["Energy", "Policy"],
      author: "Alex Kim",
      lastModified: "2 months ago",
    },
  ];

  const activities = [
    {
      icon: "description",
      text: 'You edited "Introduction to Neural Networks"',
      time: "2 hours ago",
    },
    {
      icon: "add_box",
      text: 'Dr. Vance created "New AI Ethics Draft"',
      time: "4 hours ago",
    },
    {
      icon: "upload_file",
      text: 'You uploaded "Quantum Entanglement Theory Paper"',
      time: "Yesterday",
    },
    {
      icon: "visibility",
      text: 'Prof. Alistair viewed "My Thesis Draft v3"',
      time: "2 days ago",
    },
    {
      icon: "description",
      text: 'You commented on "Advanced Calculus Notes"',
      time: "3 days ago",
    },
    {
      icon: "add_box",
      text: 'You created "Quick Brainstorming Session"',
      time: "1 week ago",
    },
    {
      icon: "upload_file",
      text: 'Dr. Smith uploaded "Project Alpha Meeting Minutes"',
      time: "2 weeks ago",
    },
  ];

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden bg-[#112117] text-white font-['Lexend']">
      <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-white/10 px-4 sm:px-6 lg:px-10 py-3">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4 text-white">
            <div className="size-4 text-[#17cf60]">
              <svg
                fill="none"
                viewBox="0 0 48 48"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 6H42L36 24L42 42H6L12 24L6 6Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className="text-white text-lg font-bold leading-tight tracking-[-0.015em]">
              CampusConnect
            </h2>
          </div>
          <div className="hidden md:flex items-center gap-9">
            <Link
              className="text-white/80 hover:text-white text-sm font-medium leading-normal"
              to="/student/dashboard"
            >
              Dashboard
            </Link>
            <Link
              className="text-white/80 hover:text-white text-sm font-medium leading-normal"
              to="/events"
            >
              Events
            </Link>
            <Link
              className="text-white/80 hover:text-white text-sm font-medium leading-normal"
              to="/mentorship-hub"
            >
              Mentoring
            </Link>
            <Link
              className="text-white text-sm font-medium leading-normal"
              to="/academics/research"
            >
              Research Hub
            </Link>
          </div>
        </div>
        <div className="flex flex-1 justify-end items-center gap-4">
          <label className="hidden sm:flex flex-col min-w-40 !h-10 max-w-64">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full">
              <div className="text-white/60 flex border-none bg-white/5 items-center justify-center pl-3 rounded-l-lg border-r-0">
                <span className="material-symbols-outlined !text-xl">
                  search
                </span>
              </div>
              <input
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-white/5 focus:border-none h-full placeholder:text-white/60 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                placeholder="Search"
              />
            </div>
          </label>
          <div className="flex gap-2">
            <Link
              to="/student/notifications"
              className="flex max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
            >
              <span className="material-symbols-outlined">notifications</span>
            </Link>
            <Link
              to="/student/profile"
              className="flex max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 w-10 bg-white/5 text-white/80 hover:text-white hover:bg-white/10 gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5"
            >
              <span className="material-symbols-outlined">settings</span>
            </Link>
          </div>
          <div
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
            style={{
              backgroundImage:
                'url("https://cdn.usegalileo.ai/stability/d1f2e1d4-89fa-407f-8d2c-e463e9623ac2.png")',
            }}
          ></div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto">
        <section className="md:col-span-2 xl:col-span-3 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col">
              <p className="text-white text-3xl font-black leading-tight tracking-[-0.033em]">
                Research Hub Dashboard
              </p>
              <p className="text-white/60 text-base font-normal leading-normal">
                Organize, discover, and collaborate on your academic resources.
              </p>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                to="/academics/notes/create"
                className="flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2"
              >
                <span className="material-symbols-outlined">add</span>
                <span className="truncate">New Document</span>
              </Link>
              <button
                onClick={() => {
                  const input = document.createElement("input");
                  input.type = "file";
                  input.accept = ".pdf,.doc,.docx,.txt,.jpg,.png,.xlsx,.pptx";
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      // File upload logic here
                      alert(`File "${file.name}" uploaded successfully!`);
                    }
                  };
                  input.click();
                }}
                className="flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-white/10 hover:bg-white/20 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-2"
              >
                <span className="material-symbols-outlined">upload_file</span>
                <span className="truncate">Upload File</span>
              </button>
            </div>
          </div>

          <div className="bg-[#1a2a20] rounded-xl p-4 md:p-6 flex flex-col flex-1 border border-[#2a3d32] shadow-lg">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#2a3d32]">
              <h3 className="text-xl font-bold text-white">
                Document Explorer
              </h3>
              <div className="flex gap-2">
                <button className="text-white/60 hover:text-white">
                  <span className="material-symbols-outlined">tune</span>
                </button>
                <button className="text-white/60 hover:text-white">
                  <span className="material-symbols-outlined">sort</span>
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <label className="flex-1 flex flex-col min-w-40 !h-10">
                <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white/5">
                  <div className="text-white/60 flex items-center justify-center pl-3">
                    <span className="material-symbols-outlined !text-xl">
                      search
                    </span>
                  </div>
                  <input
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-transparent focus:border-none h-full placeholder:text-white/60 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    placeholder="Search documents..."
                  />
                </div>
              </label>
              <select className="form-select h-10 rounded-lg bg-white/5 border-none text-white/80 focus:ring-[#17cf60] focus:border-[#17cf60] text-sm">
                <option>All Types</option>
                <option>Notes</option>
                <option>Papers</option>
                <option>Lectures</option>
                <option>Reports</option>
              </select>
              <select className="form-select h-10 rounded-lg bg-white/5 border-none text-white/80 focus:ring-[#17cf60] focus:border-[#17cf60] text-sm">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>

            <div className="mb-4">
              <p className="text-white/80 text-sm font-medium mb-2">
                Popular Tags:
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary/20 text-[#17cf60] text-xs rounded-full cursor-pointer hover:bg-primary/30">
                  #AI Ethics
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-xs rounded-full cursor-pointer hover:bg-white/20">
                  #MachineLearning
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-xs rounded-full cursor-pointer hover:bg-white/20">
                  #QuantumPhysics
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-xs rounded-full cursor-pointer hover:bg-white/20">
                  #Sociology
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-xs rounded-full cursor-pointer hover:bg-white/20">
                  #BigData
                </span>
              </div>
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-white/80 text-left">
                <thead className="text-xs text-white/60 uppercase bg-[#112117] sticky top-0">
                  <tr>
                    <th className="px-4 py-2" scope="col">
                      Title
                    </th>
                    <th className="px-4 py-2 hidden sm:table-cell" scope="col">
                      Type
                    </th>
                    <th className="px-4 py-2 hidden md:table-cell" scope="col">
                      Tags
                    </th>
                    <th className="px-4 py-2 hidden lg:table-cell" scope="col">
                      Author
                    </th>
                    <th className="px-4 py-2" scope="col">
                      Last Modified
                    </th>
                    <th className="px-4 py-2 text-right" scope="col">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a3d32]">
                  {documents.map((doc, index) => (
                    <tr
                      key={index}
                      className="bg-[#1a2a20] hover:bg-white/5 cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                        {doc.title}
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {doc.type}
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {doc.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {doc.author}
                      </td>
                      <td className="px-4 py-3">{doc.lastModified}</td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-white/60 hover:text-[#17cf60] px-1">
                          <span className="material-symbols-outlined">
                            edit
                          </span>
                        </button>
                        <button className="text-white/60 hover:text-[#17cf60] px-1">
                          <span className="material-symbols-outlined">
                            share
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="flex flex-col gap-6 md:col-span-1 xl:col-span-1">
          <div className="bg-[#1a2a20] rounded-xl p-4 md:p-5 flex flex-col flex-1 border border-[#2a3d32] shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4 pb-4 border-b border-[#2a3d32]">
              Recent Activity
            </h3>
            <div className="flex-1 overflow-y-auto">
              <ul className="divide-y divide-[#2a3d32]">
                {activities.map((activity, index) => (
                  <li key={index} className="py-3 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#17cf60] mt-1">
                      {activity.icon}
                    </span>
                    <div>
                      <p
                        className="text-white text-sm font-medium"
                        dangerouslySetInnerHTML={{
                          __html: activity.text.replace(
                            /"([^"]+)"/g,
                            '<span class="text-[#17cf60]">$1</span>',
                          ),
                        }}
                      ></p>
                      <p className="text-white/60 text-xs">{activity.time}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-[#1a2a20] rounded-xl p-4 md:p-5 flex flex-col border border-[#2a3d32] shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4 pb-4 border-b border-[#2a3d32]">
              Quick Note Scratchpad
            </h3>
            <textarea
              className="form-textarea w-full flex-1 min-h-[150px] resize-y overflow-y-auto rounded-lg bg-white/5 border-none text-white focus:ring-[#17cf60] focus:border-[#17cf60] placeholder:text-white/60 text-sm p-3"
              placeholder="Jot down quick thoughts, ideas, or to-dos..."
            ></textarea>
            <div className="flex justify-end mt-4 gap-2">
              <button className="flex max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-white/10 hover:bg-white/20 text-white text-sm font-bold leading-normal tracking-[0.015em] gap-1">
                <span className="material-symbols-outlined !text-base">
                  auto_awesome
                </span>
                <span className="truncate">AI Assist</span>
              </button>
              <button className="flex min-w-[5rem] max-w-lg cursor-pointer items-center justify-center overflow-hidden rounded-lg h-9 px-3 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] gap-1">
                <span className="material-symbols-outlined !text-base">
                  save
                </span>
                <span className="truncate">Save Note</span>
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}
