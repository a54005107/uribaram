import Peer from 'peerjs';
import {photoReceiverUrl} from './photoUrl.js';

export const PHOTO_TTL = 5 * 60 * 1000;
export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
// PeerServer exchanges connection metadata only. Photos use the WebRTC data channel.
// STUN-only: restricted networks may require a separately configured TURN service.
const peerOptions = {config: {iceServers: [{urls: 'stun:stun.l.google.com:19302'}]}};

export function offerPhoto(blob, onState, PeerClass = Peer) {
  let receiver;
  try { receiver = photoReceiverUrl(location.href, import.meta.env?.VITE_PHOTO_PUBLIC_URL, import.meta.env?.VITE_DEV_LAN_HOST); }
  catch (error) { onState({status: 'error', message: error.message}); return () => {}; }
  const token = crypto.randomUUID();
  const peer = new PeerClass(undefined, peerOptions);
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
  const opening = later(() => { onState({status: 'error'}); stop(); }, 15000);
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
    conn.on('open', async () => {
      try {
        const bytes = await blob.arrayBuffer();
        if (!ended) conn.send({type: 'photo', bytes, mime: 'image/jpeg'});
      } catch { if (!ended) { onState({status: 'error'}); stop(); } }
    });
    conn.on('data', data => {
      if (data?.type === 'received' && !ended) {
        delivered = true;
        onState({status: 'sent'});
        later(stop, 300);
      }
    });
    conn.on('error', () => { if (!ended) { onState({status: 'error'}); stop(); } });
    conn.on('close', () => { if (!ended) { if (!delivered) onState({status: 'closed'}); stop(); } });
  });
  peer.on('error', () => { if (!ended) { onState({status: 'error'}); stop(); } });
  return stop;
}

export function receivePhoto(id, token, onState, PeerClass = Peer) {
  const peer = new PeerClass(undefined, peerOptions);
  let connection, ended = false, received = false;
  const stop = () => { ended = true; clearTimeout(timer); connection?.close(); peer.destroy(); };
  const fail = () => { if (!ended && !received) { onState({status: 'error'}); stop(); } };
  const timer = setTimeout(fail, 25000);
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

