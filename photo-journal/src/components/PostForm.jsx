import { useState } from 'react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { usePending } from '../context/PendingPostsContext';
import { resizeImage } from '../lib/resizeImage';
import { getAnonId } from '../lib/anonId';

const NAME_KEY = 'campfire-author-name';

export default function PostForm() {
  const { user } = useAuth();
  const { add, update, remove } = usePending();
  const [title, setTitle] = useState('');
  const [caption, setCaption] = useState('');
  const [author, setAuthor] = useState(
    () => user?.displayName || localStorage.getItem(NAME_KEY) || '',
  );
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title || !file || !author) return;
    setSubmitting(true);
    setError(null);
    localStorage.setItem(NAME_KEY, author);

    const tempId = `pending-${Date.now()}`;
    const localUrl = URL.createObjectURL(file);
    add({
      id: tempId,
      pending: true,
      title,
      caption,
      author,
      imageUrl: localUrl,
      authorPhotoURL: user?.photoURL || null,
      createdAt: { toDate: () => new Date() },
    });

    const snapshot = { title, caption, author, file };
    setTitle('');
    setCaption('');
    setFile(null);
    e.target.reset();
    setSubmitting(false);

    try {
      const imageData = await resizeImage(snapshot.file);

      await addDoc(collection(db, 'posts'), {
        title: snapshot.title,
        caption: snapshot.caption,
        author: snapshot.author,
        imageData,
        authorAnonId: getAnonId(),
        authorPhotoURL: user?.photoURL || null,
        createdAt: serverTimestamp(),
      });

      remove(tempId);
      URL.revokeObjectURL(localUrl);
    } catch (err) {
      update(tempId, { error: err.message, pending: false });
      setError(err.message);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm"
    >
      <h2 className="mb-3 font-semibold text-stone-900">New entry</h2>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Your name"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          required
          className="text-sm"
        />
        <textarea
          placeholder="Caption (optional)"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          className="rounded-md border border-stone-300 px-3 py-2 text-sm focus:border-stone-500 focus:outline-none"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="self-start rounded-md bg-stone-900 px-4 py-2 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
        >
          {submitting ? 'Posting…' : 'Post'}
        </button>
      </div>
    </form>
  );
}
