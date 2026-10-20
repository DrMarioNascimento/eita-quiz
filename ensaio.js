/* Modo ensaio do Eita! (20/10/2026)
   Para experimentar o jogo sozinho, sem abrir sala e sem participantes de verdade.
   Cria participantes simulados que "respondem" sozinhos. Nada vai para o servidor:
   o ensaio substitui a sala online só enquanto estiver ligado. */
(()=>{
 const $=id=>document.getElementById(id);
 const NOMES=['Ana','Bruno','Carla','Davi','Elisa','Felipe','Gabi','Heitor','Isa','João','Lara','Miguel'];
 let ligado=false,real=null,pergunta=null,roster=[];

 // Cada rodada sorteia o "nível" do grupo, para que às vezes bata a meta e às vezes não.
 const fake={active:true,
  async begin(q){pergunta=q;},
  async finish(){
   const acerto=.35+Math.random()*.55,m=new Map();
   roster.forEach(p=>{
    if(Math.random()<.08)return; // alguns não respondem a tempo
    const certa=pergunta?.correct??0;
    m.set(p.name,Math.random()<acerto?certa:[0,1,2,3].filter(i=>i!==certa)[Math.floor(Math.random()*3)]);
   });
   return m;
  },
  result(){},pause(){},reset(){}
 };

 function montarRoster(n){
  const animais=(window.EITA_ANIMALS||[]).map(a=>a.id);
  roster=Array.from({length:n},(_,i)=>({name:NOMES[i%NOMES.length]+(i>=NOMES.length?' '+(Math.floor(i/NOMES.length)+1):'')+' · ens'+i,emoji:animais[(i*5)%animais.length]}));
 }

 function ligar(){
  if(ligado||window.eitaOnline?.active){aviso('Encerre a sala antes de usar o ensaio.');return;}
  if(window.eitaGame?.isLocked())return;
  real=window.eitaOnline;window.eitaOnline=fake;ligado=true;
  montarRoster(Math.max(2,Math.min(30,Number($('rehearsalSize').value)||12)));
  window.eitaGame.reset();window.eitaGame.setRoster(roster);
  $('createRoom').disabled=true;$('startRehearsal').hidden=true;$('rehearsalSize').disabled=true;$('stopRehearsal').hidden=false;
  document.querySelector('header small').textContent='Modo ensaio · respostas simuladas';
  aviso(`Ensaio com ${roster.length} participantes simulados. Vá em Controle da partida e clique em Iniciar.`);
 }
 function desligar(){
  if(!ligado)return;
  window.eitaOnline=real;ligado=false;roster=[];
  window.eitaGame.setRoster([]);window.eitaGame.reset();
  $('createRoom').disabled=false;$('startRehearsal').hidden=false;$('rehearsalSize').disabled=false;$('stopRehearsal').hidden=true;
  document.querySelector('header small').textContent='Abra uma sala para começar';
  aviso('Ensaio encerrado.');
 }
 function aviso(t){const p=$('rehearsalNotice');if(p)p.textContent=t;}

 function iniciar(){
  if(!$('startRehearsal'))return;
  $('startRehearsal').onclick=ligar;
  $('stopRehearsal').onclick=()=>{if(window.eitaGame?.isLocked()&&!confirmarSaida())return;desligar();};
 }
 // durante a partida, sair do ensaio reinicia o jogo; o botão Reiniciar já faz isso sem perguntar
 function confirmarSaida(){window.eitaGame.reset();return true;}
 window.eitaEnsaio={ativo:()=>ligado};
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
