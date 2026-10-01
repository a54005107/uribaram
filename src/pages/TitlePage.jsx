import React from 'react';
import {useNavigate} from 'react-router-dom';
import '../../public/assets/figma/styles/tokens.css';
import './TitlePage.css';

export default function TitlePage() {
  const navigate = useNavigate();
  return <main className="page title-page">
    <div className="title-content">
      <h1><img src="/assets/figma/brand/logo/screen/original.svg" alt="우리바람" /></h1>
      <button className="primary-button" onClick={() => navigate('/trumpet')}>시작하기</button>
    </div>
  </main>;
}
