import React, {useLayoutEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './TitlePage.css';

export default function TitlePage() {
  const pageRef = useRef(null);
  const [scale, setScale] = useState(0);
  useLayoutEffect(() => {
    const page = pageRef.current;
    // Size before paint so the preview-to-route handoff does not flash empty.
    setScale(Math.min(page.clientWidth / 2240, page.clientHeight / 1260));
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      setScale(Math.min(width / 2240, height / 1260));
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);

  return <main ref={pageRef} className="page title-page">
    <div className="title-content" style={{transform: `translate(-50%, -50%) scale(${scale})`}}>
      <p className="title-tagline">바람을 싣고, 소리 따라 저 멀리</p>
      <h1><img src="/assets/figma/brand/logo/screen/original.svg" width="877" height="326" alt="우리바람" draggable="false" /></h1>
    </div>
    <Link className="title-next" to="/trumpet" aria-label="다음 페이지: 나발 불기" />
  </main>;
}
