import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import '../../public/assets/figma/styles/tokens.css';
import './WaitingPage.css';

export default function Home() {
  const navigate = useNavigate();
  const {stop} = useCamera();
  const pageRef = useRef(null);
  const [layout, setLayout] = useState({scale: 0, top: 0});
  useEffect(() => { stop(); }, [stop]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      // Scale the original artwork as one unit; leave room for it on narrow screens.
      const scale = Math.min(height / 1260, width / 760);
      setLayout({scale, top: height - 1260 * scale});
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);
  return <main ref={pageRef} className="waiting-page">
    <h1 className="waiting-sr-only">우리바람</h1>
    <p className="waiting-instruction">마우스를 움직여 바람을 일으켜 보세요</p>
    <div className="waiting-artwork" style={{top: layout.top, transform: `translateX(-50%) scale(${layout.scale})`}}>
      <img className="waiting-pole" src="/assets/figma/flag/pole/waiting-screen/original.svg" width="390" height="1768" alt="" draggable="false"/>
      <button className="waiting-flag" aria-label="우리바람 체험 시작하기" title="깃발을 눌러 시작하기" onClick={() => navigate('/trumpet')}>
        <img src="/assets/figma/flag/logo/screen/original.svg" width="615" height="1226" alt="" draggable="false"/>
      </button>
    </div>
  </main>;
}
