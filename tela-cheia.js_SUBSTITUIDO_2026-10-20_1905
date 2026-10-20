/* Tela cheia de fato (Eita!).
   Em tela cheia (botão do jogo ou F11): fica só a barra superior (Eita!) e a área
   central (pergunta, chefe e alunos); o menu e o resto somem.
   Ao mexer o mouse (ou tocar), reaparece só o cartão "Controle da partida",
   à esquerda, na mesma posição em que fica no menu.
   Parou de mexer: o cartão e o cursor somem de novo.
   Ao sair da tela cheia (botão no cartão ou Esc), o menu completo volta. */
(()=>{
 const $=id=>document.getElementById(id);
 const HIDE_MS=2500;
 const root=document.documentElement;
 let timer=0,on=false,exitBtn=null,wasOpen=false;

 const apiFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
 /* F11 não aciona a API de tela cheia: reconhece pela janela ocupando a tela inteira. */
 const f11=()=>Math.abs(innerHeight-screen.height)<=2&&Math.abs(innerWidth-screen.width)<=2;
 const isFs=()=>apiFs()||f11();
 const card=()=>$('menu-controle');

 function ensureExit(){
  if(exitBtn)return;
  const body=card()?.querySelector('.step-body');if(!body)return;
  exitBtn=document.createElement('button');
  exitBtn.type='button';exitBtn.className='fs-exit capsule-btn';exitBtn.textContent='Sair da tela cheia';
  exitBtn.title='Sair da tela cheia';exitBtn.setAttribute('aria-label','Sair da tela cheia');
  exitBtn.dataset.shortLabel='Sair';
  exitBtn.addEventListener('click',()=>{
   if(apiFs())(document.exitFullscreen||document.webkitExitFullscreen).call(document);
   else {exitBtn.textContent='Pressione F11 para sair';exitBtn.title=exitBtn.textContent;exitBtn.setAttribute('aria-label',exitBtn.textContent);}
  });
  (body.querySelector('.control-capsule')||body).append(exitBtn);
 }

 function enter(){
  if(on)return;on=true;
  const header=document.querySelector('header');
  root.style.setProperty('--fs-aside-top',(header?header.getBoundingClientRect().bottom:0)+'px');
  ensureExit();
  const c=card();if(c){wasOpen=c.open;c.open=true;}
  root.classList.add('eita-fs');
  requestAnimationFrame(()=>requestAnimationFrame(fit));
  wake();
 }

 function leave(){
  if(!on)return;on=false;
  clearTimeout(timer);
  const c=card();if(c&&!wasOpen)c.open=false;
  root.classList.remove('eita-fs','eita-fs-active');
  c?.style.removeProperty('--fs-shift');
  if(exitBtn){exitBtn.textContent='Sair da tela cheia';exitBtn.title=exitBtn.textContent;exitBtn.setAttribute('aria-label',exitBtn.textContent);}
 }

 /* Mesma posição do menu; se o cartão não couber na tela, sobe só o necessário. */
 function fit(){
  const c=card();if(!c||!on)return;
  c.style.removeProperty('--fs-shift');
  const over=c.getBoundingClientRect().bottom-(window.innerHeight-12);
  if(over>0)c.style.setProperty('--fs-shift',(-over)+'px');
 }

 function wake(){
  if(!on)return;
  root.classList.add('eita-fs-active');
  clearTimeout(timer);
  timer=setTimeout(()=>{
   if(card()?.matches(':hover'))return wake();
   root.classList.remove('eita-fs-active');
  },HIDE_MS);
 }

 function sync(){isFs()?enter():leave();}
 document.addEventListener('fullscreenchange',sync);
 document.addEventListener('webkitfullscreenchange',sync);
 addEventListener('resize',()=>{sync();if(on)fit();});
 document.addEventListener('click',()=>{if(on)setTimeout(fit,0);});
 /* Em tela cheia o cartão fica sempre aberto: clicar no título não o fecha. */
 document.addEventListener('click',e=>{if(on&&e.target.closest('#menu-controle>summary'))e.preventDefault();},true);
 ['mousemove','pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,wake,{passive:true}));
})();

