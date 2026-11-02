const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){let now=0;const context={window:{},document:{readyState:'loading',getElementById:()=>null},addEventListener(){},performance:{now:()=>now},TextEncoder,Blob,URL,setTimeout};vm.runInNewContext(fs.readFileSync('connection-metrics.js','utf8'),context);return {api:context.window.EitaConnectionMetrics,advance(ms){now+=ms;}};}
test('diagnóstico mede confirmação e tamanho sem reter o conteúdo enviado',async()=>{
 const {api,advance}=setup();await api.measure('estado',{question:'CONTEUDO RESERVADO'},async()=>advance(180));const data=api.summary();assert.equal(data.confirmed,1);assert.equal(data.meanMs,180);assert.ok(data.estimatedJsonBytes>0);assert.equal(JSON.stringify(data).includes('RESERVADO'),false);
});
test('falhas são contadas e continuam sendo propagadas para a interface',async()=>{
 const {api}=setup();await assert.rejects(api.measure('estado',{},async()=>{throw new Error('offline');}));assert.equal(api.summary().failed,1);api.reset();assert.equal(api.summary().operations,0);
});
