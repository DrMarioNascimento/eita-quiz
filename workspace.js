/* Alterna somente a apresentação; sala, perguntas, placar e tempo ficam no motor existente. */
(function(){
 const prepare=document.getElementById('viewPrepare'),battle=document.getElementById('viewBattle'),controls=document.getElementById('menu-controle');
 if(!prepare||!battle||!controls)return;
 const panels=[...document.querySelectorAll('main>aside>details')];let previous=[],view='preparar';
 function setView(next){
  if(next===view)return;
  if(next==='batalha'){
   previous=panels.filter(panel=>panel.open);panels.forEach(panel=>panel.open=false);controls.open=true;
  }else{
   panels.forEach(panel=>panel.open=false);previous.forEach(panel=>panel.open=true);
  }
  view=next;document.body.dataset.workspace=view;
  prepare.setAttribute('aria-pressed',String(view==='preparar'));battle.setAttribute('aria-pressed',String(view==='batalha'));
  window.dispatchEvent(new Event('resize'));
 }
 prepare.addEventListener('click',()=>setView('preparar'));
 battle.addEventListener('click',()=>setView('batalha'));
 document.body.dataset.workspace=view;
 window.eitaWorkspace={battle:()=>setView('batalha'),prepare:()=>setView('preparar')};
})();
