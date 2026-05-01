import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../lib/allowedUsers';
import { getAnonId } from '../lib/anonId';

const NAME_KEY = 'campfire-author-name';

export default function Comments({ postId }) {
  const { user } = useAuth();
  const admin = isAdmin(user);
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [name, setName] = useState(
    () => user?.displayName || localStorage.getItem(NAME_KEY) || '',
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'asc'),
    );
    return onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
  }, [postId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim() || !name.trim()) return;
    localStorage.setItem(NAME_KEY, name);
    await addDoc(collection(db, 'posts', postId, 'comments'), {
      text: text.trim(),
      author: name.trim(),
      anonId: getAnonId(),
      createdAt: serverTimestamp(),
    });
    setText('');
  };

  const remove = async (id) => {
    await deleteDoc(doc(db, 'posts', postId, 'comments', id));
  };

  return (
    <div className="mt-3 border-t border-stone-100 pt-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-sm text-stone-600 hover:text-stone-900"
      >
        {comments.length} {comments.length === 1 ? 'comment' : 'comments'}
        {open ? ' ▾' : ' ▸'}
      </button>

      {open && (
        <div className="mt-2 flex flex-col gap-2">
          {comments.map((c) => (
            <div
              key={c.id}
              className="group flex items-start justify-between gap-2 rounded-md bg-stone-50 px-3 py-2 text-sm"
            >
              <div>
                <span className="font-medium text-stone-900">{c.author}</span>
                <span className="ml-2 text-stone-700">{c.text}</span>
              </div>
              {admin && (
                <button
                  onClick={() => remove(c.id)}
                  className="opacity-0 transition group-hover:opacity-100 text-xs text-stone-400 hover:text-red-600"
                  aria-label="Delete comment"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="rounded-md border border-stone-300 px-3 py-1.5 text-sm focus:border-stone-500 focus:outline-none sm:w-32"
              required
            />
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 rounded-md border border-stone-300 px-3 py-1.5 text-sm focus:border-stone-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              disabled={!text.trim() || !name.trim()}
              className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700 disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
