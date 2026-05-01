import { useAuth } from '../context/AuthContext';
import { isAdmin } from '../lib/allowedUsers';
import Avatar from './Avatar';

export default function Header() {
  const { user, signIn, signOut } = useAuth();
  const admin = isAdmin(user);

  return (
    <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-4 py-3">
        <a
          href="https://honesttom.ai/campfire.html"
          className="flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900"
          title="Back to the campfire site"
        >
          <span aria-hidden="true">←</span>
          <span className="hidden sm:inline">Campfire</span>
        </a>
        <h1 className="text-xl font-semibold tracking-tight text-stone-900">
          Campfire Gallery
        </h1>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Avatar
                name={user.displayName || user.email}
                photoURL={user.photoURL}
                size={28}
              />
              {admin && (
                <span className="hidden rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 sm:inline">
                  admin
                </span>
              )}
              <button
                onClick={signOut}
                className="rounded-md border border-stone-300 px-2.5 py-1 text-xs text-stone-700 hover:bg-stone-100"
              >
                Sign out
              </button>
            </>
          ) : (
            <button
              onClick={signIn}
              className="rounded-md border border-stone-300 px-2.5 py-1 text-xs text-stone-500 hover:bg-stone-100"
              title="Sign in as admin to delete posts"
            >
              Admin
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
