import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './TrumpetPage.css';
import './TrumpetMotion.css';
import TrumpetArtwork from '../components/TrumpetArtwork27';
import '../components/TrumpetArtwork.css';
import {previewInstrument, stopPreview} from '../audio/percussion';
import {preloadImage} from '../utils/preloadImage';

const BURST_DURATION_MS = 2470;
const MOTION_NODE_IDS = ['2028:446', '2028:448', '2028:449', '2028:450',
  '2028:587', '2028:555', '2028:738', '2028:489', '2028:578',
  '2028:560', '2028:548', '2028:570', '2028:574'];

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
  const artworkRef = useRef(null);
  const [artworkReady, setArtworkReady] = useState(false);
  const [scale, setScale] = useState(0);
  const [count, setCount] = useState(0);
  const [burst, setBurst] = useState(null);
  const busy = useRef(false);
  const timer = useRef(null);

  useEffect(() => () => {clearTimeout(timer.current);stopPreview();}, []);

  useEffect(() => {
    let cancelled = false, frame;
    const root = artworkRef.current;
    const urls = new Set(Array.from(root.querySelectorAll('img'), image => image.src));
    // CSS masks are separate image requests, so waiting for <img> alone
    // still exposes an incomplete trumpet on a cold Safari load.
    for (const element of root.querySelectorAll('*')) {
      const style = getComputedStyle(element);
      const masks = `${style.maskImage || ''} ${style.webkitMaskImage || ''}`;
      for (const match of masks.matchAll(/url\(["']?([^"')]+)["']?\)/g)) urls.add(match[1]);
    }
    Promise.all([...urls].map(preloadImage)).then(() => {
      if (cancelled) return;
      // Allow the nested artwork ResizeObservers to settle before revealing it.
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => { if (!cancelled) setArtworkReady(true); });
      });
    });
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, []);

  const blow = () => {
    if (!artworkReady || busy.current || count >= 3) return;
    busy.current = true;
    void previewInstrument('trumpet');
    const next = count + 1;
    setCount(next);
    setBurst(TRUMPET_DECORATIONS.map(([asset, x, y, width, height, rotation = 0]) => ({
      asset, width, height, rotation,
      x: x - width / 2,
      y: y - height / 2,
    })));
    timer.current = setTimeout(() => {
      if (next === 3) {
        navigate('/flag');
      } else {
        setBurst(null);
        busy.current = false;
      }
    }, BURST_DURATION_MS);
  };

  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      setScale(Math.min(height / 1440, width / 2560));
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);

  return <main ref={pageRef} className="trumpet-page" aria-label="나발 체험">
    <p className="trumpet-instruction">나발을 세 번 불어<br />풍물패를 불러봐요</p>
    {!artworkReady && <p role="status" className="trumpet-loading">나발을 준비하고 있어요…</p>}
    <div ref={artworkRef} className="trumpet-artwork" style={{transform: `scale(${scale})`, visibility: artworkReady ? 'visible' : 'hidden'}}>
      <button
        className={`trumpet-instrument${count ? ' trumpet-instrument--prototype' : ''}`}
        aria-label={`나발 불기 (${count} / 3)`}
        aria-disabled={burst !== null || count === 3}
        title="나발을 세 번 눌러주세요"
        onClick={blow}
      >
        {/* Keep masked artwork mounted: replacing it on every click can flash
            while Safari rebuilds the SVG masks and measured containers. */}
        <div className={burst ? 'trumpet-rings-active' : ''} aria-hidden="true"><TrumpetArtwork/></div>
      </button>
      {burst && <div className="trumpet-sparkles" key={count} aria-hidden="true">
        {burst.map((particle, index) => <i key={index} className="trumpet-sparkle"
          data-node-id={MOTION_NODE_IDS[index]} style={{
          left: particle.x, top: particle.y,
          width: particle.width, height: particle.height,
        }}>
          <img src={`/assets/figma/decorations/trumpet-burst/${particle.asset}.svg`}
            width={particle.width} height={particle.height} alt="" draggable="false"
            style={{transform: `rotate(${particle.rotation}deg)`}} />
        </i>) }
      </div>}
    </div>
    <button className="trumpet-back" aria-label="이전 페이지" onClick={()=>navigate('/title')}><img src="/assets/figma/ending/back.svg" width="25" height="37" alt=""/></button>
  </main>;
}
