/* Diagnóstico local e agregado. Não armazena nomes, questões ou respostas. */
(()=>{
 const samples=[];
 const bytes=value=>new TextEncoder().encode(JSON.stringify(value)).length;
 function summary(){
  const successful=samples.filter(sample=>sample.ok),times=successful.map(sample=>sample.ms).sort((a,b)=>a-b);
  return {operations:samples.length,confirmed:successful.length,failed:samples.length-successful.length,
   meanMs:times.length?Math.round(times.reduce((sum,time)=>sum+time,0)/times.length):0,
   p95Ms:times.length?Math.round(times[Math.ceil(times.length*.95)-1]):0,
   estimatedJsonBytes:samples.reduce((sum,sample)=>sum+sample.bytes,0)};
 }
 function render(){
  const target=document.getElementById('connectionSummary');if(!target)return;
  const data=summary();
  target.textContent=data.operations?`${data.confirmed} ${data.confirmed===1?'atualização confirmada':'atualizações confirmadas'} · ${data.failed} ${data.failed===1?'falha':'falhas'} · média ${data.meanMs} ms · P95 ${data.p95Ms} ms · conteúdo estimado ${data.estimatedJsonBytes} bytes`:'Nenhuma atualização enviada nesta sessão.';
 }
 const api={
  async measure(operation,payload,send){
   const start=performance.now();let ok=false;
   try{const result=await send();ok=true;return result;}
   finally{samples.push({operation,ms:performance.now()-start,bytes:bytes(payload),ok});if(samples.length>500)samples.shift();render();}
  },
  summary,reset(){samples.length=0;render();}
 };
 window.EitaConnectionMetrics=api;
 function init(){
  const details=document.createElement('details');details.className='connection-diagnostics';
  const title=document.createElement('summary');title.textContent='Conexão da sala';
  const output=document.createElement('p');output.id='connectionSummary';output.setAttribute('aria-live','off');
  const note=document.createElement('p');note.className='step-note';note.textContent='Tempos de confirmação deste navegador. O tamanho é uma estimativa do conteúdo JSON, sem protocolo, downloads ou retransmissões. P95: 95% das confirmações levam até esse tempo.';
  const download=document.createElement('button');download.type='button';download.textContent='Baixar diagnóstico sem dados pessoais';
  download.onclick=()=>{
   const blob=new Blob([JSON.stringify({schema:1,scope:'este navegador',metrics:summary(),samples},null,2)],{type:'application/json'});
   const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='eita-conexao.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  };
  details.append(title,output,note,download);document.getElementById('menu-entrada').querySelector('.step-body').append(details);render();
 }
 if(document.readyState==='loading')addEventListener('DOMContentLoaded',init);else init();
})();
