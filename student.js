import {db,identify,doc,setDoc,getDoc,onSnapshot,serverTimestamp} from './cloud.js';
const el=id=>document.getElementById(id);let emoji='tigre',uid,room,state,answeredRound=-1,joinedName;
const animals=window.EITA_ANIMALS;
animals.forEach(animal=>{const b=document.createElement('button');b.type='button';b.append(window.eitaAnimalIcon(animal.id));b.setAttribute('aria-label',animal.label);b.setAttribute('aria-pressed',String(animal.id===emoji));b.onclick=()=>{emoji=animal.id;el('emojis').querySelectorAll('button').forEach(button=>button.setAttribute('aria-pressed',String(button===b)));};el('emojis').append(b);});
el('code').value=new URLSearchParams(location.search).get('sala')||'';
function message(text){el('studentNotice').textContent=text;}
el('joinOnline').onclick=async()=>{
 const code=el('code').value.trim(),name=el('name').value.trim();if(!/^\d{6}$/.test(code)||!name){message('Informe o código de seis números e seu nome.');return;}
 el('joinOnline').disabled=true;
 try{
  uid=await identify();room=doc(db,'rooms',code);const snapshot=await getDoc(room);if(!snapshot.exists())throw new Error('Sala não encontrada.');
  const existing=await getDoc(doc(room,'members',uid));
  if(!existing.exists()){if(snapshot.data().status!=='waiting')throw new Error('A sala já começou ou foi encerrada.');await setDoc(doc(room,'members',uid),{name,emoji,joinedAt:serverTimestamp(),expiresAt:snapshot.data().expiresAt});}
  joinedName=existing.exists()?existing.data().name:name;
  el('joinPanel').hidden=true;el('playPanel').hidden=false;const identity=el('identity');identity.replaceChildren(window.eitaAnimalIcon(emoji),document.createTextNode(' '+joinedName));
  message('Você entrou na sala '+code+'.');
  onSnapshot(room,snapshot=>{if(!snapshot.exists()){state={status:'closed'};render();message('Sala encerrada. Obrigado por jogar!');return;}state=snapshot.data();render();},()=>message('Conexão interrompida. Confira sua internet.'));
 }catch(error){message(error.message);el('joinOnline').disabled=false;}
};
function render(){
 el('studentAnswers').replaceChildren();el('studentResult').textContent='';
 const group=state.groups?.find(g=>g.members.some(n=>n===joinedName+' · '+uid.slice(0,4)));
 const groupEl=el('group');groupEl.replaceChildren();if(state.mode!=='individual'&&group){const parts=group.name.split(' ');const icon=window.eitaAnimalIcon(parts[0]);if(icon.getAttribute('src'))groupEl.append(icon,document.createTextNode(' '+parts.slice(1).join(' ')));else groupEl.textContent=group.name;}
 if(state.status==='waiting'){el('studentQuestion').textContent='Você está na turma! Aguarde o professor.';return;}
 if(state.status==='closed'){el('studentQuestion').textContent='Sala encerrada';return;}
 if(state.status==='question'){
  el('studentQuestion').textContent=state.question.text;
  state.question.options.forEach((answer,i)=>{const b=document.createElement('button');b.textContent=String.fromCharCode(65+i)+'. '+answer;b.disabled=state.paused||answeredRound===state.round||!state.participants.includes(uid);b.onclick=()=>submit(i);el('studentAnswers').append(b);});
  if(answeredRound===state.round)el('studentResult').textContent='Resposta enviada!';
 }else if(state.status==='resolving'){el('studentQuestion').textContent='Preparando o resultado…';}
 else{el('studentQuestion').textContent=state.result?.message||'Aguarde…';el('studentResult').textContent=state.result?.explain||'';}
}
async function submit(choice){
 const round=state.round;el('studentAnswers').querySelectorAll('button').forEach(b=>b.disabled=true);
 try{await setDoc(doc(room,'answers',round+'_'+uid),{uid,round,choice,submittedAt:serverTimestamp(),expiresAt:state.expiresAt});answeredRound=round;el('studentResult').textContent='Resposta enviada!';}
 catch(error){message('Resposta não enviada: o tempo pode ter acabado.');render();}
}
setInterval(()=>{if(!state)return;el('studentTimer').textContent=state.status==='question'?(state.paused?'Pausado':Math.max(0,Math.ceil((state.deadline.toMillis()-Date.now())/1000))+' s'):'';if(state.status==='question'&&!state.paused&&state.deadline.toMillis()<Date.now())el('studentAnswers').querySelectorAll('button').forEach(b=>b.disabled=true);},250);
