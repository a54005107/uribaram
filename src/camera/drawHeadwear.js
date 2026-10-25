import artwork from '../config/headwearArtwork.json';

// Designer's 10/23 reference: face ellipse 458.522 × 530.264.
const face = {x:14067.3177,y:15221.0928,width:458.5221,height:530.2637};
export function loadHeadwearArtwork() {
  return artwork.map(part => {const image = new Image();image.src=`/assets/figma/oct23/${part.id.replace(':','-')}.svg`;return {...part,image};});
}
export function drawHeadwear(ctx, video, head, kind, parts, width, height) {
  const scale = head.w / face.width;
  const local = () => {ctx.translate(head.x,head.y);ctx.rotate(head.angle);ctx.scale(scale,scale);};
  const draw = part => {if(!part.image.complete || !part.image.naturalWidth)return;const b=part.bounds;ctx.drawImage(part.image,b.x-face.x,b.y-face.y,b.width,b.height);};
  ctx.save();ctx.globalAlpha=head.opacity;local();
  if(kind==='gokkal') {
    const part=parts.find(p=>p.id==='2819:2776');
    if(part.image.complete && part.image.naturalWidth)ctx.drawImage(part.image,-432.5,-794.8,865,771);
    ctx.restore();return;
  }
  parts.filter(p=>!['2819:2737','2819:2776'].includes(p.id)).forEach(draw);
  // Ribbon originates at the red dot on the yellow stalk, not at the flower.
  ctx.translate(14492.7856-face.x,14786.0039-face.y);
  ctx.beginPath();ctx.moveTo(0,0);
  for(let i=1;i<head.ribbon.length-1;i++){const p=head.ribbon[i],next=head.ribbon[i+1];ctx.quadraticCurveTo(p.x*face.width,p.y*face.width,(p.x+next.x)*face.width/2,(p.y+next.y)*face.width/2);}
  const tip=head.ribbon.at(-1);if(tip)ctx.lineTo(tip.x*face.width,tip.y*face.width);
  ctx.strokeStyle='#fff';ctx.lineWidth=face.width*.035;ctx.lineCap='round';ctx.lineJoin='round';ctx.shadowColor='#0003';ctx.shadowBlur=2;ctx.stroke();ctx.restore();
  // Restore the live face above rear rings; the white flower is drawn last.
  ctx.save();local();ctx.beginPath();ctx.ellipse(0,0,face.width/2,face.height/2,0,0,Math.PI*2);ctx.clip();
  ctx.setTransform(-1,0,0,1,width,0);ctx.drawImage(video,0,0,width,height);ctx.restore();
  ctx.save();ctx.globalAlpha=head.opacity;local();draw(parts.find(p=>p.id==='2819:2737'));ctx.restore();
}
