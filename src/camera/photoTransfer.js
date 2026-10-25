import Peer from 'peerjs';
import {photoReceiverUrl} from './photoUrl.js';
import {startPhotoRelay} from './photoRelay.js';

export const PHOTO_TTL = 5 * 60 * 1000;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
// PeerServer exchanges connection metadata only. Photos use the WebRTC data channel.
// Real connections receive short-lived TURN credentials from photoRelay.
// This fallback is used by injected peers in transport unit tests.
const peerOptions = {secure: true};

export function photoConnectionError(error, phase = 'connection') {
  const code = error?.type || (phase === 'signaling' ? 'signaling-timeout' : 'transfer-timeout');
  const messages = {
    'relay-not-configured': '사진 전송 서비스 설정이 아직 완료되지 않았어요. 촬영 화면에서 사진 저장을 이용해 주세요.',
    'relay-unavailable': '사진 중계 서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요.',
    'peer-unavailable': '촬영 화면과 연결할 수 없어요. PC에서 촬영 화면을 열어 두고 새 QR을 만들어 주세요.',
    'network': '사진 연결 서버에 접속하지 못했어요. 인터넷 연결을 확인하고 새 QR로 시도해 주세요.',
    'server-error': '사진 연결 서버가 응답하지 않아요. 잠시 후 새 QR로 시도해 주세요.',
    'socket-error': '사진 연결 서버와 통신이 끊겼어요. 새 QR을 만들어 주세요.',
    'socket-closed': '사진 연결 서버와 연결이 종료됐어요. 새 QR을 만들어 주세요.',
    'browser-incompatible': '이 브라우저에서 사진 연결을 지원하지 않아요. Safari 또는 Chrome에서 QR 주소를 열어 주세요.',
    'signaling-timeout': '사진 연결 서버의 응답이 늦어지고 있어요. 잠시 후 새 QR로 시도해 주세요.',
    'transfer-timeout': '사진 전송 연결 시간이 초과됐어요. 촬영 화면을 열어 두고 새 QR로 시도해 주세요.',
    'webrtc': '기기 간 사진 전송 연결에 실패했어요. Safari 또는 Chrome에서 새 QR로 시도해 주세요.',
  };
  return {status: 'error', code, message: messages[code] || '사진 전송 중 오류가 발생했어요. 촬영 화면에서 새 QR을 만들어 주세요.'};
}

export function offerPhoto(blob, onState, PeerClass = Peer, options) {
  if (PeerClass === Peer && !options) return startPhotoRelay(
    config => offerPhoto(blob, onState, PeerClass, config), error => onState(photoConnectionError(error)));
  let receiver;
  try { receiver = photoReceiverUrl(location.href, import.meta.env?.VITE_PHOTO_PUBLIC_URL, import.meta.env?.VITE_DEV_LAN_HOST); }
  catch (error) { onState({status: 'error', message: error.message}); return () => {}; }
  const token = crypto.randomUUID();
  const peer = new PeerClass(undefined, options || peerOptions);
  let connection, claimed = false, ended = false, delivered = false;
  const timers = new Set();
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.add(id); return id; };
  const stop = () => {
    if (ended) return;
    ended = true;
    timers.forEach(clearTimeout);
    connection?.close(); peer.destroy(); blob = null;
  };
  later(() => { onState({status: 'expired'}); stop(); }, PHOTO_TTL);
  const opening = later(() => { onState(photoConnectionError(null, 'signaling')); stop(); }, 20000);
  peer.on('open', id => {
    if (ended) return;
    clearTimeout(opening);
    const url = new URL(receiver);
    url.hash = 'photo=' + encodeURIComponent(id) + '&token=' + token;
    onState({status: 'ready', url: url.href, localNetwork: /^(192\.168\.|10\.|172\.(1[6-9]|2\d|3[01])\.)/.test(url.hostname)});
  });
  peer.on('connection', conn => {
    if (ended || claimed || conn.metadata?.token !== token) { conn.close(); return; }
    claimed = true; connection = conn;
    onState({status: 'sending'});
    const sending = later(() => { onState(photoConnectionError()); stop(); }, 45000);
    conn.on('open', async () => {
      try {
        const bytes = await blob.arrayBuffer();
        if (!ended) conn.send({type: 'photo', bytes, mime: 'image/jpeg'});
      } catch { if (!ended) { onState({status: 'error'}); stop(); } }
    });
    conn.on('data', data => {
      if (data?.type === 'received' && !ended) {
        delivered = true;
        clearTimeout(sending);
        onState({status: 'sent'});
        later(stop, 300);
      }
    });
    conn.on('error', error => { if (!ended) { onState(photoConnectionError(error)); stop(); } });
    conn.on('close', () => { if (!ended) { if (!delivered) onState({status: 'closed'}); stop(); } });
  });
  peer.on('error', error => { if (!ended) { onState(photoConnectionError(error)); stop(); } });
  return stop;
}

export function receivePhoto(id, token, onState, PeerClass = Peer, options) {
  if (PeerClass === Peer && !options) return startPhotoRelay(
    config => receivePhoto(id, token, onState, PeerClass, config), error => onState(photoConnectionError(error)));
  const peer = new PeerClass(undefined, options || peerOptions);
  let connection, ended = false, received = false;
  const stop = () => { ended = true; clearTimeout(timer); connection?.close(); peer.destroy(); };
  const fail = error => { if (!ended && !received) { onState(photoConnectionError(error)); stop(); } };
  const timer = setTimeout(fail, 45000);
  peer.on('open', () => {
    if (ended) return;
    connection = peer.connect(id, {reliable: true, metadata: {token}, serialization: 'binary'});
    connection.on('data', data => {
      if (ended || received || data?.type !== 'photo') return;
      if (!(data.bytes instanceof ArrayBuffer) || !data.bytes.byteLength || data.bytes.byteLength > MAX_PHOTO_BYTES || data.mime !== 'image/jpeg') { fail(); return; }
      received = true; clearTimeout(timer);
      onState({status: 'received', blob: new Blob([data.bytes], {type: 'image/jpeg'})});
      connection.send({type: 'received'});
    });
    connection.on('error', fail);
    connection.on('close', () => { if (received) stop(); else fail(); });
  });
  peer.on('error', fail);
  return stop;
}

