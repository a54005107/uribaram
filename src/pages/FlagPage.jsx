import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './FlagPage.css';

const limitMessage = (value) => Array.from(value.replace(/[\r\n]/g, '').normalize('NFC')).slice(0, 4).join('');

export default function FlagPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(() => limitMessage(sessionStorage.getItem('uribaram-flag-message') || ''));
  const composing = useRef(false);
  const [hasEdited, setHasEdited] = useState(() => message.length > 0);
  const inputRef = useRef(null);
  const updateMessage = (input) => {
    // Keep native selection and deletion; never assign input.value or selection.
    setMessage(limitMessage(input.value));
    setHasEdited(true);
  };
  const [color, setColor] = useState(() => {
    const saved = sessionStorage.getItem('uribaram-flag-color');
    return ['red', 'yellow', 'blue'].includes(saved) ? saved : 'red';
  });
  const [scale, setScale] = useState(0);
  const pageRef = useRef(null);
  useEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const {width, height} = entry.contentRect;
      setScale(Math.min(height / 1260, width / 900));
    });
    observer.observe(pageRef.current);
    return () => observer.disconnect();
  }, []);
  const next = (event) => {
    event.preventDefault();
    if (composing.current || event.nativeEvent.isComposing) return;
    sessionStorage.setItem('uribaram-flag-message', limitMessage(message));
    sessionStorage.setItem('uribaram-flag-color', color);
    navigate('/camera');
  };
  return <main ref={pageRef} className="page flag-page" aria-label="깃발 문구 입력">
    <form className="flag-form" onSubmit={next}>
      <div className="flag-controls">
        <label htmlFor="flag-message">어떤 바람을 이루고 싶나요?<br />깃발에 적어 보세요(최대 4자)</label>
        <div className="flag-colors" role="group" aria-label="깃발 색상">
          {[['red', '빨강'], ['yellow', '노랑'], ['blue', '파랑']].map(([value, label]) =>
            <button key={value} type="button" aria-label={label} aria-pressed={color === value} onClick={() => setColor(value)}>
              <span><img src={`/assets/figma/ui/flag-colors/${value}.svg`} width="54" height="52" alt="" /></span>
            </button>)}
        </div>
      </div>
      <div className="flag-stage" style={{transform: `translate(-50%, -50%) scale(${scale})`}}>
        <img className="flag-input-pole" src="/assets/figma/flag/pole/input-screen/original.svg" width="426" height="1524" alt="" />
        <img className="flag-input-cloth" src={`/assets/figma/flag/input/${color === 'red' ? 'screen' : color}/original.svg`} width="580" height="1062" alt="" />
        <div className="flag-writing">
        <textarea ref={inputRef} id="flag-message" className="flag-message"
          rows={4} maxLength={4} value={message}
          placeholder={hasEdited ? '' : '우리바람'} autoComplete="off" spellCheck={false}
          onFocus={() => setHasEdited(true)}
          onCompositionStart={() => { composing.current = true; }}
          onCompositionEnd={(event) => {
            composing.current = false;
            setMessage(limitMessage(event.currentTarget.value));
            setHasEdited(true);
          }}
          onChange={(event) => updateMessage(event.currentTarget)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              if (!composing.current && !event.nativeEvent.isComposing && event.keyCode !== 229) event.currentTarget.form.requestSubmit();
            }
          }}/>
        </div>
      </div>
      <button className="flag-submit" type="submit">바람 담기</button>
    </form>
  </main>;
}
