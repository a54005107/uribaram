import React, {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useCamera} from '../camera/CameraProvider';

export default function EndingPage() {
  const navigate = useNavigate();
  const {stop} = useCamera();
  useEffect(() => { stop(); }, [stop]);
  const restart = () => {
    sessionStorage.removeItem('uribaram-flag-message');
    navigate('/');
  };
  return <main className="flow-page">
    <section className="flow-content">
      <h1>우리바람 체험이 완료되었습니다.</h1>
      <button className="primary-button" onClick={restart}>처음으로</button>
    </section>
  </main>;
}
