export async function loadPhotoRelay(signal, request = fetch) {
  const response = await request('/api/photo-ice', {method:'POST',cache:'no-store',signal});
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !Array.isArray(data.iceServers)) {
    const type = response.status === 404 || data.code === 'relay-not-configured' ? 'relay-not-configured' : 'relay-unavailable';
    throw Object.assign(new Error(type), {type});
  }
  if (!data.iceServers.some(server => server.credential && [server.urls].flat().some(url => /^turns?:/.test(url)))) {
    throw Object.assign(new Error('Invalid relay response'), {type:'relay-unavailable'});
  }
  return {secure:true,config:{iceServers:data.iceServers,iceTransportPolicy:'relay'}};
}

// Keep React's synchronous cleanup contract while credentials load asynchronously.
export function startPhotoRelay(start, onError, loader = loadPhotoRelay) {
  const controller = new AbortController();
  let disposed = false, cleanup;
  const timeout = setTimeout(() => controller.abort(), 10000);
  loader(controller.signal).then(options => {
    if (!disposed) cleanup = start(options);
  }).catch(error => {
    if (!disposed) onError(error.type ? error : {type:'relay-unavailable'});
  }).finally(() => clearTimeout(timeout));
  return () => { disposed = true; clearTimeout(timeout); controller.abort(); cleanup?.(); };
}
