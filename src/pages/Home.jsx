import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import '../../public/assets/figma/styles/tokens.css';
import './WaitingPage.css';
import useFlagWind from '../hooks/useFlagWind';
import {preloadImage, TITLE_LOGO} from '../utils/preloadImage';

export default function Home() {
  const navigate = useNavigate();
  const mounted = useRef(true), entering = useRef(false);
  useEffect(() => {
    mounted.current = true;
    void preloadImage(TITLE_LOGO);
    return () => { mounted.current = false; };
  }, []);
  const enterTitle = async () => {
    if (entering.current) return;
    entering.current = true;
    await preloadImage(TITLE_LOGO);
    if (mounted.current) navigate('/title');
  };
  const {stop} = useCamera();
  const pageRef = useRef(null);
  const flagRef = useRef(null);
  const canvasRef = useRef(null);
  const rigRef = useRef(null);
  useFlagWind(pageRef, flagRef, canvasRef, rigRef);
  const [layout, setLayout] = useState({scale: 0, top: 0});
  useEffect(() => { stop(); }, [stop]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      // Scale the original artwork as one unit; leave room for it on narrow screens.
      const scale = Math.min(height / 1440, width / 2560);
      setLayout({scale, top: (height - 1440 * scale)/2});
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);
  return <main ref={pageRef} className="waiting-page">
    <h1 className="waiting-sr-only">우리바람</h1>
    <p className="waiting-instruction">마우스를 움직여 바람을 일으켜 보세요</p>
    <div className="waiting-artwork" style={{top: layout.top, transform: `translateX(-50%) scale(${layout.scale})`}}>
      {[1, 4, 5].map(part => <img key={part} className="waiting-pole"
        src={`/assets/figma/flag/pole/waiting-screen/parts/pole-segment-00${part}-brown.svg`}
        width="390" height="1768" alt="" draggable="false"/>)}
      <div ref={rigRef} className="waiting-wind-rig">
      {[2, 3].map(part => <img key={part} className="waiting-pole"
        src={`/assets/figma/flag/pole/waiting-screen/parts/pole-segment-00${part}-brown.svg`}
        width="390" height="1768" alt="" draggable="false"/>)}
      <button className="waiting-flag" aria-label="우리바람 제목 화면으로 이동" title="깃발을 눌러 시작하기" onClick={enterTitle}>
        <canvas ref={canvasRef} className="waiting-flag-wave" aria-hidden="true"/>
        <img ref={flagRef} src="/assets/figma/flag/logo/screen/original.svg" width="615" height="1226" alt="" draggable="false"/>
      </button>
      </div>
    </div>
  </main>;
}
