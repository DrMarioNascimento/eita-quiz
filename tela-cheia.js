/* Tela cheia de fato (Eita!).
   Em tela cheia (botão do jogo ou F11): fica só a barra superior (Eita!) e a área
   central (pergunta, chefe e alunos); o menu e o resto somem.
   Ao mexer o mouse (ou tocar), reaparece só o console "Controle da partida",
   no espaço livre da barra superior (entre a marca e os botões da direita),
   para nunca cobrir a pergunta, o chefão ou o grupo.
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
  root.classList.remove('eita-fs','eita-fs-active','eita-fs-estreita');
  root.style.removeProperty('--fs-aside-x');
  if(exitBtn){exitBtn.textContent='Sair da tela cheia';exitBtn.title=exitBtn.textContent;exitBtn.setAttribute('aria-label',exitBtn.textContent);}
 }

 /* Centraliza o console no espaço livre da barra superior. */
 function fit(){
  const c=card();if(!c||!on)return;
  const header=document.querySelector('header');
  if(header)root.style.setProperty('--fs-aside-top',header.getBoundingClientRect().bottom+'px');
  const brand=document.querySelector('header .brand'),acts=document.querySelector('header .header-actions');
  if(brand&&acts){
   const l=brand.getBoundingClientRect().right;
   /* borda esquerda do primeiro item visível à direita (ignora itens ocultos ou vazios) */
   const vis=[...acts.children].map(e=>e.getBoundingClientRect()).filter(b=>b.width>0&&b.height>0);
   const r=vis.length?Math.min(...vis.map(b=>b.left)):acts.getBoundingClientRect().left;
   /* tela estreita: se o console não couber no vão, esconde o slogan e o aviso da direita */
   const cw=c.getBoundingClientRect().width||300;
   root.classList.toggle('eita-fs-estreita',r-l<cw+24);
   if(root.classList.contains('eita-fs-estreita')){
    const h1=brand.querySelector('h1')?.getBoundingClientRect().right??l;
    const btn=document.getElementById('fullscreenButton')?.getBoundingClientRect().left??r;
    root.style.setProperty('--fs-aside-x',((h1+btn)/2)+'px');
   } else root.style.setProperty('--fs-aside-x',((l+r)/2)+'px');
  }
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

