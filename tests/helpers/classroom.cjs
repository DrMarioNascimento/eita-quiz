const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=fs.readFileSync('student.js','utf8').replace(/^import .*;\n/,'');
function element(){
 const classes=new Set();
 return {children:[],textContent:'',value:'',hidden:false,disabled:false,attributes:{},classList:{add:value=>classes.add(value),contains:value=>classes.has(value)},append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=nodes;},querySelectorAll(){return this.children;},setAttribute(k,v){this.attributes[k]=v;},getAttribute(k){return this.attributes[k]??null;},focus(){}};
}
async function runClassroom(size){
 const listeners=new Map(),members=new Map(),answers=new Map();let reads=0,writes=0,notifications=0;
 const expiry={toMillis:()=>Date.now()+3600000},deadline={toMillis:()=>Date.now()+25000};
 let room={status:'waiting',round:0,expiresAt:expiry,deadline,groups:[],mode:'individual',participants:[]};
 const snap=()=>({metadata:{fromCache:false},exists:()=>true,data:()=>room});
 const broadcast=patch=>{room={...room,...patch};for(const listener of [...listeners.values()]){notifications++;listener(snap());}};
 const clients=Array.from({length:size},(_,i)=>{
  const uid='u'+String(i).padStart(27,'0'),elements=new Map(),timers=new Set();
  const el=id=>{if(!elements.has(id))elements.set(id,element());return elements.get(id);};
  const context={window:{EITA_ANIMALS:[{id:'tigre',label:'Tigre'}],eitaAnimalIcon:element},document:{getElementById:el,createElement:element,createTextNode:text=>({textContent:text})},location:{search:''},URLSearchParams,db:'root',identify:async()=>uid,serverTimestamp:()=>123,
   doc:(parent,...path)=>[parent,...path].join('/'),
   onSnapshot(_room,_options,callback){listeners.set(uid,callback);queueMicrotask(()=>{notifications++;callback(snap());});return ()=>listeners.delete(uid);},
   getDoc:async path=>{reads++;const item=members.get(path);return {exists:()=>!!item,data:()=>item};},
   setDoc:async(path,data)=>{writes++;await new Promise(resolve=>setImmediate(resolve));if(path.includes('/answers/')){assert.equal(answers.has(path),false);answers.set(path,data);}else members.set(path,data);},
   setInterval:fn=>{timers.add(fn);return fn;},clearInterval:fn=>timers.delete(fn),addEventListener(){},console};
  vm.runInNewContext(script,context);el('code').value='123456';el('name').value='Simulado '+(i+1);
  return {uid,el,timers};
 });
 const start=performance.now();await Promise.all(clients.map(client=>client.el('joinOnline').onclick()));
 assert.equal(members.size,size);assert.equal(listeners.size,size);
 broadcast({status:'question',round:1,question:{text:'Qual alternativa?',options:['A','B','C','D']},participants:clients.map(client=>client.uid)});
 await Promise.all(clients.map((client,i)=>client.el('studentAnswers').children[i%4].onclick()));
 assert.equal(answers.size,size);
 for(const [i,client] of clients.entries())assert.equal(client.el('studentResult').textContent,`Resposta ${'ABCD'[i%4]} enviada!`);
 broadcast({paused:true});broadcast({paused:false});
 broadcast({status:'result',question:null,result:{message:'Resultado de teste',explain:'Explicação de teste'}});
 broadcast({status:'closed'});
 assert.equal(listeners.size,0);assert.ok(clients.every(client=>client.timers.size===0));
 return {size,memberReads:reads,totalWrites:writes,answerWrites:answers.size,notifications,activeListenersAfterClose:listeners.size,elapsedLocalMs:Math.round(performance.now()-start)};
}
module.exports={runClassroom};
