const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync(new URL('../abertura.js',`file://${__filename}`),'utf8');
function setup({seen=false,blocked=false,playFails=false}={}){
 const events={},overlayEvents={},videoSource={src:null,dataset:{src:'assets/abertura.mp4'},getAttribute(){return this.src;},removeAttribute(){this.src=null;}};
 let plays=0,loads=0,paused=0,removed=false,focused='',remembered=seen;
 const elements={};
 for(const id of ['playIntro','skipIntro','createRoom'])elements[id]={disabled:false,hidden:false,focus(){focused=id;document.activeElement=this;}};
 const background=[{inert:false},{inert:false}];
 elements.introOverlay={remove(){removed=true;},addEventListener(name,handler){overlayEvents[name]=handler;}};
 elements.introVid={pause(){paused++;},load(){loads++;},removeAttribute(){},querySelector(){return videoSource;},querySelectorAll(){return [videoSource];},addEventListener(name,handler){events[name]=handler;},async play(){plays++;if(playFails)throw new Error('autoplay blocked');}};
 const document={getElementById:id=>elements[id],querySelector:selector=>background[selector==='header'?0:1],activeElement:null};
 vm.runInNewContext(source,{document,sessionStorage:{getItem(){if(blocked)throw new Error('denied');return remembered?'1':null;},setItem(){if(blocked)throw new Error('denied');remembered=true;}}});
 return {elements,background,events,overlayEvents,get status(){return {plays,loads,paused,removed,focused,remembered,src:videoSource.src};}};
}
test('abrir e pular não inicia o download do vídeo',()=>{
 const app=setup();assert.equal(app.status.src,null);assert.equal(app.status.plays,0);assert.equal(app.background[0].inert,true);
 app.elements.skipIntro.onclick();assert.equal(app.status.removed,true);assert.equal(app.status.src,null);assert.equal(app.status.remembered,true);assert.equal(app.background[0].inert,false);
});
test('assistir carrega sob demanda; pular para e descarrega',async()=>{
 const app=setup();await app.elements.playIntro.onclick();assert.equal(app.status.src,'assets/abertura.mp4');assert.equal(app.status.plays,1);
 app.elements.skipIntro.onclick();assert.equal(app.status.src,null);assert.equal(app.status.paused,1);assert.equal(app.status.loads,2);
});
test('visita repetida dispensa a abertura sem carregar mídia',()=>{
 const app=setup({seen:true});assert.equal(app.status.removed,true);assert.equal(app.status.plays,0);assert.equal(app.status.src,null);
});
test('armazenamento bloqueado e vídeo recusado não prendem o usuário',async()=>{
 const app=setup({blocked:true,playFails:true});await app.elements.playIntro.onclick();assert.equal(app.elements.playIntro.disabled,false);
 app.elements.skipIntro.onclick();assert.equal(app.status.removed,true);
});
test('Escape encerra; o término natural também libera a interface',()=>{
 const escape=setup();escape.overlayEvents.keydown({key:'Escape',preventDefault(){}});assert.equal(escape.status.removed,true);
 const ended=setup();ended.events.ended();assert.equal(ended.status.removed,true);assert.equal(ended.status.focused,'createRoom');
});
