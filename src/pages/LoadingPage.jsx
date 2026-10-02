import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './LoadingPage.css';

const TRANSITION_DELAY_MS = 3000;

export default function LoadingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = window.setTimeout(() => {
      navigate('/camera', {replace: true});
    }, TRANSITION_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  return <main className="page loading-page" aria-label="바람 담기 완료">
    <p className="loading-message" role="status">
      당신의 바람이 농기에 담겼어요<br />
      이제 소리로 울려볼 차례예요
    </p>
  </main>;
}
