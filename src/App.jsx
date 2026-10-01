import React from 'react';
import {Navigate, Route, Routes} from 'react-router-dom';
import Home from './pages/Home';
import CameraSetup from './pages/CameraSetup';
import CameraExperience from './pages/CameraExperience';
import {CameraProvider} from './camera/CameraProvider';

export default function App() {
  return <CameraProvider><Routes>
    <Route path="/" element={<Home/>}/>
    <Route path="/camera" element={<CameraSetup/>}/>
    <Route path="/experience" element={<CameraExperience/>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></CameraProvider>;
}
