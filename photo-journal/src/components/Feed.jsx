import { usePosts } from '../hooks/usePosts';
import { usePending } from '../context/PendingPostsContext';
import PostCard from './PostCard';

export default function Feed() {
  const { posts, loading, error } = usePosts();
  const { pending } = usePending();

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Couldn't load posts: {error.message}
        </p>
      )}

      {pending.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}

      {loading && pending.length === 0 && !error && (
        <p className="py-12 text-center text-stone-500">Loading…</p>
      )}

      {!loading && !error && posts.length === 0 && pending.length === 0 && (
        <p className="py-12 text-center text-stone-500">
          No entries yet. Be the first to post.
        </p>
      )}

      {posts.map((p) => (
        <PostCard key={p.id} post={p} />
      ))}
    </div>
  );
}
