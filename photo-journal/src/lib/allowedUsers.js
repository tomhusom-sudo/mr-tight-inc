// Emails allowed to create posts. Reads/feed are public to signed-in users;
// only these accounts can write. Mirror this list in Firestore Security Rules.
export const ALLOWED_POSTERS = [
  'tomhusom@gmail.com',
];

export const canPost = (user) =>
  !!user?.email && ALLOWED_POSTERS.includes(user.email.toLowerCase());
