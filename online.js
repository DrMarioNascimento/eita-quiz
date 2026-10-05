import {db,identify,doc,collection,updateDoc,getDocs,onSnapshot,runTransaction,serverTimestamp,Timestamp,query,where} from './cloud.js';
const byId=id=>document.getElementById(id);
let room=null,uid=null,roster=[],round=0,unsub=null;
const notice=text=>byId('roomNotice').textContent=text;
function report(error){console.error(error);notice('Não foi possível conectar. Confira a internet e tente novamente.');}
const api={active:false,
 async begin(q,squads,mode){
   round++;
   const groups=squads.map(s=>({name:s.name,members:s.members}));
   await updateDoc(room,{status:'question',round,question:{text:q.q,options:q.a},deadline:Timestamp.fromMillis(Date.now()+q.time*1000),paused:false,groups,mode,participants:roster.map(p=>p.uid)});
 },
 async finish(){
   await updateDoc(room,{status:'resolving',paused:false});
   const result=await getDocs(query(collection(room,'answers'),where('round','==',round)));
   const answers=new Map();result.forEach(a=>{const p=roster.find(p=>p.uid===a.data().uid);if(p)answers.set(p.name,a.data().choice);});return answers;
 },
 result(result){if(room)updateDoc(room,{status:result.bossLife<=0||result.teamLife<=0?'ended':'result',result}).catch(report);},
 pause(paused,remaining){if(room)updateDoc(room,{paused,deadline:Timestamp.fromMillis(Date.now()+remaining*1000)}).catch(report);},
 reset(){if(room)updateDoc(room,{status:'waiting',paused:false,result:null,question:null,participants:[]}).catch(report);}
};
window.eitaOnline=api;
byId('createRoom').onclick=async()=>{
 byId('createRoom').disabled=true;notice('Criando sala…');
 try{
  uid=await identify();
  for(let attempt=0;attempt<5;attempt++){
   const bytes=crypto.getRandomValues(new Uint32Array(1));const code=String(100000+bytes[0]%900000);const candidate=doc(db,'rooms',code);
   try{await runTransaction(db,async tx=>{const existing=await tx.get(candidate);if(existing.exists())throw new Error('collision');tx.set(candidate,{owner:uid,status:'waiting',round:0,question:null,result:null,paused:false,deadline:Timestamp.now(),createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+86400000),participants:[],groups:[],mode:'individual'});});room=candidate;break;}catch(e){if(e.message!=='collision')throw e;}
  }
  if(!room)throw new Error('Não foi possível gerar código');
  api.active=true;round=0;window.eitaGame.reset();
  byId('roomDetails').hidden=false;byId('roomCode').textContent='Código: '+room.id;
  const link=new URL('aluno.html',location.href);link.searchParams.set('sala',room.id);byId('roomLink').href=link.href;
  ['count','chance','entry'].forEach(id=>byId(id).disabled=true);
  document.querySelector('header small').textContent='Sala online · respostas reais';
  notice('Compartilhe o link ou o código. Prepare a turma antes de iniciar.');
  unsub=onSnapshot(collection(room,'members'),snapshot=>{
   const members=snapshot.docs.map(d=>({uid:d.id,...d.data()}));
   if(!window.eitaGame.isLocked()){
    roster=members.map(p=>({...p,name:p.name+' · '+p.uid.slice(0,4)}));window.eitaGame.setRoster(roster);
   }
   byId('roomRoster').textContent=members.length+' aluno(s) na sala';
  },report);
 }catch(e){report(e);byId('createRoom').disabled=false;}
};
byId('copyRoom').onclick=async()=>{try{await navigator.clipboard.writeText(byId('roomLink').href);notice('Link copiado!');}catch(e){notice('Copie o endereço do link dos alunos.');}};
byId('closeRoom').onclick=async()=>{
 try{await updateDoc(room,{status:'closed'});unsub?.();room=null;api.active=false;roster=[];window.eitaGame.setRoster([]);window.eitaGame.reset();byId('roomDetails').hidden=true;byId('createRoom').disabled=false;['count','chance','entry'].forEach(id=>byId(id).disabled=false);notice('Sala encerrada.');}catch(e){report(e);}
};
