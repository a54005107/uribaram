// Vercel server function: issues temporary TURN credentials, never receives photos.
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({code:'method-not-allowed'});
  if (req.headers['sec-fetch-site'] === 'cross-site') return res.status(403).json({code:'forbidden'});
  const key = process.env.CLOUDFLARE_TURN_KEY_ID;
  const token = process.env.CLOUDFLARE_TURN_API_TOKEN;
  if (!key || !token) return res.status(503).json({code:'relay-not-configured'});
  try {
    const response = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${encodeURIComponent(key)}/credentials/generate-ice-servers`, {
      method:'POST', headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},
      body:JSON.stringify({ttl:600}), signal:AbortSignal.timeout(8000),
    });
    if (!response.ok) return res.status(502).json({code:'relay-unavailable'});
    const data = await response.json();
    const iceServers = (Array.isArray(data.iceServers) ? data.iceServers : []).map(server => ({
      urls:(Array.isArray(server.urls) ? server.urls : [server.urls]).filter(url => typeof url === 'string' && /^(stun|turn|turns):/.test(url) && !/:53(?:\?|$)/.test(url)),
      ...(server.username && server.credential ? {username:server.username,credential:server.credential} : {}),
    })).filter(server => server.urls.length);
    if (!iceServers.some(server => server.credential && server.urls.some(url => /^turns?:/.test(url)))) {
      return res.status(502).json({code:'relay-unavailable'});
    }
    return res.status(200).json({iceServers});
  } catch { return res.status(502).json({code:'relay-unavailable'}); }
}
