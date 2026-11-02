/* A abertura só baixa o vídeo quando alguém escolhe assisti-lo. */
(()=>{
 const overlay=document.getElementById('introOverlay'),video=document.getElementById('introVid');
 if(!overlay||!video)return;
 const play=document.getElementById('playIntro'),skip=document.getElementById('skipIntro');
 const background=[document.querySelector('header'),document.querySelector('main')].filter(Boolean);
 let closed=false;
 function hide(remember=true){
  if(closed)return;
  closed=true;
  if(remember)try{sessionStorage.setItem('eitaIntroSeen','1');}catch(_){}
  video.pause();
  video.removeAttribute('src');
  video.querySelectorAll('source').forEach(source=>source.removeAttribute('src'));
  video.load(); // cancela a transferência e libera o vídeo
  background.forEach(element=>element.inert=false);
  overlay.remove();
  document.getElementById('createRoom')?.focus();
 }
 let seen=false;
 try{seen=sessionStorage.getItem('eitaIntroSeen')==='1';}catch(_){}
 if(seen){hide(false);return;}
 background.forEach(element=>element.inert=true);
 skip.onclick=()=>hide();
 play.onclick=async()=>{
  play.disabled=true;
  const source=video.querySelector('source');
  if(!source.getAttribute('src')){source.src=source.dataset.src;video.load();}
  try{await video.play();if(!closed){play.hidden=true;skip.focus();}}
  catch(_){if(!closed){play.disabled=false;play.textContent='▶ Tentar assistir';}}
 };
 video.addEventListener('ended',()=>hide());
 video.addEventListener('error',()=>hide());
 overlay.addEventListener('keydown',event=>{
  if(event.key==='Escape'){event.preventDefault();hide();}
  if(event.key==='Tab'){
   const buttons=[play,skip].filter(button=>!button.hidden&&!button.disabled);
   if(buttons.length===1){event.preventDefault();buttons[0].focus();return;}
   if(event.shiftKey&&document.activeElement===buttons[0]){event.preventDefault();buttons.at(-1).focus();}
   else if(!event.shiftKey&&document.activeElement===buttons.at(-1)){event.preventDefault();buttons[0].focus();}
  }
 });
 skip.focus();
})();
