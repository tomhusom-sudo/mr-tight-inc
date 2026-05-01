// Admin emails — accounts that can delete any post or comment.
// Mirror this list in the Firestore Security Rules `isAdmin()` function.
export const ADMIN_EMAILS = [
  'tomhusom@gmail.com',
];

export const isAdmin = (user) =>
  !!user?.email && ADMIN_EMAILS.includes(user.email.toLowerCase());
