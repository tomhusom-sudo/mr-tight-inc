import Header from './components/Header';
import Feed from './components/Feed';
import PostForm from './components/PostForm';
import SetupNotice from './components/SetupNotice';
import { AuthProvider } from './context/AuthContext';
import { PendingPostsProvider } from './context/PendingPostsContext';
import { isFirebaseConfigured } from './firebase';

function Main() {
  if (!isFirebaseConfigured) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-6">
        <SetupNotice />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-6">
      <div className="flex flex-col gap-6">
        <PostForm />
        <Feed />
      </div>
    </main>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <PendingPostsProvider>
        <div className="min-h-screen text-stone-900">
          <Header />
          <Main />
        </div>
      </PendingPostsProvider>
    </AuthProvider>
  );
}
