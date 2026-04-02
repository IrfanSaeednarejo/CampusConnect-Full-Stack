export default function DiscussionPost({ post }) {
  return (
    <div className="p-4 bg-background border border-border rounded-lg">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold flex-shrink-0">
          {post.avatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-primary font-semibold">{post.author}</span>
            <span className="text-sm text-text-secondary">{post.timestamp}</span>
          </div>
          <p className="text-text-secondary mb-2">{post.message}</p>
          <button className="text-sm text-primary hover:text-[#2ea043] font-medium">
            {post.replies} replies
          </button>
        </div>
      </div>
    </div>
  );
}
