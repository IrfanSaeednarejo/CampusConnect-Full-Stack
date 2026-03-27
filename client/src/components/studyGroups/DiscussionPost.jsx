export default function DiscussionPost({ post }) {
  return (
    <div className="p-4 bg-[#0d1117] border border-[#30363d] rounded-lg">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-[#238636] flex items-center justify-center text-white font-bold flex-shrink-0">
          {post.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#c9d1d9] font-semibold">{post.author}</span>
            <span className="text-sm text-[#8b949e]">{post.timestamp}</span>
          </div>
          <p className="text-[#8b949e] mb-2">{post.message}</p>
          <button className="text-sm text-[#238636] hover:text-[#2ea043] font-medium">
            {post.replies} replies
          </button>
        </div>
      </div>
    </div>
  );
}
