import {useCallback, useEffect, useRef, useState} from 'react';

const VOICES = {
  kkwaenggwari: {pitch: 640, decay: 1.1, metal: true},
  jing: {pitch: 130, decay: 3.2, metal: true},
  sogo: {pitch: 230, decay: .22},
  buk: {pitch: 95, decay: .65},
  janggu: {pitch: 150, decay: .45},
};

export default function usePercussionAudio(instrumentId) {
  const contextRef = useRef(null);
  const outputRef = useRef(null);
  const voicesRef = useRef(new Set());
  const [enabled, setEnabled] = useState(false);
  const [error, setError] = useState('');
  const enable = useCallback(async () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) throw new Error('unsupported');
      let context = contextRef.current;
      if (!context || context.state === 'closed') {
        context = new AudioContext();
        contextRef.current = context;
        const compressor = context.createDynamicsCompressor();
        compressor.connect(context.destination);
        outputRef.current = compressor;
        context.onstatechange = () => { if (contextRef.current === context) setEnabled(context.state === 'running'); };
      }
      await context.resume();
      if (contextRef.current !== context) return;
      setEnabled(context.state === 'running');
      setError('');
    } catch { setError('소리를 켜지 못했습니다. 다시 눌러 주세요.'); }
  }, []);
  const strike = useCallback(hit => {
    const context = contextRef.current;
    if (!context || context.state !== 'running') return;
    // Do not queue blocked hits; camera gestures are not browser user activation.
    const voice = VOICES[instrumentId];
    const pitch = voice.pitch * (instrumentId === 'janggu' && hit.side === 'right' ? 1.65 : 1);
    const volume = {weak: .11, normal: .19, strong: .27}[hit.strength] || .19;
    const now = context.currentTime;
    while (voicesRef.current.size >= 12) {
      const oldest = voicesRef.current.values().next().value;
      oldest.forEach(node => node.stop());
      voicesRef.current.delete(oldest);
    }
    const group = [];
    voicesRef.current.add(group);
    (voice.metal ? [1, 1.47, 2.09, 2.56, 3.8] : [1, 1.6, 2.2]).forEach((ratio, index) => {
      const oscillator = context.createOscillator(), gain = context.createGain();
      group.push(oscillator);
      oscillator.frequency.setValueAtTime(pitch * ratio * (voice.metal ? 1 : 1.8), now);
      if (!voice.metal) oscillator.frequency.exponentialRampToValueAtTime(pitch * ratio, now + .07);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume / (index + 1), now + .004);
      gain.gain.exponentialRampToValueAtTime(.0001, now + voice.decay);
      oscillator.connect(gain); gain.connect(outputRef.current);
      oscillator.start(now); oscillator.stop(now + voice.decay);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); voicesRef.current.delete(group); };
    });
  }, [instrumentId]);
  useEffect(() => () => {
    const context = contextRef.current;
    contextRef.current = null;
    voicesRef.current.clear();
    if (context) { context.onstatechange = null; if (context.state !== 'closed') void context.close(); }
  }, []);
  return {enable, enabled, error, strike};
}
