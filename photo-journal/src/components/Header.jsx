import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

export default function Header() {
  const { user, signIn, signOut } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
          Photo Journal
        </h1>
        {user ? (
          <div className="flex items-center gap-3">
            <Avatar
              name={user.displayName || user.email}
              photoURL={user.photoURL}
              size={28}
            />
            <span className="hidden text-sm text-stone-600 sm:inline">
              {user.displayName || user.email}
            </span>
            <button
              onClick={signOut}
              className="rounded-md border border-stone-300 px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-100"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={signIn}
            className="rounded-md bg-stone-900 px-3 py-1.5 text-sm text-white hover:bg-stone-700"
          >
            Sign in with Google
          </button>
        )}
      </div>
    </header>
  );
}
