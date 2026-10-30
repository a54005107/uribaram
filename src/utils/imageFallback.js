// Older Safari/OS combinations or a failed optimized asset request may not
// decode WebP. Retry the original once; never loop on a missing original.
export function useOriginalImage(event) {
  const image = event.target;
  if (image?.tagName !== 'IMG') return;
  const source = image.getAttribute('src');
  if (source?.endsWith('.webp')) image.src = source.slice(0, -5) + '.png';
}
