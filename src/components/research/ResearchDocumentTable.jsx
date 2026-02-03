import React from "react";

export default function ResearchDocumentTable({ documents }) {
  return (
    <div className="bg-[#1a2a20] rounded-xl p-4 md:p-6 flex flex-col flex-1 border border-[#2a3d32] shadow-lg">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#2a3d32]">
        <h3 className="text-xl font-bold text-white">Document Explorer</h3>
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
        <label className="flex-1 flex flex-col min-w-40 h-10">
          <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white/5">
            <div className="text-white/60 flex items-center justify-center pl-3">
              <span className="material-symbols-outlined text-xl">search</span>
            </div>
            <input
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-white focus:outline-0 focus:ring-0 border-none bg-transparent focus:border-none h-full placeholder:text-white/60 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
              placeholder="Search documents..."
              value=""
              readOnly
            />
          </div>
        </label>
        <select className="form-select h-10 rounded-lg bg-white/5 border-none text-white/80 focus:ring-primary focus:border-primary text-sm">
          <option>All Types</option>
          <option>Notes</option>
          <option>Papers</option>
          <option>Lectures</option>
          <option>Reports</option>
        </select>
        <select className="form-select h-10 rounded-lg bg-white/5 border-none text-white/80 focus:ring-primary focus:border-primary text-sm">
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>All Time</option>
        </select>
      </div>
      <div className="mb-4">
        <p className="text-white/80 text-sm font-medium mb-2">Popular Tags:</p>
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full cursor-pointer hover:bg-primary/30">
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
      <div
        className="overflow-x-auto flex-1"
        style={{ scrollbarWidth: "thin" }}
      >
        <table className="w-full text-sm text-white/80 text-left">
          <thead className="text-xs text-white/60 uppercase bg-background-dark sticky top-0">
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
            {documents.map((doc) => (
              <tr
                key={doc.id}
                className="bg-[#1a2a20] hover:bg-white/5 cursor-pointer"
              >
                <td className="px-4 py-3 font-medium text-white whitespace-nowrap">
                  {doc.title}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">{doc.type}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {doc.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-white/10 text-white/70 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">{doc.author}</td>
                <td className="px-4 py-3">{doc.lastModified}</td>
                <td className="px-4 py-3 text-right">
                  <button className="text-white/60 hover:text-primary px-1">
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button className="text-white/60 hover:text-primary px-1">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
