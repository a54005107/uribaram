export async function attachVideo(video, stream, isCurrent, wait = ms => new Promise(resolve => setTimeout(resolve, ms))) {
  if (!video || !stream) return false;
  video.muted = true;
  video.autoplay = true;
  video.playsInline = true;
  if (video.srcObject !== stream) video.srcObject = stream;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (!isCurrent() || !video.isConnected) return false;
    try { await video.play(); return isCurrent() && video.isConnected; }
    catch (error) {
      if (!isCurrent() || !video.isConnected) return false;
      // A source transition can interrupt Safari's pending play promise even
      // though capture permission and the live track remain valid.
      if (error.name !== 'AbortError' || attempt === 2) throw error;
      await wait(150);
    }
  }
}
