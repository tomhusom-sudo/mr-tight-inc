import { useState } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../lib/allowedUsers';
import LikeButton from './LikeButton';
import Comments from './Comments';
import Avatar from './Avatar';
import Lightbox from './Lightbox';

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [zoom, setZoom] = useState(false);
  const date = post.createdAt?.toDate?.();
  const canDelete = isAdmin(user);
  const isPending = !!post.pending || !!post.error;
  const imageSrc = post.imageData || post.imageUrl;

  const onDelete = async () => {
    if (!confirm('Delete this entry? This cannot be undone.')) return;
    await deleteDoc(doc(db, 'posts', post.id));
  };

  return (
    <article
      className={`overflow-hidden rounded-xl border bg-white shadow-sm transition ${
        isPending ? 'border-stone-300 opacity-80' : 'border-stone-200'
      }`}
    >
      {imageSrc && (
        <button
          type="button"
          onClick={() => !isPending && setZoom(true)}
          className="block w-full"
          aria-label="View full image"
          disabled={isPending}
        >
          <img
            src={imageSrc}
            alt={post.title}
            className={`aspect-[4/3] w-full object-cover ${
              isPending ? '' : 'cursor-zoom-in'
            }`}
            loading="lazy"
          />
        </button>
      )}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={post.author} photoURL={post.authorPhotoURL} size={36} />
            <div>
              <h2 className="text-lg font-semibold text-stone-900">{post.title}</h2>
              <p className="mt-0.5 text-sm text-stone-500">
                by {post.author}
                {date && ` · ${date.toLocaleDateString()}`}
                {post.pending && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded bg-stone-100 px-2 py-0.5 text-xs text-stone-500">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-stone-400" />
                    Posting…
                  </span>
                )}
                {post.error && (
                  <span className="ml-2 rounded bg-red-50 px-2 py-0.5 text-xs text-red-600">
                    Failed: {post.error}
                  </span>
                )}
              </p>
            </div>
          </div>
          {canDelete && !isPending && (
            <button
              onClick={onDelete}
              className="text-xs text-stone-400 hover:text-red-600"
            >
              Delete
            </button>
          )}
        </div>
        {post.caption && (
          <p className="mt-3 text-stone-700">{post.caption}</p>
        )}
        {!isPending && (
          <>
            <div className="mt-3 flex items-center gap-4">
              <LikeButton postId={post.id} />
            </div>
            <Comments postId={post.id} />
          </>
        )}
      </div>

      {zoom && imageSrc && (
        <Lightbox
          src={imageSrc}
          alt={post.title}
          onClose={() => setZoom(false)}
        />
      )}
    </article>
  );
}
