import test from 'node:test';
import assert from 'node:assert/strict';
import handler from './photo-ice.js';

test('Metered configuration serves relay credentials and fails closed when incomplete', async () => {
  const names=['METERED_TURN_USERNAME','METERED_TURN_PASSWORD'];
  const saved=names.map(name=>process.env[name]);
  const request=async(method='POST',site='same-origin')=>{
    const result={headers:{}};
    const res={setHeader:(k,v)=>{result.headers[k]=v;},status:s=>{result.status=s;return res;},json:b=>{result.body=b;}};
    await handler({method,headers:{'sec-fetch-site':site}},res);
    return result;
  };
  try {
    process.env.METERED_TURN_USERNAME='test-user';
    process.env.METERED_TURN_PASSWORD='test-password';
    const result=await request();
    assert.equal(result.status,200);
    assert.equal(result.headers['Cache-Control'],'no-store');
    assert.equal(result.body.iceServers[1].credential,'test-password');
    assert.ok(result.body.iceServers[1].urls.includes('turns:global.relay.metered.ca:443?transport=tcp'));
    assert.equal((await request('GET')).status,405);
    assert.equal((await request('POST','cross-site')).status,403);
    delete process.env.METERED_TURN_PASSWORD;
    assert.equal((await request()).status,503);
  } finally {
    names.forEach((name,i)=>{if(saved[i]===undefined)delete process.env[name];else process.env[name]=saved[i];});
  }
});
