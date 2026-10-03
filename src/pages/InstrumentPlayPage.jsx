import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate, useSearchParams} from 'react-router-dom';
import CameraExperience from './CameraExperience';
import {instruments, instrumentImage} from './InstrumentsPage';
import './InstrumentPlayPage.css';

export default function InstrumentPlayPage() {
  const [params] = useSearchParams();
  const id = params.get('instrument') || sessionStorage.getItem('uribaram-instrument') || 'janggu';
  const instrument = instruments.find(item => item.id === id) || instruments[1];
  return instrument.id === 'janggu' ? <CameraExperience/> : <PercussionPlay key={instrument.id} instrument={instrument}/>;
}

function PercussionPlay({instrument}) {
  const navigate = useNavigate();
  const audio = useRef(null);
  const timer = useRef(null);
  const [hit, setHit] = useState(false);
  const [error, setError] = useState('');
  const strike = useCallback(async () => {
    setHit(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setHit(false), 160);
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('unsupported');
      const context = audio.current || (audio.current = new AudioContext());
      if (context.state === 'suspended') await context.resume();
      if (context.state === 'closed') return;
      // Synthesized percussion: inharmonic partials for metal, a falling pitch for drums.
      const metal = ['jing', 'kkwaenggwari'].includes(instrument.id);
      const base = {jing: 130, kkwaenggwari: 640, sogo: 230, buk: 95}[instrument.id];
      const duration = {jing: 3.2, kkwaenggwari: 1, sogo: .22, buk: .65}[instrument.id];
      const now = context.currentTime;
      (metal ? [1, 1.47, 2.09, 2.56, 3.8] : [1, 1.6]).forEach((ratio, index) => {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(base * ratio * (metal ? 1 : 1.8), now);
        if (!metal) oscillator.frequency.exponentialRampToValueAtTime(base * ratio, now + .07);
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(.18 / (index + 1), now + .004);
        gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
        oscillator.connect(gain); gain.connect(context.destination);
        oscillator.start(now); oscillator.stop(now + duration);
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
      });
      setError('');
    } catch { setError('소리를 재생하지 못했습니다. 악기를 다시 눌러 주세요.'); }
  }, [instrument.id]);
  useEffect(() => {
    const onKey = event => {
      if (event.code !== 'Space' || event.repeat || event.ctrlKey || event.altKey || event.metaKey || event.target.closest('button, input, textarea, select, [contenteditable="true"]')) return;
      event.preventDefault(); strike();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [strike]);
  useEffect(() => () => {
    clearTimeout(timer.current);
    if (audio.current && audio.current.state !== 'closed') audio.current.close();
  }, []);
  return <main className="page percussion-page" style={{'--instrument-color': instrument.color}}>
    <button className="percussion-back" onClick={() => navigate('/instruments')}>← 악기 고르기</button>
    <h1>{instrument.name}{instrument.id === 'buk' || instrument.id === 'jing' ? '을' : '를'} 연주해 보세요</h1>
    <button className={`percussion-pad${hit ? ' is-hit' : ''}`} aria-label={`${instrument.name} 치기`} onClick={strike}>
      <img src={instrumentImage(instrument.id)} alt={instrument.name} draggable="false" />
    </button>
    <p>악기를 클릭하거나 스페이스 키를 눌러 연주해 보세요</p>
    {error && <p role="alert">{error}</p>}
    <button className="percussion-finish" onClick={() => navigate('/ending')}>체험 완료</button>
  </main>;
}
