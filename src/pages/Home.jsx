import React, {useEffect} from 'react';
import {ArrowRight, Camera, Wind} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';

export default function Home() {
  const navigate = useNavigate();
  const {stop} = useCamera();
  useEffect(() => { stop(); }, [stop]);
  return <main className="home-page">
    <header className="simple-header"><div className="simple-brand"><Wind/><b>우리바람</b></div></header>
    <section className="home-hero"><div className="hero-copy">
      <span>카메라로 만나는 우리 풍물</span>
      <h1>내 움직임이<br/>풍물놀이가 됩니다</h1>
      <p>카메라가 얼굴과 몸의 움직임을 인식하면<br/>화면 속에 풍물 악기가 나타납니다.</p>
      <button className="primary-button" onClick={() => navigate('/camera')}><Camera/> 카메라 체험 시작 <ArrowRight/></button>
    </div></section>
  </main>;
}
