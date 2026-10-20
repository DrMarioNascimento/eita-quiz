/* Menu esquerdo do Eita!: resumo e estado de cada bloco.
   Só lê o que já está na tela (não altera a lógica do jogo).
   Quando uma partida começa, abre "Controle da partida". */
(()=>{
 const $=id=>document.getElementById(id);
 const set=(id,text)=>{const el=$(id);if(el&&el.textContent!==text)el.textContent=text;};
 const badge=(id,text,kind)=>{const el=$(id);if(!el)return;el.hidden=!text;el.textContent=text||'';el.dataset.kind=kind||'';};
 let wasPlaying=false;
 function update(){
  const open=!$('roomDetails').hidden;
  const code=($('roomCode').textContent||'').replace(/^C[óo]digo:\s*/,'');
  const roster=$('roomRoster').textContent.trim();
  set('sub-entrada',open?['Sala '+code,roster].filter(Boolean).join(' · '):'Sala online');
  badge('sub-entradaBadge',open?'aberta':'',open?'ok':'');

  const mode=$('mode');
  set('sub-montagem',mode.value==='individual'?'Individual cooperativo':'Esquadrões de '+$('size').value+' · '+(mode.value==='own'?'vida por esquadrão':'vida compartilhada'));

  const n=+$('questionCount').value||0;
  const g=$('goal')?.value||'50';
  set('sub-config',n+(n===1?' pergunta':' perguntas')+' · meta '+(g==='50'?'>50%':g+'%')+' · '+($('advanceMode').value==='manual'?'manual':'automático'));

  const pause=$('pause');pause.dataset.icon=/continuar/i.test(pause.textContent)?'play':'pause';
  const playing=!$('pause').disabled;
  set('sub-controle',playing?'Partida em andamento':$('start').textContent.trim());
  badge('sub-controleBadge',playing?'em jogo':'',playing?'live':'');
  if(playing&&!wasPlaying){const c=$('menu-controle');if(c&&!c.open)c.open=true;}
  wasPlaying=playing;

  set('sub-regras','Golpe, dano e morte súbita');
  set('sub-manual','Em construção');
  set('sub-banco',($('bankSummary').textContent||'').split('·')[0].trim());
 }
 function start(){
  update();
  document.addEventListener('input',update);
  document.addEventListener('change',update);
  document.addEventListener('click',()=>setTimeout(update,0));
  setInterval(update,1000);
 }
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',start);else start();
})();
