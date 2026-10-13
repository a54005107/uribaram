import React, {useLayoutEffect, useRef, useState} from 'react';
import {Routes, useLocation, useNavigationType} from 'react-router-dom';
import {pageDirection} from '../utils/pageDirection';
import './PageTransitions.css';

const loadingPaths = new Set(['/loading', '/play-loading']);

// Only the incoming route is live. A frozen copy of the outgoing page avoids
// mounting two camera/tracking sessions during the transition.
function snapshot(element) {
  const copy = element.cloneNode(true);
  const canvases = copy.querySelectorAll('canvas');
  element.querySelectorAll('canvas').forEach((canvas, index) => {
    if (canvas.width && canvas.height) {
      try { canvases[index].getContext('2d')?.drawImage(canvas, 0, 0); } catch { /* An unavailable frame stays blank. */ }
    }
  });
  const inputs = copy.querySelectorAll('input, textarea, select');
  element.querySelectorAll('input, textarea, select').forEach((input, index) => {
    inputs[index].value = input.value;
    if ('checked' in input) inputs[index].checked = input.checked;
  });
  const videos = copy.querySelectorAll('video');
  element.querySelectorAll('video').forEach((video, index) => {
    const still = document.createElement('canvas');
    still.className = video.className; still.style.cssText = video.style.cssText;
    still.width = video.videoWidth; still.height = video.videoHeight;
    if (video.readyState >= 2) {
      try { still.getContext('2d')?.drawImage(video, 0, 0); } catch { /* Camera may already be closing. */ }
    }
    videos[index].replaceWith(still);
  });
  copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
  return copy;
}

export default function PageTransitions({children}) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const historyIndex = useRef(window.history.state?.idx);
  const direction = useRef(1);
  const [displayed, setDisplayed] = useState(location);
  const [moving, setMoving] = useState(false);
  const currentRef = useRef(null), outgoingRef = useRef(null);
  const shouldAnimate = useRef(false);
  const transitionStyle = useRef('slide');

  useLayoutEffect(() => {
    if (location === displayed) return;
    const nextIndex = window.history.state?.idx;
    direction.current = pageDirection(displayed.pathname, location.pathname, navigationType, historyIndex.current, nextIndex);
    historyIndex.current = nextIndex;
    const outgoing = outgoingRef.current;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealInstruments = displayed.pathname === '/loading' && location.pathname === '/instruments';
    const switchingInstrument = displayed.pathname === '/experience' && location.pathname === '/experience';
    transitionStyle.current = revealInstruments ? 'blur' : 'slide';
    shouldAnimate.current = !switchingInstrument && !reduced && !document.hidden
      && (revealInstruments || (!loadingPaths.has(location.pathname) && !loadingPaths.has(displayed.pathname)))
      && typeof currentRef.current.animate === 'function';
    outgoing.replaceChildren();
    if (shouldAnimate.current) outgoing.append(snapshot(currentRef.current));
    setMoving(shouldAnimate.current);
    setDisplayed(location);
  }, [location, displayed, navigationType]);

  useLayoutEffect(() => {
    if (!shouldAnimate.current) return undefined;
    const current = currentRef.current, outgoing = outgoingRef.current;
    const blur = transitionStyle.current === 'blur';
    const options = {duration: blur ? 1400 : 780, easing: 'cubic-bezier(.45, 0, .2, 1)', fill: 'both'};
    // The selection page is already beneath the loading snapshot. Only the
    // Text softens first; the background then fades to reveal the next page.
    const animations = blur
      ? [outgoing.animate([
        {opacity: 1},
        {opacity: 1, offset: .35},
        {opacity: .65, offset: .65},
        {opacity: 0},
      ], options)]
      : [
        current.animate([{transform: `translateY(${direction.current * 100}%)`}, {transform: 'translateY(0)'}], options),
        outgoing.animate([{transform: 'translateY(0)'}, {transform: `translateY(${-direction.current * 100}%)`}], options),
      ];
    if (blur) {
      const message = outgoing.querySelector('.loading-message');
      if (message) animations.push(message.animate([
        {filter: 'blur(0px)', opacity: 1},
        {filter: 'blur(4px)', opacity: 1, offset: .3},
        {filter: 'blur(12px)', opacity: .8, offset: .65},
        {filter: 'blur(24px)', opacity: 0},
      ], {...options, easing: 'linear'}));
    }
    let cancelled = false;
    Promise.all(animations.map(animation => animation.finished)).then(() => {
      if (cancelled) return;
      outgoing.replaceChildren();
      animations.forEach(animation => animation.cancel());
      setMoving(false);
    }).catch(() => {});
    return () => { cancelled = true; animations.forEach(animation => animation.cancel()); };
  }, [displayed]);

  return <div className="route-viewport" aria-busy={moving || undefined}>
    <div ref={currentRef} className="route-current" inert={moving || undefined}>
      <Routes location={displayed}>{children}</Routes>
    </div>
    <div ref={outgoingRef} className="route-outgoing" inert aria-hidden="true"/>
  </div>;
}
