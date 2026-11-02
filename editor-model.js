/* Validação comum ao formulário e à entrada avançada. Sem acesso à rede. */
(()=>{
 const limits={q:200,answer:90,explain:320,source:100,theme:60};
 function validate(item,index=0){
  const prefix=`Pergunta ${index+1}: `;
  const text=(value,max,label,required=true)=>{
   const result=String(value??'').trim();
   if(required&&!result)throw new Error(prefix+'preencha '+label+'.');
   if(result.length>max)throw new Error(prefix+label+' deve ter até '+max+' caracteres.');
   return result;
  };
  const q=text(item.q,limits.q,'o enunciado');
  if(!Array.isArray(item.a)||item.a.length!==4)throw new Error(prefix+'informe quatro alternativas.');
  const a=item.a.map((value,i)=>text(value,limits.answer,'a alternativa '+'ABCD'[i]));
  if(new Set(a.map(value=>value.toLocaleLowerCase('pt-BR').replace(/\s+/g,' '))).size!==4)throw new Error(prefix+'as alternativas devem ser diferentes.');
  if(!Number.isInteger(item.correct)||item.correct<0||item.correct>3)throw new Error(prefix+'escolha a alternativa correta.');
  const time=Number(item.time);
  if(!Number.isInteger(time)||time<5||time>300)throw new Error(prefix+'o tempo deve ser um número inteiro de 5 a 300 segundos.');
  return {...item,q,a,time,explain:text(item.explain,limits.explain,'a explicação',false),source:text(item.source,limits.source,'a fonte',false),theme:text(item.theme,limits.theme,'o tema',false)||'Sem tema'};
 }
 function validateBank(items){
  if(!Array.isArray(items)||!items.length)throw new Error('Deixe pelo menos uma pergunta no banco.');
  if(items.length>500)throw new Error('Use até 500 perguntas por banco.');
  return items.map(validate);
 }
 function parseLegacy(text){
  return validateBank(text.split(/^---\s*$/m).filter(block=>block.trim()).map((block,index)=>{
   const lines=block.trim().split('\n').map(line=>line.trim());
   if(lines.length<7)throw new Error(`Pergunta ${index+1}: use enunciado, quatro alternativas, correta de 1 a 4, tempo e explicação opcional.`);
   const correct=Number(lines[5])-1;
   return {id:'texto-'+index,q:lines[0],a:lines.slice(1,5),correct,time:Number(lines[6]),explain:lines.slice(7).join(' ')};
  }));
 }
 function toLegacy(items){return items.map(item=>[item.q,...item.a,item.correct+1,item.time,item.explain||''].map(value=>String(value).replace(/\s+/g,' ').trim()).join('\n')).join('\n---\n');}
 window.EitaEditorModel={limits,validate,validateBank,parseLegacy,toLegacy};
})();
