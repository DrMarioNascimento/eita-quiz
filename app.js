var bossVisibleBounds = null;
const $=id=>document.getElementById(id);
let quiz=[{
  q:'Qual é a principal função dos alvéolos pulmonares?',a:['Realizar trocas gasosas','Produzir hemácias','Bombear sangue','Filtrar a urina'],correct:0,time:15,explain:'Nos alvéolos ocorre a troca de oxigênio e dióxido de carbono entre o ar e o sangue.'
},{
  q:'Qual órgão bombeia o sangue para a circulação?',a:['Pulmão','Coração','Fígado','Rim'],correct:1,time:15,explain:'O coração gera a pressão que impulsiona o sangue.'
},{
  q:'Qual estrutura conecta músculos aos ossos?',a:['Ligamento','Cartilagem','Tendão','Alvéolo'],correct:2,time:15,explain:'Os tendões transmitem a força dos músculos aos ossos.'
}];
let questionBank=window.CARDIO_BANK||null;
let battleQuestionsUsed=new Set();
function shuffleList(items){
 const result=[...items];
 for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
function prepareBattleQuestions(){
 if(!questionBank)return;
 const requested=Number($('questionCount').value)||5;
 const count=Math.max(1,Math.min(questionBank.length,Math.floor(requested)));
 $('questionCount').value=count;$('questionCount').max=questionBank.length;
 quiz=shuffleList(questionBank).slice(0,count).map(item=>({...item,a:[...item.a]}));
 battleQuestionsUsed=new Set(quiz.map(item=>item.id||item.q));
 safe($('bankSummary'),questionBank.length+' perguntas no banco · '+count+' sorteadas por batalha');
}
let squads=[],students=[],bossLife=100,teamLife=100,index=-1,running=false,paused=false,locked=false,remaining=0,last=0,handle=null,intermission=false,visualTimer=null,suddenDeath=false,deathTimers=[],attackPending=false,pendingImpact=null,selected='individual';
const safe=(el,text)=>el.textContent=text;
const entrants=[],avatarByName=new Map();
const squadSymbols=(window.EITA_ANIMALS||[]).filter(animal=>animal.squad).map(animal=>[animal.id,animal.squad]);
function prepare(){
  if(locked)return;
  selected=$('mode').value;
  const n=entrants.length,size=Math.max(2,Math.min(15,Number($('size').value)||5));
  students=entrants.map(e=>e.name);
  for(let i=n-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [students[i],students[j]]=[students[j],students[i]]
  }const k=selected==='individual'?1:Math.ceil(n/size);
  const symbols=[...squadSymbols];
  for(let i=symbols.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [symbols[i],symbols[j]]=[symbols[j],symbols[i]]
  }squads=Array.from({
    length:k
  },(_,i)=>({
    name:symbols[i%symbols.length][0]+' '+symbols[i%symbols.length][1]+(i>=symbols.length?' '+(Math.floor(i/symbols.length)+1):''),members:[],life:100,hits:null,total:0,answers:0
  }));
  students.forEach((s,i)=>squads[i%k].members.push(s));
  render();
  requestAnimationFrame(()=>fitSceneToViewport());
  controls();
}
const animalAvatars=(window.EITA_ANIMALS||[]).map(animal=>animal.id);
function chip(name){
  const e=document.createElement('span');
  e.className='student';
  const avatar=document.createElement('span');
  avatar.className='animal-avatar';
  const token=avatarByName.get(name)||animalAvatars[(Math.max(1,Number(name.split(' ').pop())||1)-1)%animalAvatars.length];
  const icon=window.eitaAnimalIcon(token);
  if(icon.getAttribute('src'))avatar.append(icon);
  avatar.setAttribute('aria-hidden','true');
  const label=document.createElement('span');
  label.className='student-name';
  label.textContent=name.replace(/ · [A-Za-z0-9]{4}$/, '');
  e.append(avatar);
  e.append(label);
  return e
}
function battery(el,life){
  el.querySelector('.liquid').style.clipPath=`inset(${100-life}% 0 0)`;
  el.classList.toggle('dead',life<=0)
}
function shatter(el,color){
  if(el===$('boss')||el===$('teamBattery'))tocarFinal();
  deathTimers.push(setTimeout(()=>shatterNow(el,color),800))
}
function shatterNow(el,color){
  if(!el||el.dataset.shattered)return;
  const arena=$('arena');
  const source=el===$('teamBattery')?el.parentElement:el;
  const rect=source.getBoundingClientRect(),scene=arena.getBoundingClientRect();
  arena.style.minHeight=scene.height+'px';el.style.minHeight=el.getBoundingClientRect().height+'px';
  el.dataset.shattered='yes';el.classList.add('dying');
  if(el===$('teamBattery'))source.classList.add('battery-shattered');
  const layer=document.createElement('div');layer.className='glass-layer';layer.setAttribute('aria-hidden','true');
  const template=source.cloneNode(true);
  const originals=[source,...source.querySelectorAll('*')],copies=[template,...template.querySelectorAll('*')];
  const props=['background','background-color','background-image','border','border-radius','box-shadow','color','font','padding','margin','display','grid-template-columns','grid-template-rows','gap','flex-direction','align-items','justify-content','min-height','opacity'];
  originals.forEach((node,i)=>{const copy=copies[i];if(!copy)return;copy.removeAttribute('id');if(typeof getComputedStyle==='function'){const style=getComputedStyle(node);props.forEach(prop=>copy.style.setProperty(prop,style.getPropertyValue(prop)))}copy.style.animation='none';copy.style.transition='none'});
  template.classList.remove('dying','gone','battery-shattered');template.style.width=rect.width+'px';template.style.height=rect.height+'px';template.style.position='relative';template.style.margin='0';
  const ground=Math.max($('teamBattery').getBoundingClientRect().bottom,$('boss').getBoundingClientRect().bottom)-scene.top;
  for(let row=0;row<4;row++)for(let col=0;col<3;col++){
    const shard=document.createElement('div');shard.className='glass-piece';
    shard.style.left=(rect.left-scene.left)+'px';shard.style.top=(rect.top-scene.top)+'px';shard.style.width=rect.width+'px';shard.style.height=rect.height+'px';
    const x=col*100/3,y=row*25;shard.style.clipPath=`polygon(${x}% ${y}%,${x+100/3}% ${y+2}%,${x+100/3-2}% ${y+25}%,${x+2}% ${y+23}%)`;
    shard.style.setProperty('--fall',Math.max(0,ground-(rect.top-scene.top)-rect.height*(row+1)/4)+'px');shard.style.setProperty('--scatter',((col-1)*24+(Math.random()-.5)*24)+'px');shard.style.setProperty('--glass-tilt',((Math.random()-.5)*9)+'deg');shard.style.setProperty('--delay',(Math.random()*.1)+'s');
    shard.append(template.cloneNode(true));layer.append(shard);
  }
  arena.append(layer);el.classList.add('gone');
  deathTimers.push(setTimeout(()=>{
    layer.remove();
    if(el===$('boss')||el===$('teamBattery')){
      const message=document.createElement('div');
      message.className='battle-verdict '+(el===$('boss')?'victory':'defeat');
      message.textContent=el===$('boss')?'You won!':'You guys lost';
      message.setAttribute('role','status');
      message.style.left=(rect.left-scene.left)+'px';
      message.style.top=(rect.top-scene.top)+'px';
      message.style.width=rect.width+'px';
      message.style.height=rect.height+'px';
      arena.append(message);
    }
  },1900));
}
const squadCards=new Map();
let rosterKey='';
function createSquadCard(s){
  const el=document.createElement('div');
  el.dataset.squad=s.name;
  el.className='battery'+(selected==='shared'?' shared-group':'');
  el.innerHTML='<div class="liquid"></div><div class="content"><strong></strong><div class="students"></div><small></small></div>';
  const emblem=document.createElement('span');
  emblem.className='squad-emblem';
  const icon=window.eitaAnimalIcon(s.name.split(' ')[0]);
  if(icon.getAttribute('src'))emblem.append(icon);
  el.querySelector('.content').prepend(emblem);
  s.members.forEach(name=>{
    const member=document.createElement('span');member.className='squad-member';member.textContent=name.replace(/ · [A-Za-z0-9]{4}$/, '');el.querySelector('.students').append(member)
  });
  return el;
}
function updateLifeEdge(id,life){
  const slot=$(id).parentElement;
  if(!slot)return;
  slot.style.setProperty('--life-edge',life+'%');
  slot.style.setProperty('--life-size',life+'%');
  $(id).style.clipPath='none';
  $(id).style.width=life+'%';
  slot.style.setProperty('--edge-visible',life>0?1:0);
}
function render(){
  safe($('teamValue'),Math.round(teamLife)+'%');
  safe($('bossValue'),Math.round(bossLife)+'%');
  $('bossFill').style.clipPath=`inset(0 ${100-bossLife}% 0 0)`;
  $('teamFill').style.clipPath=`inset(0 ${100-teamLife}% 0 0)`;
  battery($('teamBattery'),teamLife);
  updateLifeEdge('bossFill',bossLife);
  updateLifeEdge('teamFill',teamLife);
  const key=selected+'|'+squads.map(s=>s.name+':'+s.members.join(',')).join('|');
  if(key!==rosterKey){
    rosterKey=key;
    squadCards.clear();
    $('students').replaceChildren();
    $('groups').replaceChildren();
    if(selected==='individual')students.forEach(name=>$('students').append(chip(name)));
    else{
      safe($('students'),selected==='own'?'Energia conjunta dos esquadrões iniciais':'Vida única · todos os esquadrões permanecem juntos');
      squads.forEach(s=>{
        const el=createSquadCard(s);squadCards.set(s.name,el);$('groups').append(el)
      })
    }
  }
  if(selected!=='individual')squads.forEach(s=>{
    const el=squadCards.get(s.name);el.style.setProperty('--squad-energy',s.life+'%');
    safe(el.querySelector('strong'),s.name.split(' ').slice(1).join(' ')+(selected==='own'?' · '+Math.round(s.life)+'%':''));
    safe(el.querySelector('small'),s.life<=0?'Sem energia · espectadores':s.hits===null?'Prontos':`Rodada: ${s.hits}/${s.members.length} acertos · acumulado: ${s.total}/${s.answers}`);
    battery(el,selected==='own'?s.life:teamLife);
    if(selected==='own'&&s.life<=0&&!s.eliminatedShown){
      shatter(el,'#c8f044');s.eliminatedShown=true
    }
  });
}
function lockAttackFrame(){
  const boss=$('boss'),arena=$('arena');
  boss.style.height=boss.getBoundingClientRect().height+'px';
  arena.style.minHeight=arena.getBoundingClientRect().height+'px'
}
function unlockAttackFrame(){
  $('boss').style.height=''
}
function controls(){
  $('edit').disabled=locked||!window.eitaTeacherAuthorized;
  ['mode','advanceMode','questionCount'].forEach(id=>$(id).disabled=locked);
  $('size').disabled=locked||selected==='individual';
  $('draw').disabled=locked||selected==='individual';
  $('draw').textContent='Sortear esquadrões';
  $('start').disabled=running||intermission||attackPending||$('boss').classList.contains('video-active')||bossLife<=0||teamLife<=0;
  $('pause').disabled=!(running||intermission||attackPending);
  $('finish').disabled=!running;
  $('start').textContent=index<0?'Iniciar pergunta':'Próxima pergunta';
  $('pause').textContent=paused?'Continuar':'Pausar';
}
function stopBossVideo(){
  cancelBossShot();
  const v=$('bossVideo');
  v.pause();
  v.currentTime=0;
  $('boss').classList.remove('video-active');
  pararSomDoChefe();
  abafarMusica(false);
  unlockAttackFrame()
}
function commitImpact(){
  if(!pendingImpact)return;
  const action=pendingImpact;
  pendingImpact=null;
  attackPending=false;
  action()
}
function playBossVideo(){
  lockAttackFrame();
  fitVideoToStill();
  const v=$('bossVideo');
  v.currentTime=0;
  impactoMostrado=false;
  $('boss').classList.add('video-active');
  abafarMusica(true);
  followBossShot();
  v.muted=!!chefeAtual.som;
  tocarSomDoChefe();
  const playing=v.play();
  if(playing)playing.catch(()=>{
    commitImpact();stopBossVideo()
  })
}
// Chefes, fundos e trilhas: catálogo em chefes.js. Um chefe e uma música novos por partida.
const CHEFES=(window.EITA_CHEFES&&window.EITA_CHEFES.length)?window.EITA_CHEFES:[{id:'sombra',nome:'Sombra',video:'assets/chefe-7s.webm',fundo:null,golpe:{tipo:'raio',inicio:2,fim:3.85,viagem:.22,cor:'#ff3d5e',trajeto:[[1.5,.884,.290],[5,.875,.300]]}}];
const MUSICAS=window.EITA_MUSICAS||[];
let chefeAtual=null,partidaIniciada=false,impactoMostrado=false;
// Sorteio em "saco": passa por todos os itens antes de repetir, e lembra a ordem mesmo se a página for recarregada.
const memoriaSorteio={};
function lerSorteio(chave){try{return JSON.parse(localStorage.getItem('eita-sorteio-'+chave)||'null')}catch(e){return null}}
function gravarSorteio(chave,dados){memoriaSorteio[chave]=dados;try{localStorage.setItem('eita-sorteio-'+chave,JSON.stringify(dados))}catch(e){}}
function sortearSemRepetir(lista,chave){
 if(!lista.length)return null;
 const ids=lista.map(item=>item.id||item.src);
 const salvo=memoriaSorteio[chave]||lerSorteio(chave)||{};
 let saco=(Array.isArray(salvo.saco)?salvo.saco:[]).filter(id=>ids.includes(id));
 if(!saco.length){
  saco=shuffleList(ids);
  if(saco.length>1&&saco[0]===salvo.ultimo)saco.push(saco.shift());
 }
 const id=saco.shift();
 gravarSorteio(chave,{saco,ultimo:id});
 return lista[ids.indexOf(id)];
}
function aplicarChefe(chefe){
 chefeAtual=chefe;
 const v=$('bossVideo'),main=document.querySelector('main');
 bossVisibleBounds=null;
 v.preload='auto';
 v.setAttribute('aria-label','Animação de ataque de '+chefe.nome);
 $('boss').dataset.chefe=chefe.id;
 const atual=v.querySelector('source');
 if(!atual||atual.getAttribute('src')!==chefe.video){
  v.replaceChildren();
  const source=document.createElement('source');source.src=chefe.video;source.type='video/webm';v.append(source);
  v.load();
 }
 if(main){
  if(chefe.fundo){main.style.backgroundImage='url("'+chefe.fundo+'")';main.classList.add('fundo-chefe');}
  else{main.style.backgroundImage='';main.classList.remove('fundo-chefe');}
 }
}
function novoChefe(){aplicarChefe(sortearSemRepetir(CHEFES,'chefe'));}

// Trilha da partida: uma música em loop por batalha; Final.mp3 quando um dos lados é destruído.
const trilha={musica:null,ganho:1,fade:null,abafada:false,final:null};
const VOLUME_MUSICA=.35;
function volumeAlvo(){return Math.min(1,VOLUME_MUSICA*trilha.ganho*(trilha.abafada?.4:1));}
function fadeMusica(alvo,ms,depois){
 const m=trilha.musica;if(!m)return;
 clearInterval(trilha.fade);
 const inicio=m.volume,passos=Math.max(1,Math.round(ms/40));let n=0;
 trilha.fade=setInterval(()=>{n++;m.volume=Math.max(0,Math.min(1,inicio+(alvo-inicio)*n/passos));if(n>=passos){clearInterval(trilha.fade);trilha.fade=null;if(depois)depois();}},40);
}
function tocarMusicaDaPartida(){
 pararAudios();
 const faixa=sortearSemRepetir(MUSICAS,'musica');
 if(!faixa)return;
 const m=new Audio(faixa.src);m.loop=true;m.preload='auto';
 trilha.musica=m;trilha.ganho=faixa.ganho||1;trilha.abafada=false;
 m.volume=0;
 const p=m.play();if(p&&p.catch)p.catch(()=>{});
 fadeMusica(volumeAlvo(),900);
}
function pausarMusica(pausar){
 const m=trilha.musica;if(!m||trilha.final)return;
 if(pausar)m.pause();else{const p=m.play();if(p&&p.catch)p.catch(()=>{});}
}
function abafarMusica(sim){
 if(!trilha.musica||trilha.final||trilha.abafada===sim)return;
 trilha.abafada=sim;fadeMusica(volumeAlvo(),300);
}
function tocarFinal(){
 if(trilha.final)return;
 const m=trilha.musica;
 if(m)fadeMusica(0,700,()=>m.pause());
 const dados=window.EITA_AUDIO_FINAL;if(!dados)return;
 const f=new Audio(dados.src);f.volume=Math.min(1,dados.ganho||1);trilha.final=f;
 const p=f.play();if(p&&p.catch)p.catch(()=>{});
}
function tocarSomDoChefe(){
 pararSomDoChefe();
 const som=chefeAtual&&chefeAtual.som;if(!som)return;
 const a=new Audio(som.src);a.volume=Math.min(1,som.ganho||1);trilha.somChefe=a;
 const p=a.play();if(p&&p.catch)p.catch(()=>{});
}
function pararSomDoChefe(){
 if(trilha.somChefe){trilha.somChefe.pause();trilha.somChefe=null;}
}
function pararAudios(){
 clearInterval(trilha.fade);trilha.fade=null;
 if(trilha.musica)trilha.musica.pause();
 if(trilha.final)trilha.final.pause();
 trilha.musica=null;trilha.final=null;trilha.abafada=false;
}

// Golpe do chefe: raio (Sombra) ou projétil que se desloca até a bateria e explode no impacto.
let bossShotFrame=null;
function muzzleAt(time){
 const track=chefeAtual.golpe.trajeto;
 for(let i=1;i<track.length;i++)if(time<=track[i][0]){
  const a=track[i-1],b=track[i],mix=Math.max(0,Math.min(1,(time-a[0])/(b[0]-a[0])));
  return {x:a[1]+(b[1]-a[1])*mix,y:a[2]+(b[2]-a[2])*mix};
 }
 const point=track[track.length-1];return {x:point[1],y:point[2]};
}
function cancelBossShot(){
 const v=$('bossVideo');
 if(bossShotFrame!==null){if(v.cancelVideoFrameCallback)v.cancelVideoFrameCallback(bossShotFrame);else cancelAnimationFrame(bossShotFrame);}
 bossShotFrame=null;$('bossShot').classList.remove('active');
 $('bossProjectile').className='boss-projectile';
}
function mostrarImpacto(x,y){
 if(impactoMostrado||!pendingImpact)return;
 impactoMostrado=true;
 const burst=document.createElement('div');
 burst.className='golpe-impacto';burst.setAttribute('aria-hidden','true');
 burst.style.left=x+'px';burst.style.top=y+'px';
 burst.style.setProperty('--golpe-cor',chefeAtual.golpe.cor||'#ffb347');
 $('arena').append(burst);
 setTimeout(()=>burst.remove(),900);
 const shell=$('teamBattery').parentElement;
 shell.classList.remove('impacto');void shell.offsetWidth;shell.classList.add('impacto');
 setTimeout(()=>shell.classList.remove('impacto'),520);
}
function updateBossShot(time){
 const g=chefeAtual.golpe,shot=$('bossShot'),ativo=$('boss').classList.contains('video-active');
 const scene=$('arena').getBoundingClientRect(),video=$('bossVideo').getBoundingClientRect(),battery=$('teamBattery').getBoundingClientRect();
 if(g.tipo==='raio'){
  const active=time>=g.inicio&&time<=g.fim&&ativo;
  shot.classList.toggle('active',active);
  if(!active)return;
  const muzzle=muzzleAt(time);
  const x=video.left-scene.left+video.width*muzzle.x,y=video.top-scene.top+video.height*(muzzle.y-.035)+2;
  const targetX=battery.left-scene.left+battery.width*.08,targetY=Math.max(battery.top-scene.top+20,Math.min(battery.bottom-scene.top-20,y));
  const dx=targetX-x,dy=targetY-y,distance=Math.hypot(dx,dy);
  shot.style.left=x+'px';shot.style.top=y+'px';shot.style.width=distance+'px';
  shot.style.transform='translateY(-50%) rotate('+Math.atan2(dy,dx)+'rad)';
  const arrival=Math.min(1,(time-g.inicio)/g.viagem);
  shot.style.setProperty('--shot-arrival',arrival);
  shot.style.setProperty('--shot-fade',String(Math.min(1,(g.fim-time)/.18)));
  if(time>=g.inicio+g.viagem){mostrarImpacto(targetX,targetY);commitImpact();}
  return;
 }
 const proj=$('bossProjectile');
 if(!ativo||time<g.inicio||!pendingImpact){proj.className='boss-projectile';return;}
 const x0=video.left-scene.left+video.width*g.origem[0],y0=video.top-scene.top+video.height*g.origem[1]-(chefeAtual.id==='artemis'?4:0);
 const x1=battery.left-scene.left+battery.width*.06,y1=Math.max(battery.top-scene.top+40,Math.min(battery.bottom-scene.top-40,y0));
 const t=Math.min(1,(time-g.inicio)/g.viagem);
 if(t>=1){proj.className='boss-projectile';mostrarImpacto(x1,y1);commitImpact();return;}
 const ease=t*t*(1.6-.6*t);
 const x=x0+(x1-x0)*ease,y=y0+(y1-y0)*ease-(g.tipo==='flecha'?0:Math.sin(Math.PI*t)*18);
 proj.className='boss-projectile active tipo-'+g.tipo;
 proj.style.left=x+'px';proj.style.top=y+'px';
 proj.style.setProperty('--golpe-cor',g.cor||'#ffb347');
 proj.style.setProperty('--golpe-t',t.toFixed(3));
 proj.style.setProperty('--golpe-angulo',Math.atan2(y1-y0,x1-x0)+'rad');
}
function followBossShot(){
 cancelBossShot();const v=$('bossVideo');
 const frame=(now,metadata)=>{
  if(!$('boss').classList.contains('video-active'))return;
  updateBossShot(metadata?.mediaTime??v.currentTime);
  bossShotFrame=v.requestVideoFrameCallback?v.requestVideoFrameCallback(frame):requestAnimationFrame(frame);
 };
 bossShotFrame=v.requestVideoFrameCallback?v.requestVideoFrameCallback(frame):requestAnimationFrame(frame);
}
$('bossVideo').ontimeupdate=()=>updateBossShot($('bossVideo').currentTime);
$('bossVideo').onended=()=>{
  commitImpact();
  stopBossVideo()
};
$('bossVideo').onerror=()=>{
  commitImpact();
  stopBossVideo()
};
async function start(){
  if(!window.eitaOnline?.active){safe($('status'),'Abra uma sala com Google e aguarde os alunos entrarem.');return;}
  if(window.eitaOnline?.active){
    if(!entrants.length){safe($('status'),'Aguarde os alunos entrarem na sala.');return;}
    if(!locked)prepare();
  }
  if(running||attackPending||bossLife<=0||teamLife<=0)return;
  if(index<0&&!suddenDeath){partidaIniciada=true;tocarMusicaDaPartida();}
  cancelAnimationFrame(handle);
  intermission=false;
  stopBossVideo();
  locked=true;
  index++;
  if(index>=quiz.length){
    index=0;
    suddenDeath=true;
  }
  if(suddenDeath&&questionBank){
      const unseen=questionBank.filter(item=>!battleQuestionsUsed.has(item.id||item.q));
      const extra=shuffleList(unseen.length?unseen:questionBank)[0];
      quiz[index]={...extra,a:[...extra.a]};battleQuestionsUsed.add(extra.id||extra.q);
  }
  const q=quiz[index];
  remaining=q.time;
  running=true;
  paused=false;
  safe($('round'),suddenDeath?`Morte súbita · pergunta ${index+1}`:`Pergunta ${index+1} de ${quiz.length}`);
  safe($('question'),q.q);
  $('options').replaceChildren();
  q.a.forEach((a,i)=>{
    let el=document.createElement('div');el.className='option';el.textContent=String.fromCharCode(65+i)+'. '+a;$('options').append(el)
  });
  safe($('status'),'O chefão está carregando...');
  safe($('log'),'');
  safe($('transition'),'');
  last=performance.now();
  controls();
  if(window.eitaOnline?.active){
    try{await window.eitaOnline.begin(quiz[index],squads,selected);}catch(error){running=false;locked=false;safe($('status'),'Não foi possível iniciar online. Tente novamente.');controls();return;}
    last=performance.now();
  }
  tick();
}
function tick(){
  if(intermission){
    const now=performance.now();
    if(!paused)remaining=Math.max(0,remaining-(now-last)/1000);
    last=now;
    safe($('transition'),paused?'Próxima pergunta pausada':`Próxima pergunta em ${Math.ceil(remaining)} s`);
    if(remaining<=0){
      intermission=false;
      start();
      return
    }handle=requestAnimationFrame(tick);
    return
  }if(!running)return;
  const now=performance.now();
  if(!paused)remaining=Math.max(0,remaining-(now-last)/1000);
  last=now;
  safe($('timer'),Math.ceil(remaining)+' s'+(paused?' · pausado':''));
  const progress=1-remaining/quiz[index].time;
  $('boss').style.setProperty('--charge',progress);
  $('chargeEnergy').style.height=(progress*100)+'%';
  $('charge').style.clipPath=`inset(${100-progress*100}% 0 0)`;
  if(remaining<=0){
    resolve();
    return
  }handle=requestAnimationFrame(tick)
}
async function resolve(){
  if(!running)return;
  running=false;
  cancelAnimationFrame(handle);
  remaining=0;
  $('boss').style.setProperty('--charge',1);
  $('chargeEnergy').style.height='100%';
  $('charge').style.clipPath='inset(0 0 0)';
  let hits=0,total=0;
  let onlineAnswers=null;
  if(window.eitaOnline?.active){try{onlineAnswers=await window.eitaOnline.finish();}catch(error){running=true;safe($('status'),'Falha ao buscar respostas. Clique em Encerrar tempo para tentar novamente.');controls();return;}}
  squads.forEach(s=>{
    if(selected==='own'&&s.life<=0)return;s.hits=s.members.reduce((v,name)=>v+(Number(onlineAnswers?.get(name)===quiz[index].correct)),0);s.total+=s.hits;s.answers+=s.members.length;hits+=s.hits;total+=s.members.length
  });
  const rate=total?hits/total:0;
  let result;
  const applyResult=()=>{
    if(rate>.5){
      const damage=suddenDeath?bossLife:100/quiz.length;
      bossLife=Math.max(0,bossLife-damage);
      if(bossLife<1e-8)bossLife=0;
      result=`Golpe interrompido! A turma causou ${damage.toFixed(1)} de dano.`;
      $('boss').classList.add('hit');
      positionStudentShot();$('arena').classList.add('counter')
    }else{
      if(selected==='own'){
        squads.forEach(s=>{
          if(s.life>0)s.life=suddenDeath?0:Math.max(0,s.life-(100/quiz.length)*(1-s.hits/s.members.length));if(s.life<1e-8)s.life=0
        });
        teamLife=squads.reduce((v,s)=>v+s.life,0)/squads.length
      }else teamLife=suddenDeath?0:Math.max(0,teamLife-100/quiz.length);
      if(teamLife<1e-8)teamLife=0;
      result='O chefão disparou! As baterias perderam energia.';
      $('teamBattery').classList.add('attack')
    }render();
    $('options').children[quiz[index].correct].classList.add('correct');
    safe($('timer'),`${hits}/${total} acertos · ${Math.round(rate*100)}%`);
    if(bossLife<=0){
      result='Vitória! A turma derrotou o chefão.';
      stopBossVideo();
      shatter($('boss'),'#ffba56')
    }else if(teamLife<=0){
      result='A turma ficou sem energia. Fim da batalha.';
      shatter($('teamBattery'),'#62ffc9')
    }else if(index===quiz.length-1&&!suddenDeath)result+=' A próxima rodada será de morte súbita.';
    safe($('status'),result);
    safe($('log'),quiz[index].explain+(quiz[index].sourcePage?' · Cardio.pdf, página '+quiz[index].sourcePage:''));
    visualTimer=setTimeout(()=>{
      $('boss').style.setProperty('--charge',0);$('chargeEnergy').style.height='0%';$('charge').style.clipPath='inset(100% 0 0)';$('boss').classList.remove('hit');$('teamBattery').classList.remove('attack');$('boss').classList.remove('firing');$('arena').classList.remove('firing','counter')
    },1000);
    if(bossLife>0&&teamLife>0&&$('advanceMode').value!=='manual'){
      intermission=true;
      paused=false;
      remaining=Math.max(5,Number.isFinite($('bossVideo').duration)&&$('boss').classList.contains('video-active')?Math.max(0,$('bossVideo').duration-$('bossVideo').currentTime):0);
      last=performance.now();
      handle=requestAnimationFrame(tick);
      safe($('transition'),`Próxima pergunta em ${Math.ceil(remaining)} s`)
    }else safe($('transition'),bossLife>0&&teamLife>0?'Clique em Próxima pergunta para continuar.':'');
    window.eitaOnline?.result({bossLife,teamLife,message:result,correct:quiz[index].correct,explain:quiz[index].explain});
    controls()
  };
  if(rate>.5){
    applyResult()
  }else{
    attackPending=true;
    pendingImpact=applyResult;
    paused=false;
    $('boss').classList.add('firing');
    $('arena').classList.add('firing');
    safe($('status'),'O chefão está disparando…');
    controls();
    playBossVideo()
  }
}
function reset(){
  pararAudios();
  if(partidaIniciada||!chefeAtual){partidaIniciada=false;novoChefe();}
  prepareBattleQuestions();
  window.eitaOnline?.reset();
  rosterKey='';
  attackPending=false;
  pendingImpact=null;
  $('arena').querySelectorAll('.glass-layer,.battle-verdict').forEach(layer=>layer.remove());
  $('teamBattery').parentElement?.classList.remove('battery-shattered');
  $('arena').style.minHeight='';
  $('teamBattery').style.minHeight='';
  $('boss').style.minHeight='';
  deathTimers.forEach(clearTimeout);
  deathTimers=[];
  [$('boss'),$('teamBattery')].forEach(el=>{
    el.classList.remove('gone','dying');delete el.dataset.shattered;el.querySelectorAll('.shatter-layer').forEach(layer=>layer.remove())
  });
  stopBossVideo();
  running=false;
  intermission=false;
  clearTimeout(visualTimer);
  $('boss').classList.remove('hit','firing');
  $('arena').classList.remove('firing','counter');
  $('teamBattery').classList.remove('attack');
  safe($('transition'),'');
  cancelAnimationFrame(handle);
  locked=false;
  paused=false;
  bossLife=teamLife=100;
  index=-1;
  suddenDeath=false;
  $('boss').style.setProperty('--charge',0);
  $('chargeEnergy').style.height='0%';
  $('charge').style.clipPath='inset(100% 0 0)';
  safe($('round'),'Prepare a partida');
  safe($('question'),'A turma está pronta para enfrentar o chefão?');
  $('options').replaceChildren();
  safe($('timer'),'Aguardando');
  safe($('status'),'Escolha o modo e inicie a primeira pergunta.');
  safe($('log'),'');
  prepare();
  controls()
}
$('draw').onclick=prepare;
$('mode').onchange=prepare;
$('size').onchange=prepare;
$('start').onclick=start;
$('pause').onclick=()=>{
  paused=!paused;
  window.eitaOnline?.pause(paused,remaining);
  pausarMusica(paused);
  const v=$('bossVideo');
  if($('boss').classList.contains('video-active')){
    if(paused){v.pause();if(trilha.somChefe)trilha.somChefe.pause();}
    else{v.play().catch(()=>stopBossVideo());if(trilha.somChefe){const p=trilha.somChefe.play();if(p&&p.catch)p.catch(()=>{});}}
  }controls()
};
$('finish').onclick=resolve;
$('reset').onclick=reset;
$('edit').onclick=()=>{
  if(!window.eitaTeacherAuthorized||locked)return;
  $('quizText').value=(questionBank||quiz).map(q=>[q.q,...q.a,q.correct+1,q.time,q.explain].join('\n')).join('\n---\n');
  safe($('error'),'');
  $('editor').showModal()
};
$('questionCount').onchange=()=>{if(!locked)reset();};
$('cancel').onclick=()=>$('editor').close();
$('save').onclick=()=>{
  if(!window.eitaTeacherAuthorized||locked)return;
  try{
    const items=$('quizText').value.split(/^---\s*$/m).map(block=>{
      const lines=block.trim().split('\n').map(x=>x.trim());const correct=Number(lines[5])-1,time=Number(lines[6]);if(lines.length<7||lines.slice(0,5).some(x=>!x)||!Number.isInteger(correct)||correct<0||correct>3||!Number.isFinite(time)||time<5||time>300)throw Error('Cada bloco precisa de enunciado, 4 alternativas, correta de 1 a 4 e tempo de 5 a 300 segundos.');return{
        q:lines[0],a:lines.slice(1,5),correct,time,explain:lines.slice(7).join(' ')
      }
    });
    questionBank=items;
    quiz=items;
    $('editor').close();
    reset()
  }catch(e){
    safe($('error'),e.message)
  }
};
reset();

// Recalcula medidas quando o navegador muda de monitor, largura ou zoom.
function fitVideoToStill(){
  const boss=$('boss'),team=$('teamBattery').getBoundingClientRect(),v=$('bossVideo');
  if(!team.height)return;
  // A medida alpha do primeiro quadro permanece fixa durante toda a animação.
  const bounds=bossVisibleBounds||{top:.135,bottom:.955};
  const innerHeight=Math.max(1,team.height-16);
  const visibleHeight=innerHeight*.70;
  const frameHeight=visibleHeight/(bounds.bottom-bounds.top);
  const frameWidth=frameHeight*((v.videoWidth&&v.videoHeight)?v.videoWidth/v.videoHeight:1);
  const centerOffset=(boss.getBoundingClientRect().width-frameWidth)*.5;
  boss.style.setProperty('--character-frame-left',centerOffset+'px');
  boss.style.setProperty('--character-frame-height',frameHeight+'px');
  boss.style.setProperty('--character-frame-width',frameWidth+'px');
  boss.style.setProperty('--character-frame-bottom',(8+(innerHeight-visibleHeight)*.5-innerHeight*.06-frameHeight*(1-bounds.bottom))+'px');
  positionStudentShot();
}
function positionStudentShot(){
  const arena=$('arena').getBoundingClientRect(),boss=$('boss').getBoundingClientRect(),team=$('teamBattery').getBoundingClientRect();
  const chestX=boss.left-arena.left+boss.width*.5;
  const chestY=boss.bottom-arena.top-8-(team.height-16)*.09-(team.height-16)*.70*.64;
  const originX=team.left-arena.left+team.width*.15;
  $('arena').style.setProperty('--student-shot-y',chestY+'px');
  $('arena').style.setProperty('--student-shot-x',chestX+'px');
  $('arena').style.setProperty('--student-shot-length',Math.max(20,originX-chestX)+'px');
}
$('bossVideo').onloadedmetadata=()=>{fitVideoToStill();if(!attackPending)stopBossVideo()};
function measureBossFirstFrame(){
  const v=$('bossVideo');
  if(bossVisibleBounds||v.currentTime>.1||!v.videoWidth||!v.videoHeight)return;
  try{
    const canvas=document.createElement('canvas');
    canvas.width=480;canvas.height=Math.round(480*v.videoHeight/v.videoWidth);
    const context=canvas.getContext('2d',{willReadFrequently:true});
    context.drawImage(v,0,0,canvas.width,canvas.height);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height).data;
    let top=canvas.height,bottom=-1;
    for(let y=0;y<canvas.height;y++){
      let count=0;
      for(let x=0;x<canvas.width;x++)if(pixels[(y*canvas.width+x)*4+3]>160)count++;
      if(count>=4){top=Math.min(top,y);bottom=y;}
    }
    if(bottom>top&&bottom-top<canvas.height*.98){
      bossVisibleBounds={top:top/canvas.height,bottom:(bottom+1)/canvas.height};
      fitVideoToStill();
    }
  }catch(error){console.warn('Não foi possível medir o primeiro quadro do chefe.',error);}
}
$('bossVideo').addEventListener('seeked',measureBossFirstFrame);
$('bossVideo').onloadeddata=()=>{measureBossFirstFrame();if(!attackPending&&!$('boss').classList.contains('video-active')){$('bossVideo').pause();$('bossVideo').currentTime=0}};
function fitSceneToViewport(force=false){
  if(!force&&(attackPending||$('boss').classList.contains('video-active')))return;
  const arena=$('arena'),boss=$('boss'),team=$('teamBattery');
  arena.style.minHeight='';boss.style.height='';boss.style.minHeight='';team.style.minHeight='';
  squadCards.forEach(card=>card.style.minHeight='');
  const rect=team.getBoundingClientRect();
  boss.style.setProperty('--team-battery-width',rect.width+'px');
  boss.style.setProperty('--team-battery-height',rect.height+'px');
  boss.style.height=rect.height+'px';
  fitVideoToStill();
}
if(typeof window!=='undefined'){
  let resizeFrame;
  window.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>fitSceneToViewport(true))});
  if(window.visualViewport)window.visualViewport.addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>fitSceneToViewport(true))});
  if(typeof ResizeObserver!=='undefined')new ResizeObserver(()=>fitSceneToViewport()).observe($('teamBattery'));
  requestAnimationFrame(()=>fitSceneToViewport());
}

// Mesmo mecanismo de tela cheia usado no Dilema do Bonde.
async function toggleFullscreen(){
  const root=document.documentElement;
  const active=document.fullscreenElement||document.webkitFullscreenElement;
  $('fullscreenNotice').textContent='';
  try{
    if(active){
      if(document.exitFullscreen)await document.exitFullscreen();
      else if(document.webkitExitFullscreen)await document.webkitExitFullscreen();
    }else{
      if(root.requestFullscreen)await root.requestFullscreen();
      else if(root.webkitRequestFullscreen)await root.webkitRequestFullscreen();
      else throw new Error('Tela cheia indisponível');
    }
  }catch(error){$('fullscreenNotice').textContent='Este navegador não permitiu abrir a tela cheia.';}
}
function updateFullscreenButton(){
  const active=!!(document.fullscreenElement||document.webkitFullscreenElement);
  const button=$('fullscreenButton');
  button.setAttribute('aria-pressed',String(active));
  button.setAttribute('aria-label',active?'Sair da tela cheia':'Tela cheia');
  button.title=active?'Sair da tela cheia (Esc)':'Tela cheia';
  requestAnimationFrame(()=>fitSceneToViewport(true));
}
$('fullscreenButton').addEventListener('click',toggleFullscreen);
document.addEventListener('fullscreenchange',updateFullscreenButton);
document.addEventListener('webkitfullscreenchange',updateFullscreenButton);

window.eitaGame={
  setRoster(roster){if(locked)return;entrants.splice(0,entrants.length,...roster.map(p=>({name:p.name,avatar:p.emoji})));avatarByName.clear();roster.forEach(p=>avatarByName.set(p.name,p.emoji));prepare();},
  isLocked:()=>locked,
  reset,
  animals:animalAvatars
};
