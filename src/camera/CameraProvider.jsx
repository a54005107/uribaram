import React, {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';

const CameraContext = createContext(null);
const errorMessages = {
  NotAllowedError: '카메라 권한이 차단되었습니다. 브라우저 주소창에서 권한을 허용해주세요.',
  NotFoundError: '연결된 카메라를 찾을 수 없습니다.',
  NotReadableError: '선택한 카메라를 다른 프로그램이 사용 중입니다.',
  OverconstrainedError: '선택한 카메라를 사용할 수 없습니다. 다른 카메라를 선택해주세요.',
  SecurityError: '카메라는 HTTPS 또는 localhost에서만 사용할 수 있습니다.',
};
const stopTracks = (stream) => stream?.getTracks().forEach((track) => track.stop());

export function CameraProvider({children}) {
  const streamRef = useRef(null), requestRef = useRef(0);
  const [stream, setStream] = useState(null), [status, setStatus] = useState('idle'), [error, setError] = useState('');
  const [devices, setDevices] = useState([]), [info, setInfo] = useState(null);
  const [deviceId, setDeviceId] = useState(() => sessionStorage.getItem('uribaram-camera-id') || '');

  const refreshDevices = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) return [];
    const cameras = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === 'videoinput');
    setDevices(cameras);
    setDeviceId((current) => cameras.some((camera) => camera.deviceId === current) ? current : '');
    return cameras;
  }, []);

  const stop = useCallback(() => {
    requestRef.current += 1;
    stopTracks(streamRef.current);
    streamRef.current = null;
    setStream(null); setInfo(null); setStatus('idle'); setError('');
  }, []);

  const start = useCallback(async (requestedDeviceId = deviceId) => {
    const requestId = ++requestRef.current;
    setStatus('loading'); setError('');
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('unsupported');
      const constraints = requestedDeviceId
        ? {deviceId: {exact: requestedDeviceId}, width: {ideal: 1280}, height: {ideal: 720}, frameRate: {ideal: 30}}
        : {facingMode: {ideal: 'user'}, width: {ideal: 1280}, height: {ideal: 720}, frameRate: {ideal: 30}};
      const nextStream = await navigator.mediaDevices.getUserMedia({video: constraints, audio: false});
      if (requestId !== requestRef.current) { stopTracks(nextStream); return null; }
      const previousStream = streamRef.current;
      streamRef.current = nextStream; setStream(nextStream);
      if (previousStream !== nextStream) stopTracks(previousStream);
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
      setStatus('error'); setError(errorMessages[cause.name] || `카메라를 실행하지 못했습니다. ${cause.message || ''}`);
      await refreshDevices();
      return null;
    }
  }, [deviceId, refreshDevices]);

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
    return () => { mediaDevices?.removeEventListener?.('devicechange', refreshDevices); stopTracks(streamRef.current); };
  }, [refreshDevices]);

  const value = useMemo(() => ({stream, status, error, devices, deviceId, info, start, stop, selectDevice, refreshDevices, attach}), [stream, status, error, devices, deviceId, info, start, stop, selectDevice, refreshDevices, attach]);
  return <CameraContext.Provider value={value}>{children}</CameraContext.Provider>;
}

export function useCamera() {
  const camera = useContext(CameraContext);
  if (!camera) throw new Error('useCamera must be used inside CameraProvider');
  return camera;
}
