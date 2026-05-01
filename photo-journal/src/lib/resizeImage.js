// Resize an image File to a max dimension and return a JPEG data URL.
// Stays well under Firestore's 1 MB per-document limit.
export async function resizeImage(file, { maxDim = 1200, quality = 0.72 } = {}) {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();

  let dataUrl = canvas.toDataURL('image/jpeg', quality);

  // Firestore caps documents at ~1MB. If we somehow exceeded it, retry smaller.
  let attempt = 0;
  while (dataUrl.length > 900_000 && attempt < 4) {
    attempt += 1;
    const q = Math.max(0.4, quality - 0.1 * attempt);
    dataUrl = canvas.toDataURL('image/jpeg', q);
  }
  return dataUrl;
}
