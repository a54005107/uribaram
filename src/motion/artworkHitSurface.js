import layers from '../config/playInstrumentLayers.json';
import jangguParts from '../config/figmaPlayJanggu.json';
import {JANGGU} from './figmaPlayLayout';

const cache = new Map();
const load = src => new Promise((resolve,reject) => {
  const image=new Image(); image.onload=()=>resolve(image); image.onerror=reject; image.src=src;
});
// A small cached alpha map of the same static layers used by the renderer.
// Transparent corners are not playable; rings, cords and handles are.
export function loadArtworkHitSurface(id) {
  if(cache.has(id))return cache.get(id);
  const pending=(async()=>{
    const isJanggu=id==='janggu', source=layers[id];
    const width=isJanggu?JANGGU.width:Math.max(...source.parts.map(p=>p.bounds.x+p.bounds.width))-source.x;
    const height=isJanggu?JANGGU.height:Math.max(...source.parts.map(p=>p.bounds.y+p.bounds.height))-source.y;
    const parts=isJanggu?jangguParts:source.parts;
    const images=await Promise.all(parts.map(p=>load(isJanggu?`/assets/figma/play-instrument/${p.file}`:p.file)));
    const canvas=document.createElement('canvas');canvas.width=512;canvas.height=Math.ceil(512*height/width);
    const ctx=canvas.getContext('2d');ctx.scale(512/width,512/width);
    parts.forEach((part,i)=>{
      if(!isJanggu){ctx.drawImage(images[i],source.viewBox[0]-source.x,source.viewBox[1]-source.y,source.viewBox[2],source.viewBox[3]);return;}
      const [top,right,bottom,left]=part.inset;
      const w=(100-left-right)*width/100,h=(100-top-bottom)*height/100,t=part.transform;
      ctx.save();ctx.translate(left*width/100+w/2,top*height/100+h/2);
      if(t)ctx.rotate(t.rotation*Math.PI/180);
      const iw=t?Math.hypot(t.w[0]*w,t.w[1]*h)/100:w,ih=t?Math.hypot(t.h[0]*w,t.h[1]*h)/100:h;
      ctx.drawImage(images[i],-iw/2,-ih/2,iw,ih);ctx.restore();
    });
    const pixels=ctx.getImageData(0,0,canvas.width,canvas.height).data;
    return (point,layout)=>{
      let x=point.x*layout.viewportWidth,y=point.y*layout.viewportHeight;
      const angle=-(isJanggu?JANGGU.rotation:layout.rotation||0)*Math.PI/180;
      if(isJanggu){x=(x-layout.left)/layout.scale-JANGGU.cx;y=(y-layout.top)/layout.scale-JANGGU.cy;}
      else {x-=layout.left+layout.width/2;y-=layout.top+layout.height/2;}
      let localX=x*Math.cos(angle)-y*Math.sin(angle),localY=x*Math.sin(angle)+y*Math.cos(angle);
      if(!isJanggu){const scale=layout.width/width;localX=(layout.mirrorX?-localX:localX)/scale;localY/=scale;}
      const px=Math.floor((localX+width/2)*512/width),py=Math.floor((localY+height/2)*512/width);
      return px>=0&&py>=0&&px<canvas.width&&py<canvas.height&&pixels[(py*canvas.width+px)*4+3]>24;
    };
  })().catch(error=>{cache.delete(id);throw error;});
  cache.set(id,pending);return pending;
}
