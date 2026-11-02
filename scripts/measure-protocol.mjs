// Mede JSON representativo e executa clientes isolados. Não usa nem mede a rede do Firestore.
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {questionPayload} from '../room-protocol.js';
const require=createRequire(import.meta.url),{runClassroom}=require('../tests/helpers/classroom.cjs');
const context={window:{}};vm.runInNewContext(fs.readFileSync('cardio-bank.js','utf8'),context);
const question=context.window.CARDIO_BANK.find(item=>item.id==='cardio-043');
const rows=[];
for(const size of [12,30,60]){
 const roster=Array.from({length:size},(_,i)=>({uid:'u'+String(i).padStart(27,'0'),name:'Participante '+String(i+1).padStart(2,'0')+' · u000'}));
 const squads=[{name:'tigre Esquadrão Tigre',members:roster.map(person=>person.name)}];
 const current=questionPayload(question,squads,'individual',roster,1,1793580000000);
 const previous={...current,groups:squads.map(({name,members})=>({name,members}))};delete previous.result;
 const before=Buffer.byteLength(JSON.stringify(previous)),after=Buffer.byteLength(JSON.stringify(current));
 rows.push({participants:size,beforeJsonBytes:before,afterJsonBytes:after,reductionPercent:Number((100*(1-after/before)).toFixed(1)),estimatedFanoutBefore:before*size,estimatedFanoutAfter:after*size});
}
console.log(JSON.stringify({scope:'simulação local; JSON sem protocolo, cache, retransmissões ou infraestrutura Firestore',payload:rows,classroom:await runClassroom(60)},null,2));
