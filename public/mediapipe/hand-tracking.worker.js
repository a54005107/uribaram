// Classic worker: the installed MediaPipe WASM loader uses importScripts.
let landmarker;
self.onmessage = async ({data}) => {
  const {id, type} = data;
  try {
    if (type === 'init') {
      importScripts(data.bundleUrl);
      const vision = await Vision.FilesetResolver.forVisionTasks(data.wasmUrl);
      const options = {canvas: new OffscreenCanvas(1, 1),
        baseOptions: {modelAssetPath: data.modelUrl, delegate: 'GPU'},
        runningMode: 'VIDEO', numHands: 2, minHandDetectionConfidence: .4,
        minHandPresenceConfidence: .4, minTrackingConfidence: .4};
      try { landmarker = await Vision.HandLandmarker.createFromOptions(vision, options); }
      catch { landmarker = await Vision.HandLandmarker.createFromOptions(vision,
        {...options, canvas: new OffscreenCanvas(1, 1), baseOptions: {...options.baseOptions, delegate: 'CPU'}}); }
      self.postMessage({id, ready: true});
    } else if (type === 'frame') {
      const start = performance.now();
      try {
        const result = landmarker.detectForVideo(data.bitmap, data.timestamp);
        self.postMessage({id, result, inferenceMs: performance.now() - start});
      } finally { data.bitmap.close(); }
    }
  } catch (error) { self.postMessage({id, error: error?.message || String(error)}); }
};
