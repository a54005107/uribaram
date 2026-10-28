import React, {lazy, Suspense, useEffect} from 'react';
import {unlockAudio} from './audio/percussion';
import {Navigate, Route, useLocation} from 'react-router-dom';
import PageTransitions from './components/PageTransitions';
import Home from './pages/Home';
import TitlePage from './pages/TitlePage';
import TrumpetPage from './pages/TrumpetPage';
import FlagPage from './pages/FlagPage';
import LoadingPage from './pages/LoadingPage';
import PlayLoadingPage from './pages/PlayLoadingPage';
import InstrumentsPage from './pages/InstrumentsPage';
import EndingPage from './pages/EndingPage';
import StoryPage from './pages/StoryPage';

import InstrumentPlayPage from './pages/InstrumentPlayPage';
import CameraSetup from './pages/CameraSetup';
import {CameraProvider} from './camera/CameraProvider';
import SiteMenu from './components/SiteMenu';
import ExperienceCursor from './components/ExperienceCursor';
import useIdleReturn from './hooks/useIdleReturn';
const PhotoPage = lazy(() => import('./pages/PhotoPage'));
const ReceivePhotoPage = lazy(() => import('./pages/ReceivePhotoPage'));

function HomeEntry() {
  const {hash} = useLocation();
  return hash.startsWith('#photo=') ? <Navigate to={'/receive-photo' + hash} replace/> : <Home/>;
}

export default function App() {
  useIdleReturn();
  useEffect(() => {
    const unlock = () => { void unlockAudio().catch(() => {}); };
    window.addEventListener('pointerdown', unlock, {once: true});
    window.addEventListener('keydown', unlock, {once: true});
    return () => { window.removeEventListener('pointerdown', unlock); window.removeEventListener('keydown', unlock); };
  }, []);
  return <CameraProvider><ExperienceCursor/><SiteMenu/><PageTransitions>
    <Route path="/" element={<HomeEntry/>}/>
    <Route path="/title" element={<TitlePage/>}/>
    <Route path="/trumpet" element={<TrumpetPage/>}/>
    <Route path="/flag" element={<FlagPage/>}/>
    <Route path="/loading" element={<LoadingPage/>}/>
    <Route path="/play-loading" element={<PlayLoadingPage/>}/>
    <Route path="/instruments" element={<InstrumentsPage/>}/>
    <Route path="/camera" element={<CameraSetup/>}/>
    <Route path="/experience" element={<InstrumentPlayPage/>}/>
    <Route path="/ending" element={<EndingPage/>}/>
    <Route path="/story" element={<StoryPage/>}/>
    <Route path="/photo" element={<Suspense fallback={<p>카메라 준비 중…</p>}><PhotoPage/></Suspense>}/>
    <Route path="/receive-photo" element={<Suspense fallback={<p>사진 연결 준비 중…</p>}><ReceivePhotoPage/></Suspense>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </PageTransitions></CameraProvider>;
}
