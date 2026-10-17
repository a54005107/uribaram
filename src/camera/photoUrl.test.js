import {test} from 'node:test';
import assert from 'node:assert/strict';
import {photoReceiverUrl} from './photoUrl.js';
test('local QR uses PC LAN address and keeps active port',()=>{assert.equal(photoReceiverUrl('http://localhost:5182/photo','','192.168.25.2').href,'http://192.168.25.2:5182/');});
test('production QR stays on deployed site',()=>{assert.equal(photoReceiverUrl('https://ourwind.example/photo').href,'https://ourwind.example/');});
test('explicit public receiver overrides development address',()=>{assert.equal(photoReceiverUrl('http://localhost:5182/photo','https://ourwind.example/').href,'https://ourwind.example/');});
test('never generates a loopback QR without reachable address',()=>{for(const host of ['localhost','127.0.0.1','[::1]','0.0.0.0'])assert.throws(()=>photoReceiverUrl(`http://${host}:5182/photo`));});
