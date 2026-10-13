const stopTracks = stream => stream?.getTracks().forEach(track => track.stop());
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
const isStartupFailure = error => ['NotReadableError', 'AbortError'].includes(error?.name)
  || /timeout.*(video|source)|could not start video source/i.test(error?.message || '');

export function cameraErrorMessage(error) {
  if (/timeout/i.test(error?.message || '')) return '카메라 영상 시작 시간이 초과됐어요. 카메라를 사용하는 다른 탭이나 앱을 닫고 ‘다시 연결’을 눌러 주세요.';
  const messages = {
    NotAllowedError: '카메라 권한이 차단되었습니다. 브라우저 주소창에서 권한을 허용해주세요.',
    NotFoundError: '연결된 카메라를 찾을 수 없습니다.',
    NotReadableError: '카메라에서 영상을 받아오지 못했어요. 다른 탭이나 앱의 카메라 사용을 종료한 뒤 다시 연결해 주세요.',
    AbortError: '카메라 영상 시작이 중단됐어요. 잠시 후 다시 연결해 주세요.',
    OverconstrainedError: '선택한 카메라를 사용할 수 없습니다. 다른 카메라를 선택해주세요.',
    SecurityError: '카메라는 HTTPS 또는 localhost에서만 사용할 수 있습니다.',
    NotSupportedError: '이 환경에서는 카메라를 사용할 수 없습니다. HTTPS 또는 localhost에서 열어 주세요.',
  };
  return messages[error?.name] || '카메라를 실행하지 못했습니다. 카메라 연결을 확인하고 다시 연결해 주세요.';
}

// getUserMedia cannot be cancelled. Serialize captures so a late request cannot
// contend with a newer one for the same physical camera.
export function createCameraCapture(getUserMedia, wait = pause) {
  let generation = 0, active = null, current = null, queue = Promise.resolve(), needsRelease = false;
  return {
    start(deviceId = '') {
      if (active?.deviceId === deviceId) return active.promise;
      const version = ++generation;
      const valid = () => version === generation;
      const promise = queue.then(async () => {
        if (!valid()) return null;
        if (current) { stopTracks(current); current = null; needsRelease = true; }
        if (needsRelease) { await wait(400); needsRelease = false; }
        for (let attempt = 0; attempt < 2; attempt++) {
          if (!valid()) return null;
          // On a driver startup failure retry at the device's native defaults.
          // Keep an explicitly chosen camera; never switch devices silently.
          const selection = deviceId ? {deviceId: {exact: deviceId}} : {};
          const video = attempt === 0
            ? {...selection, ...(!deviceId ? {facingMode: {ideal: 'user'}} : {}), width: {ideal: 1280}, height: {ideal: 720}, frameRate: {ideal: 30}}
            : deviceId ? selection : true;
          try {
            const stream = await getUserMedia({video, audio: false});
            if (!valid()) { stopTracks(stream); needsRelease = true; return null; }
            if (!stream.getVideoTracks().some(track => track.readyState === 'live')) {
              stopTracks(stream);
              throw Object.assign(new Error('Camera track ended during startup'), {name: 'AbortError'});
            }
            current = stream;
            return stream;
          } catch (error) {
            if (!valid()) return null;
            if (attempt || !isStartupFailure(error)) throw error;
            await wait(800);
          }
        }
        return null;
      });
      active = {deviceId, promise};
      queue = promise.catch(() => {}).finally(() => { if (active?.promise === promise) active = null; });
      return promise;
    },
    stop() {
      generation++;
      active = null;
      if (current) { stopTracks(current); current = null; needsRelease = true; }
    },
  };
}
