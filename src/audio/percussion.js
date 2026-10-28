const variants = {janggu: 4, kkwaenggwari: 5};
const cache = new Map();
const last = new Map();
let context;
let output;
let preview;
let previewSerial = 0;

export function audioContext() {
  if (!context) {
    const Constructor = window.AudioContext || window.webkitAudioContext;
    context = new Constructor({latencyHint: 'interactive'});
    output = context.createDynamicsCompressor();
    output.connect(context.destination);
  }
  return context;
}
export async function unlockAudio() {
  const ctx = audioContext();
  await ctx.resume();
  return ctx.state === 'running';
}
export function sampleNames(id) {
  return variants[id] ? Array.from({length: variants[id]}, (_, i) => `${id}${i + 1}`) : [id];
}
export function chooseSample(id, random = Math.random) {
  const names = sampleNames(id);
  const available = names.filter(name => name !== last.get(id));
  const choices = available.length ? available : names;
  const name = choices[Math.min(choices.length - 1, Math.floor(random() * choices.length))];
  last.set(id, name);
  return name;
}
export function loadSample(name) {
  if (!cache.has(name)) {
    cache.set(name, fetch(`/audio/${name}.mp3`).then(response => {
      if (!response.ok) throw new Error(`Audio ${response.status}`);
      return response.arrayBuffer();
    }).then(bytes => audioContext().decodeAudioData(bytes)).catch(error => {
      cache.delete(name);
      throw error;
    }));
  }
  return cache.get(name);
}
export async function loadInstrument(id) {
  const names = sampleNames(id);
  const buffers = await Promise.all(names.map(loadSample));
  return new Map(names.map((name, index) => [name, buffers[index]]));
}
export function playSample(buffer, volume = .7, loop = false) {
  const ctx = audioContext();
  if (ctx.state !== 'running') return null;
  const source = ctx.createBufferSource();
  const gain = ctx.createGain();
  source.buffer = buffer;
  source.loop = loop;
  gain.gain.value = volume;
  source.connect(gain);
  gain.connect(output);
  source.onended = () => { source.disconnect(); gain.disconnect(); };
  source.start();
  return source;
}
export function stopPreview() {
  previewSerial++;
  preview?.stop();
  preview = null;
}
export async function previewInstrument(id) {
  stopPreview();
  const serial = previewSerial;
  try {
    // Hover alone cannot unlock audio on browsers that require a prior click.
    if (!await unlockAudio() || serial !== previewSerial) return;
    const buffer = await loadSample(chooseSample(id));
    if (serial === previewSerial) preview = playSample(buffer, .65);
  } catch { /* Selection remains available if audio cannot be loaded. */ }
}
