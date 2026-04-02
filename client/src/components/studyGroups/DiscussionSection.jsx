import DiscussionPost from "./DiscussionPost";

export default function DiscussionSection({ discussions }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h2 className="text-xl font-bold text-text-primary mb-4">Discussion</h2>
      <div className="mb-4">
        <textarea
          className="w-full px-4 py-3 rounded-lg bg-background border border-border text-text-primary focus:border-primary focus:outline-none resize-none"
          rows={3}
          placeholder="Share your thoughts or ask a question..."
        />
        <button className="mt-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold hover:bg-primary-hover transition-colors">
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
