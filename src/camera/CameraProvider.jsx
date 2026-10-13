import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {cameraErrorMessage, createCameraCapture} from './cameraCapture';

const CameraContext = createContext(null);

export function CameraProvider({children}) {
  const streamRef = useRef(null), requestRef = useRef(0);
  const captureRef = useRef(null);
  if (!captureRef.current) captureRef.current = createCameraCapture(constraints => {
    if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error('unsupported'), {name: 'NotSupportedError'});
    return navigator.mediaDevices.getUserMedia(constraints);
  });
  const releaseTimerRef = useRef(null), pendingAcquireRef = useRef(null);
  const [stream, setStream] = useState(null), [status, setStatus] = useState('idle'), [error, setError] = useState('');
  const [devices, setDevices] = useState([]), [info, setInfo] = useState(null);
  const [deviceId, setDeviceId] = useState(() => sessionStorage.getItem('uribaram-camera-id') || '');

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    let cameras;
    try { cameras = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput'); }
    catch { return []; }
    setDevices(cameras);
    setDeviceId((current) => cameras.some((camera) => camera.deviceId === current) ? current : '');
    return cameras;
  }, []);

  const stop = useCallback(() => {
    clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = null;
    pendingAcquireRef.current = null;
    requestRef.current += 1;
    captureRef.current.stop();
    streamRef.current = null;
    setStream(null); setInfo(null); setStatus('idle'); setError('');
  }, []);

  const start = useCallback(async (requestedDeviceId = deviceId) => {
    clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = null;
    const requestId = ++requestRef.current;
    streamRef.current = null;
    setStream(null); setInfo(null);
    setStatus('loading'); setError('');
    try {
      const nextStream = await captureRef.current.start(requestedDeviceId);
      if (requestId !== requestRef.current || !nextStream) return null;
      streamRef.current = nextStream; setStream(nextStream);
      const track = nextStream.getVideoTracks()[0], settings = track.getSettings();
      const trackInfo = {label: track.label, readyState: track.readyState, ...settings};
      setInfo(trackInfo); setStatus('ready');
      if (settings.deviceId) { setDeviceId(settings.deviceId); sessionStorage.setItem('uribaram-camera-id', settings.deviceId); }
      await refreshDevices();
      track.addEventListener('ended', () => {
        if (streamRef.current !== nextStream) return;
        streamRef.current = null; setStream(null); setInfo(null); setStatus('error'); setError('카메라 연결이 종료되었습니다.');
      }, {once: true});
      return nextStream;
    } catch (cause) {
      if (requestId !== requestRef.current) return null;
      setStatus('error'); setError(cameraErrorMessage(cause));
      await refreshDevices();
      return null;
    }
  }, [deviceId, refreshDevices]);

  // Camera setup and performance share one capture session. Defer release until
  // the next route has mounted; an acquiring camera page cancels that release.
  const acquire = useCallback(() => {
    clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = null;
    const current = streamRef.current;
    if (current?.getVideoTracks().some(track => track.readyState === 'live')) {
      setStatus('ready'); setError('');
      return Promise.resolve(current);
    }
    if (pendingAcquireRef.current) return pendingAcquireRef.current;
    const pending = start();
    pendingAcquireRef.current = pending;
    void pending.finally(() => {
      if (pendingAcquireRef.current === pending) pendingAcquireRef.current = null;
    });
    return pending;
  }, [start]);

  const release = useCallback(() => {
    clearTimeout(releaseTimerRef.current);
    releaseTimerRef.current = setTimeout(stop, 0);
  }, [stop]);

  const selectDevice = useCallback(async (nextDeviceId, restart = true) => {
    setDeviceId(nextDeviceId);
    if (nextDeviceId) sessionStorage.setItem('uribaram-camera-id', nextDeviceId);
    else sessionStorage.removeItem('uribaram-camera-id');
    if (restart && streamRef.current) return start(nextDeviceId);
    return null;
  }, [start]);

  const attach = useCallback(async (videoElement) => {
    if (!videoElement || !streamRef.current) return false;
    if (videoElement.srcObject !== streamRef.current) videoElement.srcObject = streamRef.current;
    await videoElement.play();
    return true;
  }, []);

  useEffect(() => {
    refreshDevices();
    const mediaDevices = navigator.mediaDevices;
    mediaDevices?.addEventListener?.('devicechange', refreshDevices);
    return () => { clearTimeout(releaseTimerRef.current); requestRef.current += 1; mediaDevices?.removeEventListener?.('devicechange', refreshDevices); captureRef.current.stop(); };
  }, [refreshDevices]);

  const value = useMemo(() => ({stream, status, error, devices, deviceId, info, start, stop, acquire, release, selectDevice, refreshDevices, attach}), [stream, status, error, devices, deviceId, info, start, stop, acquire, release, selectDevice, refreshDevices, attach]);
  return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
}

export function useCamera() {
  const camera = useContext(CameraContext);
  if (!camera) throw new Error('useCamera must be used inside CameraProvider');
  return camera;
}
