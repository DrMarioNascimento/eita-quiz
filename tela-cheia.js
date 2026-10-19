/* Tela cheia de fato (Eita!).
   Em tela cheia: somem o menu e o cabeçalho; a arena ocupa a tela toda.
   Ao mexer o mouse (ou tocar), reaparece só o cartão "Controle da partida",
   à esquerda, na mesma posição em que fica no menu.
   Parou de mexer: o cartão e o cursor somem de novo.
   Ao sair da tela cheia (botão no cartão ou Esc), o menu completo volta. */
(()=>{
 const $=id=>document.getElementById(id);
 const HIDE_MS=2500;
 const root=document.documentElement;
 let timer=0,on=false,exitBtn=null,wasOpen=false;

 const isFs=()=>!!(document.fullscreenElement||document.webkitFullscreenElement);
 const card=()=>$('menu-controle');

 function ensureExit(){
  if(exitBtn)return;
  const body=card()?.querySelector('.step-body');if(!body)return;
  exitBtn=document.createElement('button');
  exitBtn.type='button';exitBtn.className='fs-exit';exitBtn.textContent='Sair da tela cheia';
  exitBtn.addEventListener('click',()=>{(document.exitFullscreen||document.webkitExitFullscreen).call(document);});
  body.append(exitBtn);
 }

 function enter(){
  if(on)return;on=true;
  const header=document.querySelector('header');
  root.style.setProperty('--fs-aside-top',(header?header.offsetHeight:0)+'px');
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
 addEventListener('resize',()=>{if(on)fit();});
 document.addEventListener('click',()=>{if(on)setTimeout(fit,0);});
 ['mousemove','pointerdown','touchstart','keydown'].forEach(ev=>document.addEventListener(ev,wake,{passive:true}));
})();
