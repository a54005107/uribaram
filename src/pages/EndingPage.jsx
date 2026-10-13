import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';
import './EndingPage.css';

export default function EndingPage() {
  const navigate = useNavigate();
  const {stop} = useCamera();
  const pageRef = useRef(null);
  const [scale, setScale] = useState(1), [notice, setNotice] = useState('');
  const [message] = useState(() => Array.from((sessionStorage.getItem('uribaram-flag-message') || '우리바람').replace(/[\r\n]/g, '').normalize('NFC')).slice(0, 4));
  useEffect(() => { stop(); }, [stop]);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => setScale(Math.min(entry.contentRect.width / 2240, entry.contentRect.height / 1260)));
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);
  const restart = () => {
    sessionStorage.removeItem('uribaram-flag-message');
    navigate('/');
  };
  const share = async () => {
    const url = new URL('/', window.location.href).href;
    try {
      if (navigator.share) await navigator.share({title: '우리바람', text: '우리 바람, 소리 타고 저 멀리. 함께 연주해 보세요!', url});
      else { await navigator.clipboard.writeText(url); setNotice('우리바람 링크를 복사했어요.'); }
    } catch (error) { if (error.name !== 'AbortError') setNotice('링크를 복사하지 못했어요. 주소창의 주소를 공유해 주세요.'); }
  };
  return <main ref={pageRef} className="page ending-page" aria-label="우리바람 연주 마무리">
    <div className="ending-board" style={{'--ending-scale': scale}}>
      <div className="ending-flag">
      <img className="ending-pole" src="/assets/figma/ending/pole.svg" width="425.793" height="1523.72" alt=""/>
      <img className="ending-cloth" src="/assets/figma/ending/cloth.svg" width="579.833" height="1061.12" alt=""/>
      <div className="ending-writing" aria-label={`농기에 담긴 바람: ${message.join('')}`}>
        {message.map((letter, index) => <span key={index}>{letter}</span>)}
      </div>
      </div>
      <section className="ending-copy">
        <h1>우리 바람,소리 타고 저 멀리.<br/>한바탕 함께 울려보았나요?</h1>
        <button className="ending-story-link" onClick={() => navigate('/story')}>이제 이 소리에 담긴 이야기를 알아 볼까요? &gt;</button>
      </section>
      <nav className="ending-navigation" aria-label="마무리 메뉴">
        <button onClick={restart} aria-label="처음으로">
          <img src="/assets/figma/play-instrument/46c49-blank.svg" width="167" height="292" alt=""/>
          <span>{Array.from('처음으로').map((letter, i) => <i key={i}>{letter}</i>)}</span>
        </button>
        <button onClick={share} aria-label="소문내기">
          <img src="/assets/figma/play-instrument/23616-blank.svg" width="167" height="292" alt=""/>
          <span>{Array.from('소문내기').map((letter, i) => <i key={i}>{letter}</i>)}</span>
        </button>
      </nav>
    </div>
    <p className="ending-notice" role="status">{notice}</p>
  </main>;
}
