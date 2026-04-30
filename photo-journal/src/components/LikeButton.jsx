import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function LikeButton({ postId }) {
  const { user } = useAuth();
  const [likes, setLikes] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, 'posts', postId, 'likes'), (snap) => {
      setLikes(snap.docs.map((d) => d.id));
    });
  }, [postId]);

  const liked = user && likes.includes(user.uid);

  const toggle = async () => {
    if (!user) return;
    const ref = doc(db, 'posts', postId, 'likes', user.uid);
    if (liked) await deleteDoc(ref);
    else await setDoc(ref, { at: Date.now() });
  };

  return (
    <button
      onClick={toggle}
      disabled={!user}
      className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50"
      aria-pressed={liked}
    >
      <span className={liked ? 'text-red-500' : ''}>{liked ? '♥' : '♡'}</span>
      <span>{likes.length}</span>
    </button>
  );
}
