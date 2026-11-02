import {db,identify,doc,setDoc,getDoc,onSnapshot,serverTimestamp} from './cloud.js';
const el=id=>document.getElementById(id);
let emoji='tigre',uid,room,state,answeredRound=-1,joinedName,joined=false,unsub=null,timer=null,pendingAnswer=null,answerChoice=null;
const animals=window.EITA_ANIMALS;
animals.forEach(animal=>{const b=document.createElement('button');b.type='button';b.append(window.eitaAnimalIcon(animal.id));b.setAttribute('aria-label',animal.label);b.setAttribute('aria-pressed',String(animal.id===emoji));b.onclick=()=>{emoji=animal.id;el('emojis').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));};el('emojis').append(b);});
el('code').value=new URLSearchParams(location.search).get('sala')||'';
function message(text){el('studentNotice').textContent=text;}
function disconnect(){unsub?.();unsub=null;clearInterval(timer);timer=null;}
// A primeira notificação valida a sala e é reutilizada depois da entrada:
// não é preciso ler a sala uma vez e abrir outra leitura para acompanhá-la.
function listen(){
 unsub?.();
 return new Promise((resolve,reject)=>{
  let initial=true;
  unsub=onSnapshot(room,{includeMetadataChanges:true},snapshot=>{
   if(initial&&snapshot.metadata?.fromCache)return;
   state=snapshot.exists()?snapshot.data():{status:'closed'};
   if(initial){initial=false;resolve(snapshot);}
   if(joined){render();updateTimer();}
  },error=>{
   if(initial){initial=false;reject(error);}
   else message('Conexão interrompida. Confira sua internet e entre na sala novamente.');
  });
 });
}
el('joinOnline').onclick=async()=>{
 const code=el('code').value.trim(),name=el('name').value.trim();
 if(!/^\d{6}$/.test(code)||!name){message('Informe o código de seis números e seu nome.');return;}
 el('joinOnline').disabled=true;message('Conectando à sala…');
 try{
  uid=await identify();room=doc(db,'rooms',code);
  const snapshot=await listen();
  if(!snapshot.exists())throw new Error('Sala não encontrada.');
  if(state.status==='closed'||state.expiresAt.toMillis()<=Date.now())throw new Error('Esta sala foi encerrada.');
  const existing=await getDoc(doc(room,'members',uid));
  if(!existing.exists()){
   if(state.status!=='waiting')throw new Error('A sala já começou ou foi encerrada.');
   await setDoc(doc(room,'members',uid),{name,emoji,joinedAt:serverTimestamp(),expiresAt:state.expiresAt});
  }
  joinedName=existing.exists()?existing.data().name:name;
  const selectedEmoji=existing.exists()?existing.data().emoji:emoji;
  joined=true;answeredRound=-1;answerChoice=null;pendingAnswer=null;
  el('joinPanel').hidden=true;el('playPanel').hidden=false;
  el('identity').replaceChildren(window.eitaAnimalIcon(selectedEmoji),document.createTextNode(' '+joinedName));
  message('Você entrou na sala '+code+'.');
  render();startTimer();
 }catch(error){disconnect();message(error.message);el('joinOnline').disabled=false;}
};
function expired(){return state?.status==='question'&&!state.paused&&state.deadline.toMillis()<=Date.now();}
function render(){
 el('studentAnswers').replaceChildren();el('studentResult').textContent='';el('returnToJoin').hidden=true;
 const group=state.groups?.find(g=>g.members.includes(joinedName+' · '+uid.slice(0,4)));
 const groupEl=el('group');groupEl.replaceChildren();
 if(state.mode!=='individual'&&group){const parts=group.name.split(' ');const icon=window.eitaAnimalIcon(parts[0]);if(icon.getAttribute('src'))groupEl.append(icon,document.createTextNode(' '+parts.slice(1).join(' ')));else groupEl.textContent=group.name;}
 if(state.status==='waiting'){el('studentQuestion').textContent='Você está no jogo! Aguarde o início da partida.';return;}
 if(state.status==='closed'){
  el('studentQuestion').textContent='Sala encerrada';el('returnToJoin').hidden=false;
  message('Sala encerrada. Obrigado por jogar!');disconnect();return;
 }
 if(state.status==='question'){
  el('studentQuestion').textContent=state.question.text;
  const sent=answeredRound===state.round,pending=pendingAnswer?.round===state.round;
  state.question.options.forEach((answer,i)=>{
   const b=document.createElement('button');b.textContent=String.fromCharCode(65+i)+'. '+answer;
   b.disabled=state.paused||sent||pending||expired()||!state.participants.includes(uid);
   if((sent&&answerChoice===i)||(pending&&pendingAnswer.choice===i)){b.classList.add('answer-selected');b.setAttribute('aria-label',b.textContent+' · sua escolha');}
   b.onclick=()=>submit(i);el('studentAnswers').append(b);
  });
  if(sent)el('studentResult').textContent='Resposta '+String.fromCharCode(65+answerChoice)+' enviada!';
  else if(pending)el('studentResult').textContent='Enviando resposta '+String.fromCharCode(65+pendingAnswer.choice)+'…';
  else if(state.paused)el('studentResult').textContent='Partida pausada pelo professor.';
 }else if(state.status==='resolving')el('studentQuestion').textContent='Preparando o resultado…';
 else{el('studentQuestion').textContent=state.result?.message||'Aguarde…';el('studentResult').textContent=state.result?.explain||'';}
}
async function submit(choice){
 if(!joined||state?.status!=='question'||state.paused||expired()||answeredRound===state.round||pendingAnswer||!state.participants.includes(uid))return;
 const target=room,round=state.round;pendingAnswer={round,choice};message('');render();
 try{
  await setDoc(doc(target,'answers',round+'_'+uid),{uid,round,choice,submittedAt:serverTimestamp(),expiresAt:state.expiresAt});
  if(room!==target||!joined)return;
  answeredRound=round;answerChoice=choice;
 }catch(error){if(room===target&&joined)message('Resposta não enviada. Confira a conexão e se o tempo ainda está aberto.');}
 finally{
  if(room===target&&joined){pendingAnswer=null;render();updateTimer();}
 }
}
function updateTimer(){
 if(!state)return;
 const text=state.status==='question'?(state.paused?'Pausado':Math.max(0,Math.ceil((state.deadline.toMillis()-Date.now())/1000))+' s'):'';
 if(el('studentTimer').textContent!==text)el('studentTimer').textContent=text;
 if(expired())el('studentAnswers').querySelectorAll('button').forEach(b=>b.disabled=true);
}
function startTimer(){clearInterval(timer);updateTimer();if(state.status!=='closed')timer=setInterval(updateTimer,250);}
el('returnToJoin').onclick=()=>{
 disconnect();joined=false;room=null;state=null;pendingAnswer=null;answeredRound=-1;answerChoice=null;
 el('playPanel').hidden=true;el('joinPanel').hidden=false;el('joinOnline').disabled=false;el('code').value='';message('');el('code').focus();
};
addEventListener('pagehide',disconnect);
addEventListener('pageshow',event=>{
 if(event.persisted&&joined&&state?.status!=='closed')listen().then(startTimer).catch(()=>message('Confira a conexão e entre na sala novamente.'));
});
