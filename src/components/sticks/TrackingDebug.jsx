import React, {useEffect, useState} from 'react';
import {TRACKING_CONFIG} from '../../config/stickInteractionConfig';

const number = value => Number.isFinite(value) ? value.toFixed(2) : '—';
const point = value => value ? `${number(value.x)}, ${number(value.y)}` : '—';

export default function TrackingDebug({diagnosticsRef, samplesRef}) {
  const [snapshot, setSnapshot] = useState(null);
  useEffect(() => {
    const update = () => {
      const now = performance.now();
      setSnapshot({...diagnosticsRef.current, now, samples: samplesRef.current.sampleForHit(now)});
    };
    update();
    const timer = setInterval(update, 250);
    return () => clearInterval(timer);
  }, [diagnosticsRef, samplesRef]);
  if (!snapshot) return null;
  return <details open style={{position: 'absolute', zIndex: 10, right: 12, top: '25%', maxWidth: 'calc(100% - 24px)',
    background: '#101820ee', color: '#fff', padding: 12, borderRadius: 8, font: '12px/1.6 monospace'}}>
    <summary>손 추적 디버그 · 개발 전용</summary>
    <div>카메라 {number(snapshot.now - snapshot.cameraFrameAt > 1000 ? 0 : snapshot.cameraFps)} / 렌더 {number(snapshot.renderFps)} FPS</div>
    <div>추론 {number(snapshot.inferenceFps)} FPS · {number(snapshot.inferenceMs)} ms</div>
    {['left', 'right'].map(side => {
      const hand = snapshot.hands[side] || {}, sample = snapshot.samples[side];
      const lost = hand.lost || snapshot.now - hand.lastSeen > TRACKING_CONFIG.staleAfterMs;
      return <div key={side} style={{borderTop: '1px solid #ffffff44', marginTop: 6}}>
        <b>{side === 'left' ? '왼손' : '오른손'}</b> · {sample && !lost ? sample.recovering ? '재연결 보간' : '추적 중' : '손실 / 미검출'}
        <div>원본(분홍): {point(hand.raw)}</div>
        <div>필터(흰색): {point(hand.filtered)}</div>
        <div>속도: {number(hand.speed)} 영상 높이/s</div>
        <div>이상치: {hand.outlier ? '감지' : '없음'} · 손 구분: {hand.ambiguous ? '불확실' : '정상'}</div>
        <div>타격: {sample?.grip.grabbed && !sample.stale ? '가능' : '차단'} · {hand.reason || '대기'}</div>
      </div>;
    })}
  </details>;
}
