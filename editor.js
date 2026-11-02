(()=>{
 const $=id=>document.getElementById(id),model=window.EitaEditorModel;
 const ids=['questionText','answerA','answerB','answerC','answerD','correctAnswer','answerTime','answerExplain','answerTheme','answerSource'];
 let draft=[],cursor=0,deleted=null;
 const copy=items=>items.map(item=>({...item,a:[...item.a]}));
 function showError(error){$('error').textContent=error.message||String(error);}
 function read(validate=true){
  const item={...draft[cursor],q:$('questionText').value,a:['answerA','answerB','answerC','answerD'].map(id=>$(id).value),correct:$('correctAnswer').value===''?null:Number($('correctAnswer').value),time:Number($('answerTime').value),explain:$('answerExplain').value,theme:$('answerTheme').value,source:$('answerSource').value};
  // Fonte passa a ser um campo explícito, editável pelo professor.
  delete item.sourcePage;
  return validate?model.validate(item,cursor):item;
 }
 function saveCurrent(){try{draft[cursor]=read();$('error').textContent='';return true;}catch(error){showError(error);return false;}}
 function refresh(){
  $('questionPicker').replaceChildren();
  draft.forEach((item,i)=>{const option=document.createElement('option');option.value=i;option.textContent=(i+1)+'. '+(item.q||'Nova pergunta').slice(0,65);$('questionPicker').append(option);});
  $('questionPicker').value=cursor;
  const item=draft[cursor];
  $('questionText').value=item.q||'';
  ['answerA','answerB','answerC','answerD'].forEach((id,i)=>$(id).value=item.a[i]||'');
  $('correctAnswer').value=Number.isInteger(item.correct)?String(item.correct):'';
  $('answerTime').value=item.time||25;$('answerExplain').value=item.explain||'';
  $('answerTheme').value=item.theme||item.topic||'Sem tema';
  $('answerSource').value=item.source||(item.sourcePage?'Cardio.pdf, página '+item.sourcePage:'');
  $('editorPosition').textContent=`Pergunta ${cursor+1} de ${draft.length}`;
  $('previousQuestion').disabled=cursor===0;$('nextQuestion').disabled=cursor===draft.length-1;
  $('deleteQuestion').disabled=draft.length===1;$('undoQuestion').hidden=!deleted;
  $('quizText').value=model.toLegacy(draft);
 }
 function move(to){if(saveCurrent()){cursor=to;refresh();$('questionText').focus();}else $('questionPicker').value=cursor;}
 $('edit').onclick=()=>{
  if(!window.eitaTeacherAuthorized||window.eitaGame.isLocked())return;
  draft=copy(window.eitaSheet?.getBank()||window.eitaGame.getBank());cursor=0;deleted=null;
  $('error').textContent='';$('advancedEditor').open=false;refresh();$('editor').showModal();$('questionPicker').focus();
 };
 $('questionPicker').onchange=()=>move(Number($('questionPicker').value));
 $('previousQuestion').onclick=()=>move(cursor-1);$('nextQuestion').onclick=()=>move(cursor+1);
 $('addQuestion').onclick=()=>{
  if(!saveCurrent())return;
  if(draft.length>=500){showError('Use até 500 perguntas por banco.');return;}
  draft.push({id:crypto.randomUUID(),q:'',a:['','','',''],correct:null,time:25,theme:draft[cursor].theme||'Sem tema',explain:'',source:''});
  cursor=draft.length-1;refresh();$('questionText').focus();
 };
 $('deleteQuestion').onclick=()=>{
  if(draft.length===1)return;
  deleted={item:read(false),index:cursor};draft.splice(cursor,1);cursor=Math.min(cursor,draft.length-1);$('error').textContent='';refresh();
 };
 $('undoQuestion').onclick=()=>{
  if(!deleted||!saveCurrent())return;
  draft.splice(deleted.index,0,deleted.item);cursor=deleted.index;deleted=null;refresh();
 };
 $('importEditorText').onclick=()=>{
  try{draft=model.parseLegacy($('quizText').value);cursor=0;deleted=null;refresh();$('error').textContent='Texto carregado no formulário. Confira os campos e aplique as alterações.';}
  catch(error){showError(error);}
 };
 $('cancel').onclick=()=>$('editor').close();
 $('editorForm').onsubmit=event=>{
  event.preventDefault();
  if(!window.eitaTeacherAuthorized||window.eitaGame.isLocked()||!saveCurrent())return;
  try{
   const items=model.validateBank(draft);
   const applied=window.eitaSheet?window.eitaSheet.replaceBank(items):window.eitaGame.setBank(items,'Banco editado');
   if(applied===false)throw new Error('Reinicie a partida antes de editar o banco.');
   $('editor').close();$('edit').focus();
  }catch(error){showError(error);}
 };
 // Um erro deixa o foco no primeiro campo inválido, sem depender só da cor.
 ids.forEach(id=>$(id).addEventListener('invalid',()=>{$('error').textContent='Confira os campos indicados antes de aplicar as alterações.';}));
})();
