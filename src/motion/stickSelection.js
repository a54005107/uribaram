export function createStickSelection(twoHanded) {
  let activeSide = null;
  const held = stick => Boolean(stick?.grip.grabbed && !stick.stale);
  return {
    reset() { activeSide = null; },
    select(sticks) {
      if (twoHanded) return sticks;
      if (!sticks[activeSide]?.grip.grabbed) {
        // Keep the same hand through the tracker grace period. Only acquire a
        // fresh hand after release/expiry; never jump hands on one missed frame.
        activeSide = ['right', 'left'].find(side => held(sticks[side])) || null;
      }
      return {left: activeSide === 'left' ? sticks.left : null, right: activeSide === 'right' ? sticks.right : null};
    },
  };
}
