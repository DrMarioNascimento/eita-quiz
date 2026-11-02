import test from 'node:test';
import assert from 'node:assert/strict';
import {questionPayload,createRoomWriter} from '../room-protocol.js';
const q={q:'Qual alternativa?',a:['A','B','C','D'],correct:2,explain:'Explicação reservada até a apuração.',time:25};
const roster=Array.from({length:30},(_,i)=>({uid:'uid-'+i,name:'Participante '+i+' · uid'+i}));
const squads=[{name:'tigre Teste',members:roster.map(p=>p.name),life:100}];
test('modo individual não distribui lista de nomes e dados privados da questão',()=>{
 const data=questionPayload(q,squads,'individual',roster,3,123);
 assert.deepEqual(data.groups,[]);
 assert.deepEqual(data.participants,roster.map(p=>p.uid));
 assert.deepEqual(data.question,{text:q.q,options:q.a});
 assert.equal(data.result,null);
 assert.equal(JSON.stringify(data).includes(q.explain),false);
 const previous={...data,groups:squads.map(({name,members})=>({name,members}))};
 assert.ok(Buffer.byteLength(JSON.stringify(data))<Buffer.byteLength(JSON.stringify(previous))*.6);
});
test('esquadrões mantêm a associação necessária para identificar o próprio grupo',()=>{
 for(const mode of ['shared','own'])assert.deepEqual(questionPayload(q,squads,mode,roster,1,123).groups,[{name:squads[0].name,members:squads[0].members}]);
});
test('transições aguardam a escrita anterior mesmo quando não são aguardadas pelo chamador',async()=>{
 let release;const calls=[];
 const writer=createRoomWriter(async(_room,patch)=>{calls.push(patch.status);if(patch.status==='result')await new Promise(resolve=>release=resolve);});
 const result=writer.send('room',{status:'result'});
 const question=writer.send('room',{status:'question'});
 await Promise.resolve();await Promise.resolve();
 assert.deepEqual(calls,['result']);release();await Promise.all([result,question]);
 assert.deepEqual(calls,['result','question']);
});
test('falha de rede não bloqueia uma tentativa seguinte',async()=>{
 let tries=0;const writer=createRoomWriter(async()=>{if(++tries===1)throw new Error('offline');});
 await assert.rejects(writer.send('room',{}),/offline/);
 await writer.send('room',{});assert.equal(tries,2);
});
test('sala encerrada não recebe transições que ainda estavam na fila',async()=>{
 let open=true,calls=0,release;
 const writer=createRoomWriter(async()=>{calls++;await new Promise(resolve=>release=resolve);});
 const first=writer.send('room',{});
 const stale=writer.send('room',{},()=>open);
 await Promise.resolve();await Promise.resolve();open=false;release();
 await Promise.all([first,stale]);await writer.flush();assert.equal(calls,1);
});
