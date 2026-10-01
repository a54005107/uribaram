import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import TrumpetPage from './pages/TrumpetPage';
import FlagPage from './pages/FlagPage';
import EndingPage from './pages/EndingPage';
import CameraSetup from './pages/CameraSetup';
import CameraExperience from './pages/CameraExperience';
import {CameraProvider} from './camera/CameraProvider';
import FullscreenButton from './components/FullscreenButton';

export default function App() {
  return <CameraProvider><FullscreenButton/><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/trumpet" element={<TrumpetPage/>}/>
    <Route path="/flag" element={<FlagPage/>}/>
    <Route path="/camera" element={<CameraSetup/>}/>
    <Route path="/experience" element={<CameraExperience/>}/>
    <Route path="/ending" element={<EndingPage/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></CameraProvider>;
}
