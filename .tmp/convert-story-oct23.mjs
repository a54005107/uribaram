import fs from 'node:fs';
const old=fs.readFileSync('.tmp/convert-story.mjs','utf8');
let conversion=old.slice(old.indexOf('const simple='),old.indexOf('code=code.replace(/className'));
conversion=conversion.replace("const props={", "Object.assign(simple,{'right-0':'right:0','rotate-90':'rotate:90deg','mask-alpha':'mask-mode:alpha','mask-intersect':'mask-composite:intersect','mask-no-clip':'mask-clip:no-clip','mask-no-repeat':'mask-repeat:no-repeat','object-bottom':'object-position:bottom','object-cover':'object-fit:cover','bg-gradient-to-r':'background:linear-gradient(to right,var(--from) var(--from-stop,0%),var(--to) var(--to-stop,100%))','bg-gradient-to-b':'background:linear-gradient(to bottom,var(--from) var(--from-stop,0%),var(--to) var(--to-stop,100%))'});const props={right:'right',bottom:'bottom',aspect:'aspect-ratio','mask-position':'mask-position','mask-size':'mask-size',to:'--to',");
conversion=conversion.replace("if(key==='font'){rules.push('font-family:var(--uribaram-font-family)');", "if(key==='from'||key==='to'){rules.push('--'+key+(/^[\\d.]+%$/.test(v)?'-stop':'')+':'+v);continue;}if(key==='drop-shadow'){rules.push('filter:drop-shadow('+v+')');continue;}if(key==='font'){rules.push('font-family:'+(v.includes('NanumSquare')?'Story NanumSquare Neo,sans-serif':'var(--uribaram-font-family)'));");
const {convert,styles,unknown}=new Function(conversion+';return {convert,styles,unknown};')();
let code=fs.readFileSync('.tmp/design-2271-3227.txt','utf8');
const base=code.match(/const assetPathPrefix = "([^"]+)"/)[1];
const files=[...code.matchAll(/\$\{assetPathPrefix\}\/([^`]+)`/g)].map(m=>m[1]);
fs.writeFileSync('.tmp/oct23-story-assets.json',JSON.stringify({base,files}));
code=code.replace(/const assetPathPrefix = .*?;/,'const assetPathPrefix = "/assets/figma/story/oct23";').replace(/type \w+Props = \{[\s\S]*?\};\n/g,'').replace(/\}: \{ className\?: string \}/g,'}').replace(/\}: \w+Props/g,'}');
code=code.replace('export default function Component17()', 'function StoryArtwork({scrollDown,navigate})');
// Shared global menu/header are kept live outside the scaled artwork.
const stop=code.indexOf('      <Component5 className=',code.indexOf('function StoryArtwork'));
code=code.slice(0,stop)+'    </div>\n  );\n}\n';
code=code.replace(/className="([^"]*)"/g,(_,c)=>'className="'+convert(c)+'"').replace(/className=\{className \|\| "([^"]*)"\}/g,(_,c)=>'className={className || "'+convert(c)+'"}');
// Original asset size is preserved and scaled in its wrapper.
code=code.replace(/<img alt="" className="[^"]*"(?: height="[^"]*")? src=\{([^}]+)\}(?: width="[^"]*")? \/>/g,'<ArtworkImage src={$1} />');
// Interactive prototype hotspots.
code=code.replace('data-node-id="2620:4633"','role="button" tabIndex={0} aria-label="다음 이야기" onClick={scrollDown} onKeyDown={e=>{if(e.key===\'Enter\'||e.key===\' \'){e.preventDefault();scrollDown();}}} data-node-id="2620:4633"');
code=code.replace('function Component15({ className, property1 = "Default" }) {','function Component15({ className, property1 = "Default" }) {\n const [slide,setSlide]=useState(0);');
code=code.replace('data-node-id="2632:4771">','data-node-id="2632:4771">\n {slide>0 && <img className="story-flag-photo" src={\'/assets/figma/story/current/\'+[\'\',\'flag-photo-1.png\',\'flag-photo-2.png\'][slide]} alt="농기 사진"/>}');
code=code.replace('data-node-id="2632:4729"','style={{visibility:slide?\'hidden\':\'visible\',containerType:\'size\'}} data-node-id="2632:4729"').replace('data-node-id="2632:4738"','style={{visibility:slide?\'hidden\':\'visible\',containerType:\'size\'}} data-node-id="2632:4738"').replace(/(data-node-id="2632:(?:4729|4738)") style=\{\{ containerType: "size" \}\}/g,'$1');
code=code.replace('data-name="다음 농기 보기"','onClick={()=>setSlide((slide+1)%3)} aria-label="다음 농기 보기" data-name="다음 농기 보기"');
const previous=fs.readFileSync('src/pages/StoryPage.jsx','utf8');
const pre=previous.slice(0,previous.indexOf('const assetPathPrefix'));
let post=previous.slice(previous.indexOf('const storyStops='));
post=post.replace(/const storyStops=.*?;/,'const storyStops=[0,2434,3890.727,6152.895,7715,11500,13600,15807];').replaceAll('2240','2560').replaceAll('1260','1440').replaceAll('12755','15807').replaceAll('1315','2434');
post=post.replace('<StoryArtwork scrollDown=', '<StoryArtwork navigate={navigate} scrollDown=');
post=post.replace(/aria-label=\{\[.*?\]\[i\]\}/,"aria-label={['풍물놀이 소개','바람을 담은 농기','함께 하는 사람들','다양한 장소','지역마다 다양한 소리들','우리바람','마무리'][i]}");
fs.writeFileSync('src/pages/StoryPage.jsx',pre+code+post);
const cssOld=fs.readFileSync('src/pages/StoryPage.css','utf8');
let css=cssOld.slice(cssOld.indexOf('.story-page {')).replaceAll('2240','2560').replaceAll('12755','15807');
css=css.replace(/\.story-artwork \.story-current-\d+ \{[^}]*\}\n/g,'');
fs.writeFileSync('src/pages/StoryPage.css',styles.join('\n')+'\n'+css);
console.log({unknown:[...unknown],assets:files.length});
