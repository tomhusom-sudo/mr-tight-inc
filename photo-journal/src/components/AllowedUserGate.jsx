import { useAuth } from '../context/AuthContext';
import { canPost } from '../lib/allowedUsers';

export default function AllowedUserGate({ children }) {
  const { user } = useAuth();
  if (!user) return null;
  if (!canPost(user)) {
    return (
      <p className="rounded-md border border-stone-200 bg-white p-3 text-sm text-stone-500">
        You're signed in as {user.email}, but only approved authors can post.
      </p>
    );
  }
  return children;
}
