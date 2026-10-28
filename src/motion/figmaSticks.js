// Unmodified Figma SVG layers; anchors use each original SVG's viewBox.
const asset = (instrument, files, rear, tip) => ({
  urls: files.map(file => `/assets/figma/instruments/${instrument}/screen/parts/${file}.svg`), rear, tip,
});
const blue = asset('janggu', ['stick-043-blue'], [464.07, 840.73], [135.86, 500.76]);
const cyan = asset('janggu', ['stick-044-cyan'], [1250.1, 999.39], [1250.19, 526.84]);
const jing = asset('jing', ['detail-012-red', 'detail-013-yellow', 'detail-014-2c2c2e'], [328.3, 637.75], [265.53, 263.04]);
const kkwaenggwari = asset('kkwaenggwari', ['detail-011-yellow', 'detail-012-2c2c2e', 'detail-013-yellow'], [802.67, 847.16], [897.77, 367.83]);
const sogo = asset('sogo', ['detail-015-cyan'], [772.17, 728.52], [756.74, 389.09]);
const buk = asset('buk', ['detail-025-pink'], [901.07, 78.69], [681.56, 412.03]);
export const figmaSticks = {
  janggu: {left: cyan, right: blue},
  jing: {left: jing, right: jing}, kkwaenggwari: {left: kkwaenggwari, right: kkwaenggwari},
  sogo: {left: sogo, right: sogo}, buk: {left: buk, right: buk},
};

// Rasterize the static SVG layers once per loaded image set, not every frame.
// Weak keys release the surface when the stage/instrument is unmounted.
const surfaces = new WeakMap();
export function drawFigmaStick(context, artwork, images, stick, width, height) {
  if (!images.every(image => image.complete && image.naturalWidth)) return;
  let surface = surfaces.get(images);
  if (!surface) {
    surface = document.createElement('canvas');
    surface.width = Math.max(...images.map(image => image.naturalWidth));
    surface.height = Math.max(...images.map(image => image.naturalHeight));
    const raster = surface.getContext('2d');
    images.forEach(image => raster.drawImage(image, 0, 0));
    surfaces.set(images, surface);
  }
  const [rx, ry] = artwork.rear, [tx, ty] = artwork.tip;
  const length = Math.hypot(tx - rx, ty - ry);
  const gripX = rx + (tx - rx) * stick.gripOffset;
  const gripY = ry + (ty - ry) * stick.gripOffset;
  context.save();
  context.translate(stick.gripX * width, stick.gripY * height);
  context.rotate(stick.rotation - Math.atan2(ty - ry, tx - rx));
  const scale = stick.width * width / length;
  context.scale(scale, scale);
  context.translate(-gripX, -gripY);
  context.drawImage(surface, 0, 0);
  context.restore();
}
