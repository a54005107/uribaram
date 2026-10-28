import {createSangmoMotion} from './sangmoMotion.js';

// Pose result order is not an identity. Match heads spatially, with a separate
// ribbon simulation for each person and no reuse after the track expires.
export function createHeadwearTracks(maxPeople = 4) {
  let tracks = [], nextId = 1;
  return {
    reset() { tracks = []; },
    observe(heads, now) {
      tracks = tracks.filter(track => now - track.seen < 750);
      const pairs = [];
      tracks.forEach(track => heads.forEach((head, index) => {
        const dt = Math.min(.15, (now - track.seen) / 1000);
        const distance = Math.hypot(head.x - track.head.x - track.vx * dt, head.y - track.head.y - track.vy * dt);
        const ratio = head.w / track.head.w;
        if (ratio > .5 && ratio < 2 && distance < Math.max(90, track.head.w * 1.1)) pairs.push({track, index, distance});
      }));
      pairs.sort((a,b) => a.distance - b.distance);
      const usedTracks = new Set(), usedHeads = new Set();
      for (const {track,index} of pairs) {
        if (usedTracks.has(track) || usedHeads.has(index)) continue;
        const head = heads[index], dt = Math.max(.001, (now - track.seen) / 1000);
        track.vx = .5 * track.vx + .5 * (head.x - track.head.x) / dt;
        track.vy = .5 * track.vy + .5 * (head.y - track.head.y) / dt;
        track.head = head; track.seen = now; track.motion.observe(head, now);
        usedTracks.add(track); usedHeads.add(index);
      }
      heads.forEach((head,index) => {
        if (usedHeads.has(index) || tracks.length >= maxPeople) return;
        const motion = createSangmoMotion(); motion.observe(head,now);
        tracks.push({id:nextId++, head, seen:now, vx:0, vy:0, motion});
      });
    },
    step(now,dt) {
      tracks = tracks.filter(track => now - track.seen < 750);
      return tracks.map(track => ({...track.motion.step(now,dt), id:track.id}))
        .filter(head => head.opacity > 0).sort((a,b) => a.w - b.w);
    },
  };
}
