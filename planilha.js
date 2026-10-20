/* Banco de questões do Eita! a partir de uma planilha (.xlsx).
   20/10/2026 — testes públicos.
   A planilha é lida aqui no navegador e fica só na memória desta aba:
   nada é enviado ao servidor nem gravado (sem localStorage). Fechou a aba, o banco some.
   O banco Cardiovascular embutido continua como demonstração. */
(()=>{
 const $=id=>document.getElementById(id);
 const DEMO='Cardiovascular (demonstração)';
 // Link da planilha-modelo no Google Planilhas (compartilhada como "qualquer pessoa com o link: leitor").
 // Vazio = o botão do Google fica escondido. O app troca /edit por /copy para abrir "Fazer uma cópia".
 const MODELO_GOOGLE='';
 // recomendado / máximo — os mesmos da planilha-modelo
 const LIMITES={enunciado:[140,200,'Enunciado'],alternativa:[60,90,'Alternativa'],explicacao:[220,320,'Explicação'],fonte:[60,100,'Fonte']};
 const COLUNAS={tema:['tema'],enunciado:['enunciado','pergunta'],A:['a'],B:['b'],C:['c'],D:['d'],correta:['correta','resposta','gabarito'],tempo:['tempo'],explicacao:['explicacao'],fonte:['fonte'],ativa:['ativa']};
 const norm=v=>String(v??'').normalize('NFD').replace(/[̀-ͯ]/g,'').trim().toLowerCase();
 const texto=v=>String(v??'').replace(/\s+/g,' ').trim();

 let banco=[],temas=[],marcados=new Set(),nomeBanco='',origem='demo';
 // 20/10/2026: a planilha fica no armazenamento desta aba (sessionStorage): resiste a recarregar a página,
 // é apagada pelo navegador ao fechar a aba e nunca sai do computador.
 const CHAVE='eita-planilha-sessao';
 function guardar(){try{if(origem==='planilha')sessionStorage.setItem(CHAVE,JSON.stringify({banco,nomeBanco,marcados:[...marcados]}));else sessionStorage.removeItem(CHAVE);}catch(e){}}
 function recuperar(){try{const d=JSON.parse(sessionStorage.getItem(CHAVE)||'null');if(!d||!Array.isArray(d.banco)||!d.banco.length)return false;banco=d.banco;nomeBanco=d.nomeBanco||'';temas=agrupar(banco);const ok=new Set(temas.map(t=>t.key));marcados=new Set((d.marcados||[]).filter(k=>ok.has(k)));if(!marcados.size)marcados=ok;origem='planilha';return true;}catch(e){return false;}}

 function carregarXlsx(){
  if(window.XLSX)return Promise.resolve(window.XLSX);
  return new Promise((ok,falha)=>{const s=document.createElement('script');s.src='assets/vendor/xlsx.mini.min.js';s.onload=()=>ok(window.XLSX);s.onerror=()=>falha(new Error('Não foi possível carregar o leitor de planilhas. Confira a internet.'));document.head.append(s);});
 }

 function lerPlanilha(XLSX,buffer){
  const wb=XLSX.read(buffer,{type:'array'});
  const nomeAba=wb.SheetNames.find(n=>norm(n)==='perguntas')||wb.SheetNames[0];
  const linhas=XLSX.utils.sheet_to_json(wb.Sheets[nomeAba],{header:1,raw:false,defval:'',blankrows:true});
  // cabeçalho: a primeira linha (entre as 6 primeiras) que tenha "enunciado"
  const h=linhas.slice(0,6).findIndex(l=>l.some(c=>COLUNAS.enunciado.includes(norm(c))));
  if(h<0)throw new Error('Não encontrei o cabeçalho (tema, enunciado, A, B, C, D, correta…). Use a planilha-modelo do Eita!.');
  const col={};
  linhas[h].forEach((c,i)=>{const n=norm(c);for(const k in COLUNAS)if(col[k]===undefined&&COLUNAS[k].includes(n))col[k]=i;});
  const faltam=['enunciado','A','B','C','D','correta'].filter(k=>col[k]===undefined);
  if(faltam.length)throw new Error('Faltam colunas no cabeçalho: '+faltam.join(', ')+'.');
  // aba Banco (opcional): nome do banco e tempo padrão
  let padrao=25;nomeBanco='';
  const abaBanco=wb.SheetNames.find(n=>norm(n)==='banco');
  if(abaBanco){
   XLSX.utils.sheet_to_json(wb.Sheets[abaBanco],{header:1,raw:false,defval:''}).forEach(l=>{
    const r=norm(l[0]),v=texto(l[1]);if(!v)return;
    if(r.includes('tempo')){const t=Number(v.replace(',','.'));if(Number.isFinite(t)&&t>=5&&t<=300)padrao=Math.round(t);}
    else if(r.includes('nome'))nomeBanco=v;
   });
  }
  const erros=[],avisos=[],itens=[];let inativas=0;
  const pega=(l,k)=>col[k]===undefined?'':texto(l[col[k]]);
  const medir=(linha,campo,valor,qual)=>{
   const [rec,max,nome]=LIMITES[campo];
   if(valor.length>max)erros.push(`Linha ${linha}: ${qual||nome} com ${valor.length} caracteres (máximo ${max}).`);
   else if(valor.length>rec)avisos.push(linha);
  };
  for(let i=h+1;i<linhas.length;i++){
   const l=linhas[i],n=i+1;
   const campos=Object.keys(COLUNAS).map(k=>pega(l,k));
   if(campos.every(v=>!v))continue;
   if(['nao','n','no'].includes(norm(pega(l,'ativa')))){inativas++;continue;}
   const q=pega(l,'enunciado'),a=['A','B','C','D'].map(k=>pega(l,k)),problemas=[];
   if(!q)problemas.push('falta o enunciado');
   const vazias=['A','B','C','D'].filter((k,j)=>!a[j]);
   if(vazias.length)problemas.push('falta a alternativa '+vazias.join(', '));
   const letra=norm(pega(l,'correta')).toUpperCase(),correct='ABCD'.indexOf(letra);
   if(letra.length!==1||correct<0)problemas.push('em "correta" escreva A, B, C ou D');
   const tt=pega(l,'tempo');let time=padrao;
   if(tt){time=Math.round(Number(tt.replace(',','.')));if(!Number.isFinite(time)||time<5||time>300)problemas.push('tempo deve ser de 5 a 300 segundos (ou vazio)');}
   if(problemas.length){erros.push(`Linha ${n}: ${problemas.join('; ')}.`);continue;}
   const explain=pega(l,'explicacao'),source=pega(l,'fonte');
   medir(n,'enunciado',q);a.forEach((x,j)=>medir(n,'alternativa',x,'Alternativa '+'ABCD'[j]));
   if(explain)medir(n,'explicacao',explain);if(source)medir(n,'fonte',source);
   const tema=pega(l,'tema')||'Sem tema';
   itens.push({id:'linha-'+n,theme:tema,q,a,correct,time,explain,source});
  }
  if(!erros.length&&!itens.length)throw new Error('A planilha não tem perguntas ativas a partir da linha '+(h+2)+'.');
  return {itens,erros,avisos:[...new Set(avisos)],inativas,aba:nomeAba};
 }

 // temas sem diferenciar maiúsculas/acentos; mostra a primeira grafia encontrada
 function agrupar(itens){
  const mapa=new Map();
  itens.forEach(it=>{const k=norm(it.theme);if(!mapa.has(k))mapa.set(k,{key:k,nome:it.theme,n:0});mapa.get(k).n++;it.themeKey=k;});
  return [...mapa.values()];
 }

 function aplicar(){
  const pool=banco.filter(it=>marcados.has(it.themeKey));
  const sel=temas.filter(t=>marcados.has(t.key));
  const rotulo=sel.length===1?sel[0].nome.replace(/ \(demonstração\)$/,''):(nomeBanco||sel.length+' temas');
  return window.eitaGame?.setBank(pool,rotulo);
 }

 function desenharTemas(){
  const box=$('bankThemes');box.replaceChildren();
  temas.forEach(t=>{
   const lab=document.createElement('label');lab.className='bank-theme';
   const cb=document.createElement('input');cb.type='checkbox';cb.checked=marcados.has(t.key);
   cb.onchange=()=>{
    if(window.eitaGame?.isLocked()){cb.checked=!cb.checked;relatar('Termine ou reinicie a partida antes de trocar o tema.');return;}
    if(cb.checked)marcados.add(t.key);else marcados.delete(t.key);
    if(!marcados.size){marcados.add(t.key);cb.checked=true;relatar('Deixe pelo menos um tema marcado.');return;}
    aplicar();guardar();
   };
   const nome=document.createElement('span');nome.textContent=t.nome;
   const n=document.createElement('small');n.textContent=t.n;
   lab.append(cb,nome,n);box.append(lab);
  });
  $('bankThemesTitle').hidden=temas.length<2;
  $('demoBank').hidden=origem==='demo'||!window.CARDIO_BANK;
 }

 function relatar(msg,tipo){const p=$('sheetReport');p.textContent=msg;p.dataset.kind=tipo||'';}

 function usarDemo(inicial){
  if(window.eitaGame?.isLocked()){relatar('Termine ou reinicie a partida antes de trocar o banco.');return;}
  const demo=(window.CARDIO_BANK||[]).map(it=>({...it,theme:DEMO}));
  banco=demo;temas=agrupar(banco);marcados=new Set(temas.map(t=>t.key));nomeBanco='';origem='demo';guardar();
  desenharTemas();
  if(banco.length&&!inicial)aplicar();
 }

 async function importar(arquivo){
  if(window.eitaGame?.isLocked()){relatar('Termine ou reinicie a partida antes de importar.','erro');return;}
  relatar('Lendo a planilha…');
  try{
   const XLSX=await carregarXlsx();
   const r=lerPlanilha(XLSX,await arquivo.arrayBuffer());
   if(r.erros.length){
    const lista=r.erros.slice(0,8).join('\n')+(r.erros.length>8?`\n… e mais ${r.erros.length-8}.`:'');
    relatar('A planilha não foi carregada. Corrija e importe de novo:\n'+lista,'erro');return;
   }
   banco=r.itens;temas=agrupar(banco);marcados=new Set(temas.map(t=>t.key));origem='planilha';
   desenharTemas();
   if(aplicar()===false){relatar('Termine ou reinicie a partida antes de importar.','erro');return;}
   guardar();
   let msg=`Planilha carregada: ${banco.length} ${banco.length===1?'pergunta':'perguntas'} em ${temas.length} ${temas.length===1?'tema':'temas'}.`;
   if(r.inativas)msg+=` ${r.inativas} inativa(s) ignorada(s).`;
   if(r.avisos.length)msg+=`\nTexto acima do recomendado (pode ficar apertado na TV/celular): linha ${r.avisos.slice(0,10).join(', ')}${r.avisos.length>10?'…':''}.`;
   relatar(msg,r.avisos.length?'aviso':'ok');
  }catch(e){console.error(e);relatar(e.message||'Não foi possível ler este arquivo. Salve como .xlsx e tente de novo.','erro');}
 }

 function iniciar(){
  if(!$('importSheet'))return;
  if(MODELO_GOOGLE){const url=MODELO_GOOGLE.replace(/\/(edit|view|copy).*$/,'')+'/copy';document.querySelectorAll('.google-modelo').forEach(l=>{l.href=url;l.hidden=false;});}
  $('importSheet').onclick=()=>{$('sheetFile').value='';$('sheetFile').click();};
  $('sheetFile').onchange=()=>{const f=$('sheetFile').files[0];if(f)importar(f);$('sheetFile').value='';};
  $('demoBank').onclick=()=>{usarDemo();relatar('Planilha descartada. Voltou ao banco de demonstração.');};
  if(recuperar()){desenharTemas();aplicar();relatar(`Planilha mantida desta sessão: ${banco.length} ${banco.length===1?'pergunta':'perguntas'} em ${temas.length} ${temas.length===1?'tema':'temas'}.`,'ok');}
  else usarDemo(true);
 }
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',iniciar);else iniciar();
})();
