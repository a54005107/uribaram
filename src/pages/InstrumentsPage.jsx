import React, {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './InstrumentsPage.css';

export const instruments = [
  {id: 'kkwaenggwari', name: '꽹과리', role: '쇠치배', lines: ['판을 이끄는 우두머리,', '날카롭게 가락을 맺고 풉니다'], color: '#ff5ff7'},
  {id: 'janggu', name: '장구', role: '장구잽이', lines: ['양손으로 다른 소리를 내며,', '가락을 곱게 꾸밉니다'], color: '#ffeb36'},
  {id: 'jing', name: '징', role: '징잽이', lines: ['가장 낮고 길게 울려,', '판 전체를 감싸 안습니다'], color: '#00e9ff'},
  {id: 'sogo', name: '소고', role: '소고잽이', lines: ['작지만 가볍게 튀며,', '춤사위와 함께 놀아납니다'], color: '#0775f4'},
  {id: 'buk', name: '북', role: '북잽이', lines: ['묵직한 한 방으로,', '판의 중심을 단단히 잡습니다'], color: '#0dc653'},
];
export const instrumentImage = id => `/assets/figma/instruments/${id}/screen/original.svg`;
const wrapIndex = value => ((value % instruments.length) + instruments.length) % instruments.length;

export default function InstrumentsPage() {
  const navigate = useNavigate();
  // Keep cumulative turns so crossing the last item continues rotating forward.
  const [position, setPosition] = useState(() => Math.max(0, instruments.findIndex(item => item.id === sessionStorage.getItem('uribaram-instrument'))));
  const index = wrapIndex(position);
  const [dragAngle, setDragAngle] = useState(0);
  const [dragging, setDragging] = useState(false);
  const pageRef = useRef(null);
  const gesture = useRef(null);
  const suppressClick = useRef(false);
  const instrument = instruments[index];
  const move = useCallback(step => setPosition(current => current + step), []);
  const jumpTo = target => setPosition(current => {
    const forward = wrapIndex(target - wrapIndex(current));
    return current + (forward > instruments.length / 2 ? forward - instruments.length : forward);
  });
  const choose = id => {
    if (suppressClick.current) return;
    sessionStorage.setItem('uribaram-instrument', id);
    navigate(`/camera?instrument=${id}`);
  };

  useEffect(() => {
    const page = pageRef.current;
    let lastWheel = 0, total = 0, locked = false;
    const onWheel = event => {
      if (event.ctrlKey || gesture.current || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheel > 180) { total = 0; locked = false; }
      lastWheel = now;
      if (locked) return;
      const delta = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? page.clientHeight : 1);
      if (Math.sign(delta) !== Math.sign(total)) total = 0;
      total += delta;
      if (Math.abs(total) >= 40) { move(Math.sign(total)); locked = true; total = 0; }
    };
    const onKey = event => {
      if (event.altKey || event.ctrlKey || event.metaKey || gesture.current || event.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      if (!['ArrowUp', 'ArrowDown'].includes(event.key)) return;
      event.preventDefault();
      if (!event.repeat) move(event.key === 'ArrowDown' ? 1 : -1);
    };
    page.addEventListener('wheel', onWheel, {passive: false});
    window.addEventListener('keydown', onKey);
    return () => { page.removeEventListener('wheel', onWheel); window.removeEventListener('keydown', onKey); };
  }, [move]);

  const finishDrag = (event, cancelled = false) => {
    const current = gesture.current;
    if (!current || current.id !== event.pointerId) return;
    gesture.current = null;
    if (!cancelled && current.moved) {
      const distance = event.clientY - current.y;
      if (Math.abs(distance) >= 55) move(Math.sign(distance));
    }
    setDragging(false);
    setDragAngle(0);
  };

  return <main ref={pageRef} className={`page instruments-page instruments-page--${instrument.id}`}
    style={{'--instrument-color': instrument.color}} aria-label="악기 둘러보기" aria-describedby="instrument-help">
    <div className={`instrument-artwork instrument-dial${dragging ? ' is-dragging' : ''}`}
      onPointerDown={event => {
        if (!event.isPrimary || event.button !== 0) return;
        suppressClick.current = false;
        gesture.current = {id: event.pointerId, x: event.clientX, y: event.clientY, moved: false};
      }}
      onPointerMove={event => {
        const current = gesture.current;
        if (!current || current.id !== event.pointerId) return;
        const distance = event.clientY - current.y;
        if (Math.hypot(event.clientX - current.x, distance) > 8) {
          if (!current.moved) event.currentTarget.setPointerCapture(event.pointerId);
          current.moved = true;
          suppressClick.current = true;
          setDragging(true);
          setDragAngle(Math.max(-65, Math.min(65, distance * .22)));
        }
      }}
      onPointerUp={event => finishDrag(event)} onPointerCancel={event => finishDrag(event, true)}
      onLostPointerCapture={event => finishDrag(event, true)}>
      <div className="instrument-wheel" style={{'--wheel-angle': `${position * 72 + dragAngle}deg`}}>
        {instruments.map((item, itemIndex) => <div key={item.id} className="instrument-slot" style={{'--slot-angle': `${-itemIndex * 72}deg`}}>
          <button className="instrument-pick" type="button" aria-label={`${item.name} 선택하고 연주하기`}
            tabIndex={itemIndex === index ? 0 : -1} onClick={() => choose(item.id)}
            onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') suppressClick.current = false; }}>
            <img src={instrumentImage(item.id)} alt={item.name} draggable="false" />
          </button>
        </div>)}
      </div>
    </div>
    <section className="instrument-copy" aria-live="polite" aria-atomic="true">
      <p className="instrument-question">어떤 역할로 연주해 볼까요?</p>
      <h1>{instrument.role}<span className="instrument-sr-only"> — {instrument.name}</span></h1>
      <p className="instrument-description">{instrument.lines[0]}<br />{instrument.lines[1]}</p>
    </section>
    <nav className="instrument-navigation" aria-label="악기 선택">
      {instruments.map((item, itemIndex) => <button type="button" key={item.id}
        aria-label={`${item.name} · ${item.role}`} aria-current={itemIndex === index ? 'true' : undefined}
        title={item.name} onClick={() => jumpTo(itemIndex)}>
        <span><img src="/assets/figma/instrument-selection/indicator.svg" width="38" height="36" alt="" /></span>
      </button>)}
    </nav>
    <p id="instrument-help" className="instrument-help">스크롤 · ↑ ↓ · 위아래 드래그로 전환 / 악기를 클릭해 연주하기</p>
  </main>;
}
