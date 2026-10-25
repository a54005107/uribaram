import Peer from 'peerjs';
import {photoReceiverUrl} from './photoUrl.js';
import {startPhotoRelay} from './photoRelay.js';

export const PHOTO_TTL = 5 * 60 * 1000;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const PHOTO_CHUNK_BYTES = 8 * 1024;
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
    'relay-connect-timeout': '기기 간 연결을 완료하지 못했어요. TURN 설정과 네트워크 연결을 확인해 주세요.',
    'transfer-closed': '사진 수신이 끝나기 전에 연결이 끊겼어요. 촬영 화면을 열어 두고 새 QR로 다시 시도해 주세요.',
    'invalid-photo': '전송된 사진 데이터가 올바르지 않아요. 새 QR로 다시 시도해 주세요.',
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
    let channelOpened = false, bytes, started = false, nextIndex = 0, waitingIndex = -1;
    const sendNext = () => {
      if (ended || !bytes || nextIndex * PHOTO_CHUNK_BYTES >= bytes.byteLength) return;
      clearTimeout(sending);
      sending = later(() => { onState(photoConnectionError()); stop(); }, 45000);
      const index = nextIndex++;
      waitingIndex = index;
      conn.send({type:'photo-chunk', index, bytes:bytes.slice(index * PHOTO_CHUNK_BYTES, nextIndex * PHOTO_CHUNK_BYTES)});
    };
    onState({status: 'sending'});
    let sending = later(() => { onState(photoConnectionError(channelOpened ? null : {type:'relay-connect-timeout'})); stop(); }, 45000);
    conn.on('open', () => { channelOpened = true; });
    conn.on('data', async data => {
      if (ended) return;
      if (data?.type === 'ready' && !started) {
        started = true;
        try {
          bytes = await blob.arrayBuffer();
          if (ended) return;
          if (!bytes.byteLength || bytes.byteLength > MAX_PHOTO_BYTES) throw new Error('invalid-photo');
          conn.send({type:'photo-start', size:bytes.byteLength, mime:'image/jpeg'});
          sendNext();
        } catch { if (!ended) { onState(photoConnectionError({type:'invalid-photo'})); stop(); } }
      }
      if (data?.type === 'chunk-received' && data.index === waitingIndex && waitingIndex >= 0) {
        waitingIndex = -1;
        sendNext();
      }
      if (data?.type === 'received' && bytes && nextIndex * PHOTO_CHUNK_BYTES >= bytes.byteLength && !ended) {
        delivered = true;
        clearTimeout(sending);
        onState({status: 'sent'});
        later(stop, 300);
      }
    });
    conn.on('error', error => { if (!ended) { onState(photoConnectionError(error)); stop(); } });
    conn.on('close', () => { if (!ended) { if (!delivered) onState(photoConnectionError({type:channelOpened ? 'transfer-closed' : 'relay-connect-timeout'})); stop(); } });
  });
  peer.on('error', error => { if (!ended) { onState(photoConnectionError(error)); stop(); } });
  return stop;
}

export function receivePhoto(id, token, onState, PeerClass = Peer, options) {
  if (PeerClass === Peer && !options) return startPhotoRelay(
    config => receivePhoto(id, token, onState, PeerClass, config), error => onState(photoConnectionError(error)));
  const peer = new PeerClass(undefined, options || peerOptions);
  let connection, ended = false, received = false, channelOpened = false, signalingOpened = false;
  let chunks = [], expectedSize = 0, receivedSize = 0;
  const stop = () => { ended = true; chunks = []; clearTimeout(timer); connection?.close(); peer.destroy(); };
  const fail = error => { if (!ended && !received) { onState(photoConnectionError(error)); stop(); } };
  let timer = setTimeout(() => fail({type: !signalingOpened ? 'signaling-timeout' : !channelOpened ? 'relay-connect-timeout' : 'transfer-timeout'}), 45000);
  peer.on('open', () => {
    if (ended) return;
    signalingOpened = true;
    connection = peer.connect(id, {reliable: true, metadata: {token}, serialization: 'binary'});
    connection.on('open', () => { channelOpened = true; connection.send({type:'ready'}); });
    connection.on('data', data => {
      if (ended || received) return;
      if (data?.type === 'photo-start') {
        if (expectedSize || !Number.isInteger(data.size) || data.size <= 0 || data.size > MAX_PHOTO_BYTES || data.mime !== 'image/jpeg') { fail({type:'invalid-photo'}); return; }
        expectedSize = data.size;
        return;
      }
      if (data?.type === 'photo-chunk') {
        if (!expectedSize || data.index !== chunks.length || !(data.bytes instanceof ArrayBuffer) || data.bytes.byteLength !== Math.min(PHOTO_CHUNK_BYTES, expectedSize-receivedSize)) { fail({type:'invalid-photo'}); return; }
        chunks.push(data.bytes); receivedSize += data.bytes.byteLength;
        clearTimeout(timer);
        timer = setTimeout(() => fail({type:'transfer-timeout'}),45000);
        if (receivedSize === expectedSize) {
          received = true; clearTimeout(timer);
          const photo = new Blob(chunks, {type:'image/jpeg'}); chunks = [];
          connection.send({type:'received'});
          onState({status:'received',blob:photo});
        } else connection.send({type:'chunk-received',index:data.index});
        return;
      }
      if (data?.type !== 'photo') return;
      if (!(data.bytes instanceof ArrayBuffer) || !data.bytes.byteLength || data.bytes.byteLength > MAX_PHOTO_BYTES || data.mime !== 'image/jpeg') { fail(); return; }
      received = true; clearTimeout(timer);
      onState({status: 'received', blob: new Blob([data.bytes], {type: 'image/jpeg'})});
      connection.send({type: 'received'});
    });
    connection.on('error', fail);
    connection.on('close', () => { if (received) stop(); else fail({type:channelOpened ? 'transfer-closed' : 'relay-connect-timeout'}); });
  });
  peer.on('error', fail);
  return stop;
}

