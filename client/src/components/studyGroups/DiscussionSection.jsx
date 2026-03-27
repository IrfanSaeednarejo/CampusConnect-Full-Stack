import DiscussionPost from "./DiscussionPost";

export default function DiscussionSection({ discussions }) {
  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6">
      <h2 className="text-xl font-bold text-[#c9d1d9] mb-4">Discussion</h2>
      <div className="mb-4">
        <textarea
          className="w-full px-4 py-3 rounded-lg bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] focus:border-[#238636] focus:outline-none resize-none"
          rows={3}
          placeholder="Share your thoughts or ask a question..."
        />
        <button className="mt-2 px-4 py-2 rounded-lg bg-[#238636] text-white text-sm font-bold hover:bg-[#2ea043] transition-colors">
          Post
        </button>
      </div>
      <div className="space-y-4">
        {discussions.map((post) => (
          <DiscussionPost key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
}
