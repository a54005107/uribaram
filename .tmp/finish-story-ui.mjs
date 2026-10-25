import fs from 'node:fs';
let p='src/pages/StoryPage.jsx',s=fs.readFileSync(p,'utf8');
const start=s.indexOf('function Component16('),end=s.indexOf('function StoryArtwork',start);
s=s.slice(0,start)+`function Component16({className}) {
 const [slide,setSlide]=useState(0);
 const files=['f7bbf.png','f5287.png','6635d.png','181d1.png','140b8.png'];
 return <div className={className} data-node-id="2728:2349">
  {files.map((file,i)=><img key={file} className={'story-place-photo '+(i===slide?'is-active':'')} src={assetPathPrefix+'/'+file} alt={['마당밟이','판굿','진주삼천포농악 놀이','길놀이','성주굿'][i]}/>)}
  <div className="story-place-shade"/>
  <div className="story-place-dots" role="group" aria-label="장소 사진">{files.map((file,i)=><button key={file} onClick={()=>setSlide(i)} aria-label={(i+1)+'번째 사진'} aria-pressed={i===slide}>✦</button>)}</div>
  <button className="story-place-next" onClick={()=>setSlide((slide+1)%files.length)} aria-label="다음 장소 사진"><img src={img4} alt=""/></button>
 </div>;
}

`+s.slice(end);
// Bottom pennants use existing navigation; preserve their original graphic composition.
s=s.replace('function StoryArtwork({scrollDown,navigate}) {','function StoryArtwork({scrollDown,navigate}) {\n const share=async()=>{try{const url=new URL(\'/\',location.href).href;if(navigator.share)await navigator.share({title:\'우리바람\',url});else await navigator.clipboard.writeText(url);}catch{}};');
for(const [component,action,label] of [['Component1',"navigate('/')",'처음으로'],['Component3','share()','소문내기'],['Component6',"navigate('/photo')",'얼쑤 한컷']]) {
 const re=new RegExp('<'+component+' className="([^"]+)" />','g');
 s=s.replace(re,(all,cls,offset)=>offset>s.indexOf('function StoryArtwork')?'<div className="'+cls+' story-footer-action" role="button" tabIndex={0} aria-label="'+label+'" onClick={()=>'+action+'} onKeyDown={e=>{if(e.key===\'Enter\'){'+action+';}}}><'+component+' className="story-footer-art"/></div>':all);
}
fs.writeFileSync(p,s);
p='src/components/StoryHeader.jsx';s=fs.readFileSync(p,'utf8').replace("['pink', 'sky', 'yellow', 'green', 'blue', 'pink']","['pink', 'sky', 'yellow', 'pink', 'green', 'sky', 'pink']").replace('/ 2240','/ 2560');fs.writeFileSync(p,s);
