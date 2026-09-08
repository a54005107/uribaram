import {useEffect, useRef} from 'react';
import {HIT_CONFIG} from '../config/stickInteractionConfig';

const createHandState = () => ({phase: 'IDLE', previous: null, lastHit: 0, strength: 'weak'});
const strengthFromVelocity = (velocity) => velocity >= HIT_CONFIG.strength.strong ? 'strong' : velocity >= HIT_CONFIG.strength.normal ? 'normal' : 'weak';

export default function useStickHitDetection(instrument, sticks, onHit) {
  const statesRef = useRef({left: createHandState(), right: createHandState()});
  useEffect(() => {
    if (!instrument || !sticks) return;
    const now = performance.now();
    const zones = {left: {x: instrument.x - instrument.width * .31, y: instrument.y}, right: {x: instrument.x + instrument.width * .31, y: instrument.y}};
    const radiusX = instrument.width * .34, radiusY = instrument.height * .82;
    for (const hand of ['left', 'right']) {
      const stick = sticks[hand], state = statesRef.current[hand];
      if (stick?.tipX == null || stick?.tipY == null || stick.stale) {
        if (state.previous && now - state.previous.time > 280) Object.assign(state, createHandState());
        continue;
      }
      const current = {x: stick.tipX, y: stick.tipY, time: now}, previous = state.previous;
      if (!previous) { state.previous = current; continue; }
      const dt = Math.max(.008, Math.min(.1, (now - previous.time) / 1000));
      const vx = (current.x - previous.x) / dt, vy = (current.y - previous.y) / dt, speed = Math.hypot(vx, vy);
      let targetSide = 'left', distance = Infinity, previousDistance = Infinity, towardVelocity = 0;
      for (const side of ['left', 'right']) {
        const zone = zones[side], normalized = Math.hypot((current.x - zone.x) / radiusX, (current.y - zone.y) / radiusY);
        if (normalized < distance) {
          targetSide = side; distance = normalized; previousDistance = Math.hypot((previous.x - zone.x) / radiusX, (previous.y - zone.y) / radiusY);
          const toZoneX = zone.x - current.x, toZoneY = zone.y - current.y, toZoneLength = Math.max(.001, Math.hypot(toZoneX, toZoneY));
          towardVelocity = (vx * toZoneX + vy * toZoneY) / toZoneLength;
        }
      }
      const raised = distance >= HIT_CONFIG.raisedDistance || current.y < zones[targetSide].y - radiusY * .52;
      const entered = distance <= HIT_CONFIG.zoneEntry && previousDistance > HIT_CONFIG.zoneEntry;
      if (state.phase === 'IDLE' && raised) state.phase = 'RAISED';
      if (state.phase === 'RAISED' && speed >= HIT_CONFIG.swingVelocity && towardVelocity >= HIT_CONFIG.towardVelocity) state.phase = 'SWINGING';
      if (state.phase === 'SWINGING' && entered && speed >= HIT_CONFIG.impactVelocity && towardVelocity >= HIT_CONFIG.towardVelocity && now - state.lastHit >= HIT_CONFIG.cooldownMs) {
        state.phase = 'HIT'; state.lastHit = now; state.strength = strengthFromVelocity(speed);
        onHit?.({side: targetSide, strength: state.strength, velocity: speed, downwardVelocity: vy, towardVelocity, hand});
      }
      if (state.phase === 'HIT' && (distance > HIT_CONFIG.zoneEntry || towardVelocity < 0)) state.phase = 'RECOVERY';
      if (state.phase === 'RECOVERY' && distance >= HIT_CONFIG.zoneExit) state.phase = raised ? 'RAISED' : 'IDLE';
      if (state.phase === 'SWINGING' && towardVelocity < 0 && distance > HIT_CONFIG.zoneEntry) state.phase = raised ? 'RAISED' : 'IDLE';
      state.previous = current; stick.hitState = state.phase; stick.velocity = speed; stick.downwardVelocity = vy;
    }
  }, [instrument, sticks, onHit]);
}
