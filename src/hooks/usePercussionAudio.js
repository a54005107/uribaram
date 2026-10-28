import {useCallback, useEffect, useRef, useState} from 'react';
import {audioContext, unlockAudio, loadInstrument, loadSample, chooseSample, playSample} from '../audio/percussion';

export default function usePercussionAudio(instrumentId) {
  const buffers = useRef(new Map());
  const voices = useRef(new Set());
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const enable = useCallback(async () => {
    try { setEnabled(await unlockAudio()); setError(''); }
    catch { setError('소리를 켜지 못했습니다. 다시 눌러 주세요.'); }
  }, []);
  useEffect(() => {
    let active = true;
    buffers.current = new Map();
    loadInstrument(instrumentId).then(value => { if (active) buffers.current = value; })
      .catch(() => { if (active) setError('악기 음원을 불러오지 못했습니다.'); });
    return () => { active = false; };
  }, [instrumentId]);
  useEffect(() => {
    const ctx = audioContext();
    let active = true;
    let backing;
    let backingBuffer;
    const update = () => {
      if (!active) return;
      setEnabled(ctx.state === 'running');
      if (ctx.state === 'running' && backingBuffer && !backing) backing = playSample(backingBuffer, .38, true);
    };
    ctx.addEventListener('statechange', update);
    loadSample('backing').then(value => { backingBuffer = value; update(); })
      .catch(() => { if (active) setError('배경 음원을 불러오지 못했습니다.'); });
    update();
    return () => {
      active = false;
      ctx.removeEventListener('statechange', update);
      backing?.stop();
      for (const source of voices.current) source.stop();
      voices.current.clear();
    };
  }, []);
  const strike = useCallback(hit => {
    const buffer = buffers.current.get(chooseSample(instrumentId));
    if (!buffer) return; // Never replay late hits after asynchronous decoding.
    while (voices.current.size >= 24) {
      const oldest = voices.current.values().next().value;
      oldest.stop(); voices.current.delete(oldest);
    }
    const source = playSample(buffer, {weak: .45, normal: .7, strong: .95}[hit.strength] ?? .7);
    if (source) {
      voices.current.add(source);
      source.addEventListener('ended', () => voices.current.delete(source), {once: true});
    }
  }, [instrumentId]);
  return {enable, enabled, error, strike};
}
