# Camera instrument play

`/experience?instrument=janggu` supports `janggu`, `jing`, `kkwaenggwari`, `sogo`, and `buk`.
The selected instrument survives the loading screen and refresh through the URL and session storage.
After loading, `/camera?instrument=...` shows a live preview and camera selector. The play screen also links back to it.

## Interaction

- The page requests the selected camera (video only), or the default/front camera on first use, then loads the local MediaPipe hand model.
- Click **소리 켜기** once to unlock browser audio. Motion itself cannot unlock Web Audio.
- Close either hand to hold a virtual stick; open it to release. Janggu supports both hands; all other instruments retain just the first acquired hand until release or tracking loss, then allow transfer to the other hand. Only the displayed stick participates in hit detection.
- The play screen hides camera video while keeping inference active. Its gradient and decorations use Figma play frame `2305:824`; camera setup still shows a live preview.
- Beaters render the original Figma SVG layers via `figmaSticks.js`, mapping their shaft and tip to the same coordinates used by hit detection.
- Janggu has two surfaces with different synthesized pitches. The other instruments each have one surface.
- A held/stationary tip does not repeat hits. Missing/stale hands, hidden pages, and stopped camera video cannot trigger hits.
- Leaving the page stops camera tracks, model inference, animation frames, and audio. Permission/model errors offer retry on the same screen.

## Geometry and assets

`scripts/export-play-instruments.py` derives body-only SVGs from existing local Figma parts, removes decorative static beaters, and writes `src/config/playInstrumentGeometry.json`.
The displayed image rectangle and collision ellipses are calculated together by `createInstrumentLayout`; mirrored hand projection uses the same cover-cropped video rectangle.
The artwork remains fixed in the play area; the virtual beaters follow the hands. This is hand tracking, not tracking of a physical stick.
Audio uses synthesized percussion, not recorded instrument samples.

## Verification

```sh
node --test --test-isolation=none src/motion/instrumentLayout.test.js src/motion/stickInteraction.test.js
node --test --test-isolation=none src/motion/stickSelection.test.js
npm run build
```

Covered: five instruments at desktop/portrait sizes, surface entry, repeated-hit suppression, lost tracking, grip hysteresis, mirrored projection, and fast swept hits.
The earlier play implementation was browser checked with Chromium's fake camera: local hand-model initialization for all five instruments, audio gesture activation, camera/audio cleanup, portrait layout, and permission refusal. The added camera selector passes the production build; switching between physical webcams still needs an in-person check.
Real-camera hand placement and feel still need an in-person check.
