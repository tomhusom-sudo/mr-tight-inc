export default function SetupNotice() {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900">
      <h2 className="mb-2 text-base font-semibold">Firebase isn't configured yet</h2>
      <p className="mb-3">
        Create a Firebase project, enable Google sign-in, Firestore, and Storage,
        then copy your Web app's <code className="rounded bg-amber-100 px-1">firebaseConfig</code> values
        into a <code className="rounded bg-amber-100 px-1">.env</code> file at the project root.
      </p>
      <ol className="ml-5 list-decimal space-y-1">
        <li>
          Open{' '}
          <a
            className="underline"
            href="https://console.firebase.google.com"
            target="_blank"
            rel="noreferrer"
          >
            console.firebase.google.com
          </a>{' '}
          and create a project.
        </li>
        <li>Add a Web app (the <code>&lt;/&gt;</code> icon) and copy the config values.</li>
        <li>Enable <strong>Authentication → Google</strong> and <strong>Firestore</strong>.</li>
        <li>
          In your project root, copy <code>.env.example</code> → <code>.env</code> and paste the 6 values.
        </li>
        <li>Restart the dev server (Ctrl+C, then <code>npm run dev</code>).</li>
      </ol>
    </div>
  );
}
