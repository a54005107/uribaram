import fs from 'node:fs';const p='src/hooks/usePhotoHeadwear.js';let s=fs.readFileSync(p,'utf8');s=s.replace("import {FilesetResolver", "import {createSangmoMotion} from '../motion/sangmoMotion';\nimport {FilesetResolver");s=s.replace('seen = 0, head, phase = 0, speed = 0, previous = 0','previous = 0');s=s.replace('const hat = new Image()', 'const motion = createSangmoMotion();\n    const hat = new Image()');s=s.replace('now - lastInference >= 65','now - lastInference >= 40');s=s.replace('input.width = 480; input.height = Math.round(480 * height / width);','if (input.width !== 480 || input.height !== Math.round(480 * height / width)) { input.width = 480; input.height = Math.round(480 * height / width); }');const start=s.indexOf('              const angle =');const end=s.indexOf('\n            }',start);s=s.slice(0,start)+`              let angle = Math.atan2((b.y - a.y) * height, (a.x - b.x) * width);
              if (angle > Math.PI/2) angle -= Math.PI;
              if (angle < -Math.PI/2) angle += Math.PI;
              motion.observe({x,y,w,angle},now);`+s.slice(end);s=s.replace('        speed *= Math.exp(-dt * 2); phase += speed * dt;\n        if (head && now - seen < 400) {','        const head = motion.step(now,dt);\n        if (head && head.opacity > 0) {');s=s.replace('context.save(); context.translate(head.x, head.y - head.w * .55); context.rotate(head.angle);','context.save(); context.globalAlpha = head.opacity; context.translate(head.x, head.y - head.w * .4); context.rotate(head.angle);');const a=s.indexOf("            if (kindRef.current === 'sangmo') {");const b=s.indexOf('\n          }\n          context.restore();',a);s=s.slice(0,a)+`            const w = head.w * 1.2, h = w * image.naturalHeight / image.naturalWidth;
            context.drawImage(image, -w / 2, -h * .85, w, h);
            if (kindRef.current === 'sangmo') {
              context.save(); context.translate(0, -h * .85);
              context.beginPath(); context.moveTo(0, 0);
              for (let i=1;i<head.ribbon.length-1;i++) {
                const p=head.ribbon[i], next=head.ribbon[i+1];
                context.quadraticCurveTo(p.x*head.w,p.y*head.w,(p.x+next.x)*head.w/2,(p.y+next.y)*head.w/2);
              }
              context.strokeStyle = '#fff'; context.lineWidth = head.w * .035; context.lineCap = 'round'; context.lineJoin = 'round';
              context.shadowColor = '#0003'; context.shadowBlur = 2; context.stroke(); context.restore();
            }`+s.slice(b);fs.writeFileSync(p,s);
