import {useEffect} from 'react';

// The original SVG stays untouched. Horizontal cloth sections carry a travelling
// wave down from the swaying triangular support; the long pole stays fixed.
const WIDTH = 615, HEIGHT = 1226, PADDING = 180;

export default function useFlagWind(pageRef, imageRef, canvasRef, rigRef) {
  useEffect(() => {
    const page = pageRef.current, image = imageRef.current, canvas = canvasRef.current, rig = rigRef.current;
    if (!page || !image || !canvas || !rig) return undefined;
    let disposed = false;
    const context = canvas.getContext('2d');
    if (!context) return undefined;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, previousPointer = null, lastTime = 0;
    let gust = 0, breeze = 0, energy = 0, amplitude = 0, phase = 0;
    let poleAngle = 0, poleVelocity = 0;
    const cloth = Array.from({length: 33}, () => ({x: 0, velocity: 0}));
    const displacement = progress => {
      const index = progress * (cloth.length - 1);
      const low = Math.floor(index), high = Math.min(low + 1, cloth.length - 1);
      return cloth[low].x + (cloth[high].x - cloth[low].x) * (index - low);
    };
    let ready = false;
    // Rasterize the SVG once; animation reuses this texture, not 200 SVG renders.
    const texture = document.createElement('canvas');
    const textureContext = texture.getContext('2d');
    if (!textureContext) return undefined;

    const draw = () => {
      if (disposed || !ready) return;
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (amplitude === 0 && breeze === 0 && cloth.every(part => part.x === 0)) {
        context.drawImage(texture, PADDING, 0, WIDTH, HEIGHT);
        return;
      }
      for (let y = 0; y < HEIGHT; y += 6) {
        const length = Math.min(6, HEIGHT - y);
        const progress = Math.max(0, (y / HEIGHT - .08) / .92);
        const envelope = progress ** 1.4;
        const offset = displacement(progress);
        const fold = Math.sin(phase * 1.3 - progress * 7 + Math.sin(phase * .47) * .8);
        const squeeze = 1 - envelope * (Math.min(.12, Math.abs(offset) / 1100) + amplitude * .08 * (1 + fold));
        const width = WIDTH * squeeze;
        const lift = Math.abs(offset) * .2 * progress;
        const nextProgress = Math.max(0, ((y + length) / HEIGHT - .08) / .92);
        const nextLift = Math.abs(displacement(Math.min(1, nextProgress))) * .2 * nextProgress;
        // Tiny overlap avoids seams between subpixel strips at scaled viewports.
        const stripHeight = Math.min(length + .5, HEIGHT - y);
        const x = PADDING + offset + (WIDTH - width) * .35;
        const destinationHeight = Math.max(.5, length + lift - nextLift + .6);
        context.drawImage(texture, 0, y * 2, WIDTH * 2, stripHeight * 2,
          x, y - lift, width, destinationHeight);
        // Shade only existing cloth pixels, preserving the SVG's transparent edges.
        context.globalCompositeOperation = 'source-atop';
        context.fillStyle = fold > 0 ? `rgba(255,255,255,${fold * amplitude * envelope * .12})`
          : `rgba(30,24,60,${-fold * amplitude * envelope * .18})`;
        context.fillRect(x, y - lift, width, destinationHeight);
        context.globalCompositeOperation = 'source-over';
      }
    };
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0; previousPointer = null;
      gust = breeze = energy = amplitude = phase = 0;
      poleAngle = poleVelocity = 0;
      rig.style.transform = '';
      cloth.forEach(part => { part.x = part.velocity = 0; });
      draw();
    };
    const animate = time => {
      if (disposed) return;
      const dt = Math.min((time - lastTime) / 1000, .05);
      lastTime = time;
      gust *= Math.exp(-1.7 * dt);
      energy *= Math.exp(-1.05 * dt);
      breeze += (gust - breeze) * (1 - Math.exp(-4 * dt));
      amplitude += (energy - amplitude) * (1 - Math.exp(-9 * dt));
      phase += dt * (3.5 + amplitude * 5);
      // Damped cloth sections carry momentum. The free end follows later,
      // especially when the mouse reverses direction, rather than waving in sync.
      const steps = Math.max(1, Math.ceil(dt / .008)), step = dt / steps;
      for (let n = 0; n < steps; n++) {
        // The triangular support swings gently around its apex. Only this
        // support and its attached cloth move; the long pole stays stationary.
        const pressure = breeze * (1 + amplitude * .12 * Math.sin(phase * .63));
        const poleTarget = -pressure * 1.2;
        const poleAcceleration = (poleTarget - poleAngle) * 22 - poleVelocity * 5.8;
        poleVelocity += poleAcceleration * step;
        poleAngle += poleVelocity * step;
        for (let i = cloth.length - 1; i > 0; i--) {
          const part = cloth[i], progress = i / (cloth.length - 1);
          const billow = pressure * 135 * progress ** 1.3;
          const flutter = amplitude * progress ** 1.8 * (Math.sin(phase * 1.7 - progress * 9) * 15
            + Math.sin(phase * 2.93 - progress * 13) * 6) * (.8 + .2 * Math.sin(phase * .41));
          // When the support changes direction, the loose cloth briefly trails it.
          const inertia = poleAcceleration * progress ** 1.5 * .9;
          const target = .58 * cloth[i - 1].x + .42 * (billow + flutter + inertia);
          part.velocity += ((target - part.x) * 160 - part.velocity * (12 - progress * 5)) * step;
          part.x = Math.max(-155, Math.min(155, part.x + part.velocity * step));
        }
      }
      rig.style.transform = `rotate(${poleAngle}deg)`;
      draw();
      if (energy + amplitude + Math.abs(breeze) + Math.abs(gust) < .006
        && Math.abs(poleAngle) < .002 && Math.abs(poleVelocity) < .005
        && cloth.every(part => Math.abs(part.x) < .2 && Math.abs(part.velocity) < .5)) {
        reset();
        return;
      }
      frame = requestAnimationFrame(animate);
    };
    const move = event => {
      if (disposed || !ready || reducedMotion.matches || event.pointerType === 'touch') return;
      const now = performance.now();
      if (previousPointer && now - previousPointer.time < 180) {
        const dx = event.clientX - previousPointer.x;
        const speed = dx / Math.max(8, now - previousPointer.time);
        const impulse = Math.max(-1, Math.min(1, speed / 1.5));
        gust = Math.max(-1, Math.min(1, gust + impulse * .35));
        // Distance-based energy makes the response independent of mouse polling rate.
        energy = Math.min(1, energy + Math.abs(dx) / 180);
        if (!frame && Math.abs(dx) > .2) {
          lastTime = now;
          frame = requestAnimationFrame(animate);
        }
      }
      previousPointer = {x: event.clientX, time: now};
    };
    const load = () => {
      if (disposed || !image.naturalWidth) return;
      texture.width = WIDTH * 2; texture.height = HEIGHT * 2;
      textureContext.drawImage(image, 0, 0, texture.width, texture.height);
      canvas.width = (WIDTH + PADDING * 2) * 2; canvas.height = HEIGHT * 2;
      context.setTransform(2, 0, 0, 2, 0, 0);
      ready = true;
      draw();
      canvas.style.visibility = 'visible';
      image.style.visibility = 'hidden';
    };
    const leave = () => { previousPointer = null; };
    const visibility = () => { if (document.hidden) reset(); };
    image.addEventListener('load', load);
    if (image.complete) load();
    page.addEventListener('pointermove', move, {passive: true});
    page.addEventListener('pointerleave', leave);
    reducedMotion.addEventListener('change', reset);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      // React clears refs before passive-effect cleanup on a route change.
      // Use the captured elements and stop pending callbacks before disposal.
      disposed = true;
      reset();
      image.removeEventListener('load', load);
      page.removeEventListener('pointermove', move);
      page.removeEventListener('pointerleave', leave);
      reducedMotion.removeEventListener('change', reset);
      document.removeEventListener('visibilitychange', visibility);
      image.style.visibility = '';
      canvas.style.visibility = '';
    };
  }, [pageRef, imageRef, canvasRef, rigRef]);
}
