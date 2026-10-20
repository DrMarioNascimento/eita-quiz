import {db,identifyTeacher,observeTeacher,doc,collection,updateDoc,getDocs,onSnapshot,runTransaction,serverTimestamp,Timestamp,query,where,writeBatch} from './cloud.js';
const byId=id=>document.getElementById(id);
let room=null,uid=null,roster=[],round=0,unsub=null;
const notice=text=>byId('roomNotice').textContent=text;
function report(error){
 console.error(error);
 const messages={'auth/popup-blocked':'O navegador bloqueou o Google. Permita pop-ups para este site e tente novamente.','auth/popup-closed-by-user':'Login cancelado. Clique em Abrir sala com Google para tentar de novo.','auth/unauthorized-domain':'Abra pelo endereço https://eita-quiz.web.app/ para entrar com Google.','auth/operation-not-allowed':'Ative o Google no Authentication do projeto Eita Quiz.'};
 notice(({'permission-denied':'O servidor recusou a operação. Confira se as regras do Firestore foram publicadas.'})[error.code]||messages[error.code]||'Não foi possível conectar. Confira a internet e tente novamente.');
}
function openRoomQr(){
 byId('qrRoomCode').textContent=room.id;
 byId('roomQr').innerHTML=window.MosaicoQR.svg(byId('roomLink').href,{nivel:'M',margem:4,rotulo:'QR Code de entrada na sala',fundo:'#ffffff',tinta:'#05070c'});
 byId('roomQrDialog').showModal();
}
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
 if(location.protocol!=='https:'&&location.hostname!=='localhost'){notice('Abra https://eita-quiz.web.app/ para criar a sala online.');return;}
 byId('createRoom').disabled=true;notice('Entrando com Google…');
 try{
  uid=await identifyTeacher();
  notice('Criando sala…');
  for(let attempt=0;attempt<5;attempt++){
   const bytes=crypto.getRandomValues(new Uint32Array(1));const code=String(100000+bytes[0]%900000);const candidate=doc(db,'rooms',code);
   try{await runTransaction(db,async tx=>{const existing=await tx.get(candidate);if(existing.exists())throw new Error('collision');tx.set(candidate,{owner:uid,status:'waiting',round:0,question:null,result:null,paused:false,deadline:Timestamp.now(),createdAt:serverTimestamp(),expiresAt:Timestamp.fromMillis(Date.now()+86400000),participants:[],groups:[],mode:'individual'});});room=candidate;break;}catch(e){if(e.message!=='collision')throw e;}
  }
  if(!room)throw new Error('Não foi possível gerar código');
  api.active=true;round=0;window.eitaGame.reset();
  byId('roomDetails').hidden=false;byId('roomCode').textContent='Código: '+room.id;
  // mesmo endereço do professor (eita.drmarionascimento.com.br ou eita-quiz.web.app)
  const link=new URL('aluno.html',location.protocol==='https:'?location.href:'https://eita-quiz.web.app/');
  link.searchParams.set('sala',room.id);byId('roomLink').href=link.href;openRoomQr();
  
  document.querySelector('header small').textContent='Sala online · respostas reais';
  notice('Compartilhe o link ou o código. Prepare a turma antes de iniciar.');
  unsub=onSnapshot(collection(room,'members'),snapshot=>{
   const members=snapshot.docs.map(d=>({uid:d.id,...d.data()}));
   if(!window.eitaGame.isLocked()){
    roster=members.map(p=>({...p,name:p.name+' · '+p.uid.slice(0,4)}));window.eitaGame.setRoster(roster);
   }
   byId('roomRoster').textContent=members.length+' aluno(s) na sala';byId('qrRoster').textContent=byId('roomRoster').textContent;
  },report);
 }catch(e){report(e);byId('createRoom').disabled=false;}
};
byId('copyRoom').onclick=async()=>{try{await navigator.clipboard.writeText(byId('roomLink').href);notice('Link copiado!');}catch(e){notice('Copie o endereço do link dos alunos.');}};
// 20/10/2026: encerrar apaga tudo da sessão no servidor (respostas, alunos e a sala).
// Se a sala for abandonada sem encerrar, a política de TTL (campo expiresAt) apaga em até 24 h.
async function wipeRoom(target){
 for(const name of ['answers','members']){
  const docs=(await getDocs(collection(target,name))).docs;
  for(let i=0;i<docs.length;i+=400){const batch=writeBatch(db);docs.slice(i,i+400).forEach(d=>batch.delete(d.ref));await batch.commit();}
 }
 const batch=writeBatch(db);batch.delete(target);await batch.commit();
}
byId('closeRoom').onclick=async()=>{
 const target=room;if(!target)return;
 byId('closeRoom').disabled=true;notice('Encerrando e apagando os dados da sala…');
 unsub?.();unsub=null;
 try{await wipeRoom(target);notice('Sala encerrada. Nenhum dado da turma ficou guardado.');}
 catch(e){
  console.error(e);
  try{await updateDoc(target,{status:'closed',question:null,result:null,groups:[],participants:[]});}catch(_){}
  notice('Sala encerrada. Não foi possível apagar tudo agora; o servidor apaga sozinho em até 24 h.');
 }
 room=null;api.active=false;roster=[];window.eitaGame.setRoster([]);window.eitaGame.reset();byId('roomDetails').hidden=true;byId('createRoom').disabled=false;byId('closeRoom').disabled=false;
};

byId('showRoomQr').onclick=openRoomQr;
byId('dismissRoomQr').onclick=()=>byId('roomQrDialog').close();

observeTeacher(authorized=>{
 window.eitaTeacherAuthorized=authorized;
 byId('teacherTools').hidden=!authorized;
 byId('edit').disabled=!authorized||window.eitaGame.isLocked();
 if(!authorized)byId('editor').close();
});
