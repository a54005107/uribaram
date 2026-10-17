import fs from 'node:fs';
const path='src/pages/StoryPage.css';let css=fs.readFileSync(path,'utf8');css=css.replace(/calc\(([^)]+)\)/g,(_,value)=>'calc('+value.replace(/([\d%a-z])([+-])(?=[\d.])/g,'$1 $2 ')+')');fs.writeFileSync(path,css);
