import { Link } from "react-router-dom";
import PageTitle from "../../components/common/PageTitle";

export default function NotesList() {
  return (
    <div className="flex flex-col gap-6 py-8 px-4 sm:px-6 lg:px-8">
      <PageTitle
        title="My Notes & Documents"
        subtitle="Keep your notes and class docs organized—all in one place."
      />
      
      <div className="flex flex-col gap-4 py-16 px-4 rounded-xl bg-[#161b22] border border-[#30363d] items-center justify-center text-center">
        <div className="text-[#238636]/70 mb-4">
          <span className="material-symbols-outlined text-[96px]">
            description
          </span>
        </div>
        
        <div className="flex max-w-[480px] flex-col items-center gap-2">
          <p className="text-white text-xl font-bold leading-tight tracking-tight">
            No notes yet
          </p>
          <p className="text-[#8b949e] text-base font-normal leading-normal">
            Start by creating a note or uploading a file to keep your study materials organized.
          </p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          <Link
            to="/notes/create"
            className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-[#238636] hover:bg-[#2ea043] text-white text-sm font-bold transition-all gap-2 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            <span>Add New Note</span>
          </Link>
          <button
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ".pdf,.doc,.docx,.txt,.jpg,.png";
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  alert(`File "${file.name}" selected! (Upload logic coming soon)`);
                }
              };
              input.click();
            }}
            className="flex min-w-[120px] cursor-pointer items-center justify-center rounded-lg h-10 px-5 bg-[#30363d] hover:bg-[#3d444d] text-[#c9d1d9] text-sm font-bold transition-all gap-2 border border-[#8b949e20]"
          >
            <span className="material-symbols-outlined text-sm">upload_file</span>
            <span>Upload Document</span>
          </button>
        </div>
      </div>
    </div>
  );
}
