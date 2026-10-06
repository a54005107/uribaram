export function createStickSelection(twoHanded) {
  let activeSide = null;
  const held = stick => Boolean(stick?.grip.grabbed && !stick.stale);
  return {
    reset() { activeSide = null; },
    select(sticks) {
      if (twoHanded) return sticks;
      if (!held(sticks[activeSide])) {
        // Retain the first acquired hand until release/loss; prefer right on a tie.
        activeSide = ['right', 'left'].find(side => held(sticks[side])) || null;
      }
      return {left: activeSide === 'left' ? sticks.left : null, right: activeSide === 'right' ? sticks.right : null};
    },
  };
}
