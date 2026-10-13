import React from 'react';
import {Navigate, Route} from 'react-router-dom';
import PageTransitions from './components/PageTransitions';
import Home from './pages/Home';
import TitlePage from './pages/TitlePage';
import TrumpetPage from './pages/TrumpetPage';
import FlagPage from './pages/FlagPage';
import LoadingPage from './pages/LoadingPage';
import PlayLoadingPage from './pages/PlayLoadingPage';
import InstrumentsPage from './pages/InstrumentsPage';
import EndingPage from './pages/EndingPage';

import InstrumentPlayPage from './pages/InstrumentPlayPage';
import CameraSetup from './pages/CameraSetup';
import {CameraProvider} from './camera/CameraProvider';
import FullscreenButton from './components/FullscreenButton';

export default function App() {
  return <CameraProvider><FullscreenButton/><PageTransitions>
    <Route path="/" element={<Home/>}/>
    <Route path="/title" element={<TitlePage/>}/>
    <Route path="/trumpet" element={<TrumpetPage/>}/>
    <Route path="/flag" element={<FlagPage/>}/>
    <Route path="/loading" element={<LoadingPage/>}/>
    <Route path="/play-loading" element={<PlayLoadingPage/>}/>
    <Route path="/instruments" element={<InstrumentsPage/>}/>
    <Route path="/camera" element={<CameraSetup/>}/>
    <Route path="/experience" element={<InstrumentPlayPage/>}/>
    <Route path="/ending" element={<EndingPage/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </PageTransitions></CameraProvider>;
}
