import test from 'node:test';
import assert from 'node:assert/strict';
import {installLayoutCompatibility} from './layoutCompatibility.js';

test('uses untransformed fractional container sizes, updates fitting, and releases detached artwork', () => {
  const keys = ['window','document','ResizeObserver','MutationObserver'];
  const original = keys.map(k => [k, Object.getOwnPropertyDescriptor(globalThis, k)]);
  const style = () => {
    const values = new Map();
    return {getPropertyValue: k => values.get(k) || '', setProperty: (k,v) => values.set(k,v)};
  };
  const html = {clientWidth:1280,style:style()};
  const artwork = {style:style()};
  const observed = new Set(), listeners = new Map();
  let resize, mutate, nodes=[artwork], disconnected=false;
  globalThis.document={documentElement:html};
  globalThis.window={innerHeight:720,addEventListener:(k,v)=>listeners.set(k,v),removeEventListener:k=>listeners.delete(k)};
  globalThis.ResizeObserver=class {constructor(fn){resize=fn;}observe(e){observed.add(e);}unobserve(e){observed.delete(e);}disconnect(){observed.clear();}};
  globalThis.MutationObserver=class {constructor(fn){mutate=fn;}observe(){}disconnect(){disconnected=true;}};
  try {
    const dispose=installLayoutCompatibility({contains:e=>nodes.includes(e),querySelectorAll:()=>nodes});
    assert.equal(html.style.getPropertyValue('--design-fit'),'0.5');
    assert.equal(html.style.getPropertyValue('--design-frame-width'),'1280px');
    assert.equal(html.style.getPropertyValue('--design-frame-height'),'720px');
    resize([{target:artwork,contentRect:{width:83.5268,height:109.4456}}]);
    assert.equal(artwork.style.getPropertyValue('--art-cqw'),`${83.5268/100}px`);
    assert.equal(artwork.style.getPropertyValue('--art-cqh'),`${109.4456/100}px`);
    html.clientWidth=1685;window.innerHeight=885;listeners.get('resize')();
    assert.equal(Number(html.style.getPropertyValue('--design-fit')),885/1440);
    assert.equal(html.style.getPropertyValue('--design-frame-height'),'885px');
    nodes=[];mutate();assert.equal(observed.size,0);
    nodes=[artwork];mutate();assert.ok(observed.has(artwork));
    dispose();assert.equal(observed.size,0);assert.equal(listeners.size,0);assert.ok(disconnected);
  } finally {
    for(const [k,descriptor] of original){if(descriptor)Object.defineProperty(globalThis,k,descriptor);else delete globalThis[k];}
  }
});
