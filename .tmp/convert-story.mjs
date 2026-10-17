import fs from 'node:fs';
let code=fs.readFileSync('.tmp/story-new-source.txt','utf8');
const files=[...code.matchAll(/\$\{assetPathPrefix\}\/([^`]+)`/g)].map(m=>m[1]);
fs.writeFileSync('.tmp/story-new-assets.json',JSON.stringify(files));
code=code.replace(/const assetPathPrefix = .*?;/,'const assetPathPrefix = "/assets/figma/story/current";');
code=code.replace(/type \w+Props = \{[\s\S]*?\};\n/g,'').replace(/\}: \{ className\?: string \}/g,'}').replace(/\}: \w+Props/g,'}');
code=code.replace('export default function Component5()', 'function StoryArtwork()');
const simple={absolute:'position:absolute',relative:'position:relative',contents:'display:contents',block:'display:block',flex:'display:flex','flex-none':'flex:none','items-center':'align-items:center','justify-center':'justify-content:center','size-full':'width:100%;height:100%','max-w-none':'max-width:none','inset-0':'inset:0','left-0':'left:0','top-0':'top:0','bottom-0':'bottom:0','left-1/2':'left:50%','-translate-x-1/2':'translate:-50% 0','-scale-x-100':'scale:-1 1','rotate-180':'rotate:180deg','-rotate-90':'rotate:-90deg','text-center':'text-align:center','not-italic':'font-style:normal','whitespace-nowrap':'white-space:nowrap','whitespace-pre':'white-space:pre','mb-0':'margin-bottom:0','bg-white':'background:white','overflow-clip':'overflow:clip','pointer-events-none':'pointer-events:none','pointer-events-auto':'pointer-events:auto',sticky:'position:sticky','cursor-pointer':'cursor:pointer','bg-gradient-to-b':'background:linear-gradient(to bottom,var(--from),var(--to))','to-white':'--to:white'};
const props={h:'height',w:'width',size:'width',left:'left',top:'top',inset:'inset',leading:'line-height',tracking:'letter-spacing',rotate:'rotate',rounded:'border-radius','rounded-bl':'border-bottom-left-radius','rounded-br':'border-bottom-right-radius','rounded-tl':'border-top-left-radius','rounded-tr':'border-top-right-radius',bg:'background',from:'--from'};
let styles=[],unknown=new Set(),classes=new Map();
function convert(value){if(classes.has(value))return classes.get(value);let rules=[];
for(const token of value.split(/\s+(?![^\[]*\])/)){
if(simple[token]){rules.push(simple[token]);continue;}
if(token==='[word-break:break-word]'){rules.push('overflow-wrap:break-word');continue;}
let m=token.match(/^(.+?)-\[(.*)\]$/);if(m){let [,key,v]=m;v=v.replaceAll('_',' ');if(key==='font'){rules.push('font-family:var(--uribaram-font-family)');rules.push('font-weight:'+(v.includes('Heavy')||v.includes('ExtraBold')?900:v.includes('Bold')?700:400));continue;}if(key==='text'){rules.push((/^(color:|#|var)/.test(v)?'color:':'font-size:')+v.replace(/^color:/,''));continue;}if(props[key]){rules.push(props[key]+':'+v);if(key==='size')rules.push('height:'+v);continue;}}
unknown.add(token);}
const name='story-current-'+classes.size;classes.set(value,name);styles.push('.story-artwork .'+name+'{'+rules.join(';')+'}');return name;}
code=code.replace(/className="([^"]*)"/g,(_,c)=>'className="'+convert(c)+'"').replace(/className=\{className \|\| "([^"]*)"\}/g,(_,c)=>'className={className || "'+convert(c)+'"}');
// Preserve each original SVG's intrinsic dimensions; fit via transform in its design slot.
code=code.replace(/<img alt="" className="[^"]*" src=\{([^}]+)\} \/>/g,'<ArtworkImage src={$1} />');
// The scroll-aware header replaces the static Figma instance.
code=code.replace(/      <Component className="[^"]*" \/>/,'');
// Sticky brand is rendered outside the scaled artwork.
const stickyStart=code.indexOf('      <div className=',code.indexOf('<Component1 className='));
if(stickyStart!==-1) code=code.slice(0,stickyStart)+'    </div>\n  );\n}\n';
const pre=`import React, {useEffect, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import StoryHeader from '../components/StoryHeader';
import './StoryPage.css';
function ArtworkImage({src}) {
 const ref=useRef(null);
 useEffect(()=>{const img=ref.current, parent=img.parentElement;const fit=()=>{if(img.naturalWidth)img.style.transform=\`scale(\${parent.clientWidth/img.naturalWidth},\${parent.clientHeight/img.naturalHeight})\`;}; img.addEventListener('load',fit); const observer=new ResizeObserver(fit);observer.observe(parent);fit();return()=>{observer.disconnect();img.removeEventListener('load',fit);};},[src]);
 return <img ref={ref} className="story-art-image" src={src} alt="" draggable="false"/>;
}
`;
const post=`
const storyStops=[0,1315,2771.73,4534.79,5850,10500,12755];
export default function StoryPage(){
 const ref=useRef(null),navigate=useNavigate();
 const [width,setWidth]=useState(window.innerWidth);
 useEffect(()=>{const observer=new ResizeObserver(([e])=>setWidth(e.contentRect.width));observer.observe(ref.current);return()=>observer.disconnect();},[]);
 const scale=width/2240;
 return <main ref={ref} className="story-page" aria-label="풍물 이야기" tabIndex={0}>
  <StoryHeader scrollRef={ref}/>
  <div className="story-brand-anchor"><button className="story-brand" onClick={()=>navigate('/')} aria-label="우리바람 처음으로"><img src="/assets/figma/story/current/84e0b.svg" alt="우리바람"/></button></div>
  <div className="story-document" style={{height:12755*scale}}>
   <div className="story-artwork" style={{transform:\`scale(\${scale})\`}}><StoryArtwork/></div>
   {storyStops.slice(0,-1).map((top,i)=><section key={top} className="story-section" aria-label={['풍물놀이 소개','바람을 적었던 깃발','함께 하는 사람들','놀이 장소','지역마다 다양한 소리들','마무리'][i]} style={{top:top*scale,height:(storyStops[i+1]-top)*scale}}/>)}
  </div>
 </main>;
`;
fs.writeFileSync('src/pages/StoryPage.jsx',pre+code+post);
fs.writeFileSync('src/pages/StoryPage.css',styles.join('\n')+'\n');
console.log({unknown:[...unknown],classes:classes.size,assets:files.length});
