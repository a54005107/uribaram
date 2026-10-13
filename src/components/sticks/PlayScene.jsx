import React from 'react';
import {playArtboard} from '../../motion/figmaPlayLayout';

// Original decoration slots from Figma play frame 2305:824 (2240 × 1260).
const decorations = [
  ['babdb', 16.655, 36.43, 138.005, 262.501, -35.26],
  ['de68f', 80.495, 84.685, 138.005, 262.501, -35.26],
  ['25822', 91.955, 48.635, 116, 221, 37.95],
  ['d1e07', 15.17, 69.38, 98.58, 187.51, 115],
  ['d1e07', 81.955, 22.57, 98.58, 187.51, 192],
  ['4c4af', 8.66, 39.84, 70, 70, 0],
  ['79742', 69.265, 13.85, 139, 139, 0],
  ['cff1d', 93.345, 21.665, 80, 80, 0],
  ['c4f61', 96.34, 79.68, 98, 98, 0],
  ['4248b', 28.395, 81.585, 106, 106, 0],
  ['fb544', 28.395, 17.46, 70, 70, 0],
  ['8f95b', 5.47, 89.245, 143, 143, 0],
];
export default function PlayScene({width, height}) {
  const {scale, left, top} = playArtboard(width, height);
  return <div className="play-scene" aria-hidden="true" style={{left, top, width: 2240, height: 1260, transform: `scale(${scale})`, transformOrigin: '0 0'}}>
    {decorations.map(([asset, x, y, w, h, rotation], index) => <div key={index} className="play-scene-decoration" style={{left: `${x}%`, top: `${y}%`}}>
      <img src={`/assets/figma/play-scene/${asset}.svg`} width={w} height={h} alt="" draggable="false"
        style={{transform: `translate(-50%, -50%) rotate(${rotation}deg)`}} />
    </div>)}
  </div>;
}
