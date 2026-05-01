import { doc, setDoc, deleteDoc, onSnapshot, collection } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../firebase';
import { getAnonId } from '../lib/anonId';

export default function LikeButton({ postId }) {
  const [likes, setLikes] = useState([]);
  const anonId = getAnonId();

  useEffect(() => {
    return onSnapshot(collection(db, 'posts', postId, 'likes'), (snap) => {
      setLikes(snap.docs.map((d) => d.id));
    });
  }, [postId]);

  const liked = likes.includes(anonId);

  const toggle = async () => {
    const ref = doc(db, 'posts', postId, 'likes', anonId);
    if (liked) await deleteDoc(ref);
    else await setDoc(ref, { at: Date.now() });
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-sm text-stone-600 hover:text-stone-900"
      aria-pressed={liked}
    >
      <span className={liked ? 'text-red-500' : ''}>{liked ? '♥' : '♡'}</span>
      <span>{likes.length}</span>
    </button>
  );
}
