// Stable per-browser identifier so likes can toggle and we can attribute
// comments to "this device" without requiring sign-in.
const KEY = 'campfire-anon-id';

export function getAnonId() {
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = (crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(KEY, id);
  }
  return id;
}
