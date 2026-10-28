`vision_bundle.js` is the unmodified classic browser bundle from the installed
`@mediapipe/tasks-vision` 1.0.1 package (Apache-2.0). It is served directly because
the WASM loader uses `importScripts` in the classic hand-tracking worker.
Keep this bundle, the WASM files, and the npm dependency version in sync when updating.
Camera frames stay on the device. Only one transferred ImageBitmap is processed
at a time and it is closed after inference; stopping the hook terminates the worker.
