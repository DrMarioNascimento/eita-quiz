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
  const ensaio=!!window.eitaEnsaio?.ativo();
  set('sub-entrada',ensaio?'Simulação com participantes simulados':open?['Sala '+code,roster].filter(Boolean).join(' · '):'Sala online ou simulação');
  badge('sub-entradaBadge',ensaio?'simulação':open?'aberta':'',ensaio?'live':open?'ok':'');
  const r=$('rehearsal');if(r)r.hidden=open;

  const mode=$('mode');
  // 08/11/2026: textos fixos que descrevem o bloco (antes mostravam o resumo da escolha atual)
  set('sub-montagem','Modo de jogo: Individual Cooperativo, tipo de Esquadrões');

  set('sub-config','Quantidade de perguntas, meta de acerto e avanço');

  const pause=$('pause');pause.dataset.icon=/continuar/i.test(pause.textContent)?'play':'pause';
  const playing=!$('pause').disabled;
  set('sub-controle',playing?'Partida em andamento':$('start').textContent.trim());
  badge('sub-controleBadge',playing?'em jogo':'',playing?'live':'');
  if(playing&&!wasPlaying){const c=$('menu-controle');if(c&&!c.open)c.open=true;}
  wasPlaying=playing;

  set('sub-regras','Golpe, dano e morte súbita');
  set('sub-manual','Guia completo em PDF · v1.4');
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
