import {useCallback, useEffect, useRef} from 'react';
import {createStickHitEngine} from '../motion/stickHitEngine';

// Called by the same RAF that places the visible sticks, without React state updates.
export default function useStickHitDetection(onHit) {
  const engineRef = useRef(null), callbackRef = useRef(onHit);
  callbackRef.current = onHit;
  if (!engineRef.current) engineRef.current = createStickHitEngine();
  useEffect(() => () => engineRef.current.reset(), []);
  return useCallback((layout, sticks) => {
    engineRef.current.update(layout, sticks, (hit) => callbackRef.current?.(hit));
  }, []);
}
