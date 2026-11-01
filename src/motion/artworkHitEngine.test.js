import test from 'node:test';
import assert from 'node:assert/strict';
import {artworkContact,createArtworkHitEngine} from './artworkHitEngine.js';
const layout={viewportWidth:1000,viewportHeight:1000,left:0,top:0,zones:{center:{x:.5,y:.5}}};
const pose=(x,y,t)=>({gripX:x-.16,gripY:y,tipX:x,tipY:y,rotation:0,width:.2,gripOffset:.2,timestamp:t,grip:{grabbed:true}});
const surface=p=>p.x>=.3&&p.x<=.7&&p.y>=.3&&p.y<=.7;
test('shaft contact anywhere on the artwork counts even with tip outside',()=>{
 assert.ok(artworkContact(pose(.8,.35,0),layout,surface));
 assert.equal(artworkContact(pose(.8,.2,0),layout,surface),null);
});
test('outer artwork hits once per stroke, rejects stale and duplicate frames',()=>{
 const engine=createArtworkHitEngine(),hits=[];
 const update=p=>engine.update(layout,{right:p},surface,h=>hits.push(h));
 update(pose(.8,.2,0));update(pose(.8,.35,100));
 assert.equal(hits.length,1);
 update(pose(.8,.35,100));update(pose(.8,.4,200));
 assert.equal(hits.length,1);
 update({...pose(.8,.45,300),stale:true});
 assert.equal(hits.length,1);
});
test('fast crossing catches thin artwork and clear empty space stays silent',()=>{
 const engine=createArtworkHitEngine(),hits=[];
 const thin=p=>p.x>.495&&p.x<.505&&p.y>.3&&p.y<.7;
 engine.update(layout,{right:pose(.2,.5,0)},thin,h=>hits.push(h));
 engine.update(layout,{right:pose(.9,.5,100)},thin,h=>hits.push(h));
 assert.equal(hits.length,1);
 engine.reset();hits.length=0;
 engine.update(layout,{right:pose(.2,.1,0)},thin,h=>hits.push(h));
 engine.update(layout,{right:pose(.9,.1,100)},thin,h=>hits.push(h));
 assert.equal(hits.length,0);
});
