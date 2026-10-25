import fs from 'node:fs';
const path='src/hooks/usePhotoHeadwear.js';let s=fs.readFileSync(path,'utf8');
s=s.replace("import {FilesetResolver", "import {drawHeadwear, loadHeadwearArtwork} from '../camera/drawHeadwear';\nimport {FilesetResolver");
s=s.replace(/    const hat = new Image\(\), sangmo = new Image\(\);[\s\S]*?sangmo.src = [^;]+;/,'    const headwearArtwork = loadHeadwearArtwork();');
const start=s.indexOf('          context.save(); context.globalAlpha = head.opacity;');const end=s.indexOf('\n        }',start);
s=s.slice(0,start)+'          drawHeadwear(context, video, head, kindRef.current, headwearArtwork, width, height);'+s.slice(end);
fs.writeFileSync(path,s);
