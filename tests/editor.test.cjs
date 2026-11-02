const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('editor-model.js','utf8'),context);const model=context.window.EitaEditorModel;
const base={id:'um',q:'Qual é o mecanismo?',a:['Uma opção','Outra opção','Terceira opção','Quarta opção'],correct:2,time:25,explain:'Explicação',source:'Material docente',theme:'Vasos'};
test('validação preserva identidade, fonte, tema e enunciado com mais de uma linha',()=>{
 const item=model.validate({...base,q:'Primeira linha\nSegunda linha'});assert.equal(item.id,'um');assert.equal(item.theme,'Vasos');assert.equal(item.source,'Material docente');assert.match(item.q,/\n/);
});
test('campos incompletos, alternativas repetidas e tempo inválido são recusados',()=>{
 for(const invalid of [{q:''},{a:['A',' a ','C','D']},{a:['A','B','C']},{correct:null},{time:4},{time:301},{time:5.5},{source:'x'.repeat(101)}])assert.throws(()=>model.validate({...base,...invalid}));
});
test('erro indica qual pergunta precisa de correção',()=>{
 assert.throws(()=>model.validateBank([base,{...base,q:''}]),/Pergunta 2/);
});
test('formato avançado mantém gabarito e tempo e recusa bancos vazios',()=>{
 const restored=model.parseLegacy(model.toLegacy([base]));assert.equal(restored[0].correct,2);assert.equal(restored[0].time,25);assert.throws(()=>model.parseLegacy(''),/pelo menos/);
});
test('as 45 questões de demonstração são válidas e têm alternativas distintas',()=>{
 const bankContext={window:{}};vm.runInNewContext(fs.readFileSync('cardio-bank.js','utf8'),bankContext);
 const bank=model.validateBank(bankContext.window.CARDIO_BANK);assert.equal(bank.length,45);assert.equal(new Set(bank.map(item=>item.id)).size,45);
});
