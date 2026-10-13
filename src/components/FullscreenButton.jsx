import React, {useEffect, useState} from 'react';
import {Maximize, Minimize} from 'lucide-react';

export default function FullscreenButton() {
  const [active, setActive] = useState(Boolean(document.fullscreenElement));
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const sync = () => {
      setActive(Boolean(document.fullscreenElement));
      setError('');
    };
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  const toggle = async () => {
    setError('');
    setPending(true);
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else if (document.fullscreenEnabled && document.documentElement.requestFullscreen) {
        // The document persists while React Router switches page components.
        await document.documentElement.requestFullscreen();
      } else {
        setError('이 브라우저에서는 전체화면 버튼을 지원하지 않습니다. PC에서는 F11을 사용해주세요.');
      }
    } catch {
      setError('전체화면으로 전환하지 못했습니다. 버튼을 다시 누르거나 F11을 사용해주세요.');
    } finally {
      setPending(false);
    }
  };

  return <div className="fullscreen-control">
    <button type="button" onClick={toggle} disabled={pending} aria-pressed={active}
      aria-label={active ? '전체화면 종료' : '전체화면 시작'}
      title={active ? '전체화면 종료 (Esc)' : '전체화면 시작'}>
      {active ? <Minimize size={18}/> : <Maximize size={18}/>}
      <span>{active ? '전체화면 종료' : '전체화면'}</span>
    </button>
    {error && <p role="alert">{error}</p>}
  </div>;
}
