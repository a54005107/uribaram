import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';

export default function FlagPage() {
  const navigate = useNavigate();
  const [message, setMessage] = useState(() => sessionStorage.getItem('uribaram-flag-message') || '');
  const next = (event) => {
    event.preventDefault();
    sessionStorage.setItem('uribaram-flag-message', message);
    navigate('/camera');
  };
  return <main className="flow-page">
    <section className="flow-content">
      <h1>깃발 문구 입력</h1>
      <form className="flow-form" onSubmit={next}>
        <label htmlFor="flag-message">바람에 담을 말을 입력해주세요.</label>
        <input id="flag-message" value={message} onChange={(event) => setMessage(event.target.value)}/>
        <button className="primary-button" type="submit">다음</button>
      </form>
    </section>
  </main>;
}
