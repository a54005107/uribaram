let phase = 'idle';
const listeners = new Set();
export const photoIdlePolicy = {
  subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); },
  snapshot: () => phase,
  set(next) { if (phase === next) return; phase = next; listeners.forEach(listener => listener()); },
};
export function photoIdleDelay(phase) {
  return ['connecting', 'preparing', 'ready', 'sending'].includes(phase) ? 300000 : 20000;
}
