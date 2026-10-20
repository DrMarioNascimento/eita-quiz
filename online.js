import {db,identifyTeacher,currentTeacher,getDoc,observeTeacher,doc,collection,updateDoc,getDocs,onSnapshot,runTransaction,serverTimestamp,Timestamp,query,where,writeBatch} from './cloud.js';
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
// 20/10/2026: liga a tela à sala (nova ou retomada depois de recarregar a página).
const SALA='eita-sala-sessao';
// 20/10/2026: sem plano pago não há exclusão automática no servidor (TTL). Por isso, este navegador lembra
// as salas que abriu e ainda não apagou; se uma ficar aberta (aba fechada, internet caiu), ela é apagada
// na próxima vez que a mesma pessoa abrir o Eita! aqui (se tiver sido encerrada ou aberta há mais de 6 h).
// Guarda só o código da sala, nada dos participantes.
const PENDENTES='eita-salas-pendentes';
function pendentes(){try{return JSON.parse(localStorage.getItem(PENDENTES)||'[]').filter(c=>/^\d{6}$/.test(c));}catch(e){return [];}}
function marcar(code){try{const l=pendentes();if(!l.includes(code))l.push(code);localStorage.setItem(PENDENTES,JSON.stringify(l.slice(-20)));}catch(e){}}
function desmarcar(code){try{localStorage.setItem(PENDENTES,JSON.stringify(pendentes().filter(c=>c!==code)));}catch(e){}}
async function faxina(){
  const lista=pendentes().filter(c=>!room||c!==room.id);if(!lista.length)return;
  let me=null;try{me=await currentTeacher();}catch(e){}
  if(!me)return;
  let apagadas=0;
  for(const code of lista){
   try{
    const alvo=doc(db,'rooms',code),snap=await getDoc(alvo);
    if(!snap.exists()||snap.data().owner!==me){desmarcar(code);continue;}
    const d=snap.data(),idade=Date.now()-(d.createdAt?.toMillis?.()||0);
    // só apaga sala encerrada ou aberta há mais de 6 h: uma sala em uso em outra aba fica intacta
    if(d.status!=='closed'&&idade<6*3600e3)continue;
    await wipeRoom(alvo);apagadas++;desmarcar(code);
   }catch(e){console.error('Faxina da sala '+code,e);}
  }
  if(apagadas&&!room)notice(apagadas===1?'Os dados de uma sala que tinha ficado aberta foram apagados.':'Os dados de '+apagadas+' salas que tinham ficado abertas foram apagados.');
}
function attach(retomada){
  api.active=true;round=0;window.eitaGame.reset();
  try{sessionStorage.setItem(SALA,room.id);}catch(e){}
  marcar(room.id);
  byId('createRoom').disabled=true;
  byId('roomDetails').hidden=false;byId('roomCode').textContent='Código: '+room.id;
  // mesmo endereço de quem conduz (eita.drmarionascimento.com.br ou eita-quiz.web.app)
  const link=new URL('aluno.html',location.protocol==='https:'?location.href:'https://eita-quiz.web.app/');
  link.searchParams.set('sala',room.id);byId('roomLink').href=link.href;
  if(!retomada)openRoomQr();
  document.querySelector('header small').textContent='Sala online · respostas reais';
  notice(retomada?'Sala '+room.id+' retomada. Quem já tinha entrado continua na sala; a partida recomeça do início.':'Compartilhe o link ou o código. Espere todos entrarem antes de iniciar.');
  unsub=onSnapshot(collection(room,'members'),snapshot=>{
   const members=snapshot.docs.map(d=>({uid:d.id,...d.data()}));
   if(!window.eitaGame.isLocked()){
    roster=members.map(p=>({...p,name:p.name+' · '+p.uid.slice(0,4)}));window.eitaGame.setRoster(roster);
   }
   byId('roomRoster').textContent=members.length+' participante(s) na sala';byId('qrRoster').textContent=byId('roomRoster').textContent;
  },report);
}
async function resume(){
  let code=null;try{code=sessionStorage.getItem(SALA);}catch(e){}
  if(!code||room)return;
  try{
   const me=await currentTeacher();if(!me){sessionStorage.removeItem(SALA);return;}
   const candidate=doc(db,'rooms',code),snap=await getDoc(candidate);
   const d=snap.exists()?snap.data():null;
   if(!d||d.owner!==me||d.status==='closed'||d.expiresAt.toMillis()<Date.now()){sessionStorage.removeItem(SALA);return;}
   uid=me;room=candidate;attach(true);
  }catch(e){console.error(e);}
}
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
  attach(false);
  faxina();
 }catch(e){report(e);byId('createRoom').disabled=false;}
};
byId('copyRoom').onclick=async()=>{try{await navigator.clipboard.writeText(byId('roomLink').href);notice('Link copiado!');}catch(e){notice('Copie o endereço do link dos participantes.');}};
// 20/10/2026: encerrar apaga tudo da sessão no servidor (respostas, participantes e a sala).
// Se a sala for abandonada sem encerrar, a faxina acima a apaga quando a mesma pessoa voltar a abrir o Eita! neste navegador.
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
 unsub?.();unsub=null;try{sessionStorage.removeItem(SALA);}catch(e){}
 try{await wipeRoom(target);desmarcar(target.id);notice('Sala encerrada. Nenhum dado dos participantes ficou guardado.');}
 catch(e){
  console.error(e);
  try{await updateDoc(target,{status:'closed',question:null,result:null,groups:[],participants:[]});}catch(_){}
  notice('Sala encerrada, mas os dados não puderam ser apagados agora (confira a internet). Eles serão apagados na próxima vez que você abrir o Eita! neste navegador.');
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
resume().then(faxina);
