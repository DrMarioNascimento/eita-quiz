const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const script=fs.readFileSync(new URL('../student.js',`file://${__filename}`),'utf8').replace(/^import .*;\n/,'');
function element(){
 const classes=new Set();
 return {children:[],textContent:'',value:'',hidden:false,disabled:false,dataset:{},attributes:{},classList:{add:v=>classes.add(v),contains:v=>classes.has(v)},
 append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},querySelectorAll(){return this.children;},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k]??null;},focus(){}};
}
function setup({answerFails=false,cacheFirst=false}={}){
 const nodes=new Map(),events={},timers=new Map();let listener,unsubscribed=0,reads=0,writes=[],timerSeq=0,answerRelease;
 const el=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id);};
 const stamp={toMillis:()=>Date.now()+25000};
 let data={status:'waiting',round:0,expiresAt:stamp,deadline:stamp,groups:[],mode:'individual',participants:[]};
 const snapshot=()=>({exists:()=>true,data:()=>data});
 const context={document:{getElementById:el,createElement:element,createTextNode:text=>({textContent:text})},window:{EITA_ANIMALS:[{id:'tigre',label:'Tigre'}],eitaAnimalIcon:()=>element()},URLSearchParams,location:{search:''},db:{},
 identify:async()=> 'aluno-1234',doc:(_parent,...path)=>path.join('/'),getDoc:async()=>{reads++;return {exists:()=>false};},
 onSnapshot(_room,_options,callback){listener=callback;if(cacheFirst)queueMicrotask(()=>callback({exists:()=>false,metadata:{fromCache:true}}));queueMicrotask(()=>callback(snapshot()));return ()=>{unsubscribed++;listener=null;};},
 setDoc:async(path,value)=>{writes.push({path,value});if(path.startsWith('answers')){if(answerFails)throw new Error('offline');await new Promise(resolve=>answerRelease=resolve);}},serverTimestamp:()=>123,
 setInterval:fn=>{timers.set(++timerSeq,fn);return timerSeq;},clearInterval:id=>timers.delete(id),addEventListener:(name,fn)=>events[name]=fn,console};
 vm.runInNewContext(script,context);
 return {el,events,timers,get stats(){return {reads,writes,unsubscribed};},release(){answerRelease();},async join(){el('code').value='123456';el('name').value='Teste';await el('joinOnline').onclick();},emit(patch){data={...data,...patch};listener?.(snapshot());},question(round=1){this.emit({status:'question',round,question:{text:'Teste?',options:['Um','Dois','Três','Quatro']},participants:['aluno-1234']});}};
}
test('entrada reutiliza a primeira notificação da sala e lê só o cadastro do próprio aluno',async()=>{
 const app=setup();await app.join();assert.equal(app.stats.reads,1);assert.equal(app.stats.writes.length,1);assert.equal(app.el('joinPanel').hidden,true);assert.equal(app.timers.size,1);
});
test('resposta tem estado de envio, destaque e confirmação; clique repetido não duplica escrita',async()=>{
 const app=setup();await app.join();app.question();
 const send=app.el('studentAnswers').children[3].onclick();
 assert.match(app.el('studentResult').textContent,/Enviando resposta D/);
 assert.equal(app.el('studentAnswers').children[3].classList.contains('answer-selected'),true);
 await app.el('studentAnswers').children[3].onclick();
 assert.equal(app.stats.writes.length,2);app.release();await send;
 assert.equal(app.el('studentResult').textContent,'Resposta D enviada!');
 app.emit({paused:true});assert.equal(app.el('studentResult').textContent,'Resposta D enviada!');
 app.question(2);assert.equal(app.el('studentAnswers').children[0].disabled,true);
 app.emit({paused:false});assert.equal(app.el('studentAnswers').children[0].disabled,false);
});
test('falha no envio informa o aluno e libera tentativa enquanto o tempo está aberto',async()=>{
 const app=setup({answerFails:true});await app.join();app.question();await app.el('studentAnswers').children[0].onclick();
 assert.match(app.el('studentNotice').textContent,/Resposta não enviada/);assert.equal(app.el('studentAnswers').children[0].disabled,false);
});
test('fechar sala encerra escuta e cronômetro e permite voltar à entrada',async()=>{
 const app=setup();await app.join();app.question();app.emit({status:'closed'});
 assert.equal(app.stats.unsubscribed,1);assert.equal(app.timers.size,0);assert.equal(app.el('studentTimer').textContent,'');assert.equal(app.el('returnToJoin').hidden,false);
 app.el('returnToJoin').onclick();assert.equal(app.el('joinPanel').hidden,false);assert.equal(app.el('joinOnline').disabled,false);
});
test('sair da página desconecta e voltar pelo histórico retoma uma única escuta',async()=>{
 const app=setup();await app.join();app.events.pagehide();assert.equal(app.timers.size,0);assert.equal(app.stats.unsubscribed,1);
 app.events.pageshow({persisted:true});await new Promise(resolve=>setImmediate(resolve));assert.equal(app.timers.size,1);
});

test('entrada aguarda o servidor quando o cache inicial ainda não conhece a sala',async()=>{
 const app=setup({cacheFirst:true});await app.join();assert.equal(app.el('joinPanel').hidden,true);assert.equal(app.stats.reads,1);
});
