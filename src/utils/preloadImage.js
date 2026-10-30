export const TITLE_LOGO = '/assets/figma/brand/logo/screen/original.svg';
const pending = new Map();

// Share the downloaded and decoded image between the waiting and title pages.
export function preloadImage(src) {
  if (pending.has(src)) return pending.get(src);
  const ready = new Promise(resolve => {
    const image = new Image();
    image.onload = async () => {
      try { await image.decode?.(); } catch { /* A loaded image can still render. */ }
      resolve(true);
    };
    image.onerror = () => { pending.delete(src); resolve(false); };
    image.src = src;
  });
  pending.set(src, ready);
  return ready;
}
