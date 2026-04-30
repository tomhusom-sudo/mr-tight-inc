export default function Avatar({ name, photoURL, size = 32 }) {
  const initials = (name || '?')
    .split(' ')
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={name || ''}
        width={size}
        height={size}
        className="rounded-full object-cover"
        style={{ width: size, height: size }}
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full bg-stone-200 text-xs font-medium text-stone-700"
      style={{ width: size, height: size }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
