import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './TrumpetPage.css';

// Figma 2028:241: center positions and intrinsic SVG dimensions on the 2240 x 1260 frame.
const TRUMPET_DECORATIONS = [
  ['67302', 496.5, 39.5, 177, 177],
  ['60ecc', 39.5, 629.5, 177, 177],
  ['34f53', 1155, 291, 70, 70],
  ['6c84a', 787, 591, 70, 70],
  ['4ef79', 1421, 195, 70, 70],
  ['68a49', 310, 450, 70, 70],
  ['8505e', 155, 879, 70, 70],
  ['905fb', 604.51, 359.08, 138.005, 262.501, -56.42],
  ['c5e75', 1276.87, 104.72, 101.554, 193.166, 168.6],
  ['72c55', 154.89, 128, 155.429, 295.644, 40.3],
  ['104f5', 1032.69, 595.8, 116, 221, 37.95],
  ['7d4a0', 924.51, 173.47, 225.35, 258.062, -24.89],
  ['b8b41', 470.75, 673.7, 164.236, 188.077, 38.35],
];

export default function TrumpetPage() {
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const [scale, setScale] = useState(0);
  const [count, setCount] = useState(0);
  const [burst, setBurst] = useState(null);
  const busy = useRef(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const blow = () => {
    if (busy.current || count >= 3) return;
    busy.current = true;
    const next = count + 1;
    setCount(next);
    setBurst(TRUMPET_DECORATIONS.map(([asset, x, y, width, height, rotation = 0]) => ({
      asset, width, height, rotation,
      x: x - 1374 - width / 2,
      y: y - 510 - height / 2,
      fall: 500 + Math.random() * 400,
    })));
    timer.current = setTimeout(() => {
      if (next === 3) {
        navigate('/flag');
      } else {
        setBurst(null);
        busy.current = false;
      }
    }, 1400);
  };

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      setScale(Math.min(height / 1260, width / 1260));
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);

  return <main ref={pageRef} className="trumpet-page" aria-label="나발 체험">
    <p className="trumpet-instruction">나발을 세 번 불어<br />풍물패를 불러봐요</p>
    <p className="trumpet-progress" role="status">{count} / 3{count === 3 ? ' · 다음 화면으로 이동합니다' : ''}</p>
    <div className="trumpet-artwork" style={{transform: `scale(${scale})`}}>
      <button
        className="trumpet-instrument"
        aria-label={`나발 불기 (${count} / 3)`}
        aria-disabled={burst !== null || count === 3}
        title="나발을 세 번 눌러주세요"
        onClick={blow}
      >
        <img src="/assets/figma/instruments/trumpet/screen/original.svg" width="1633" height="1572" alt="" draggable="false" />
      </button>
      {burst && <div className="trumpet-sparkles" key={count} aria-hidden="true">
        {burst.map((particle, index) => <i key={index} className="trumpet-sparkle" style={{
          '--burst-x': `${particle.x}px`, '--burst-y': `${particle.y}px`,
          '--fall-y': `${particle.y + particle.fall}px`, '--spin': '0deg',
          width: particle.width, height: particle.height,
        }}>
          <img src={`/assets/figma/decorations/trumpet-burst/${particle.asset}.svg`}
            width={particle.width} height={particle.height} alt="" draggable="false"
            style={{transform: `rotate(${particle.rotation}deg)`}} />
        </i>) }
      </div>}
    </div>
  </main>;
}
