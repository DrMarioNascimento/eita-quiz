const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function setup(){
 const elements=new Map();for(const id of ['viewPrepare','viewBattle','menu-entrada','menu-controle'])elements.set(id,{id,open:id==='menu-entrada',attributes:{},events:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.events[k]=fn;}});
 const document={body:{dataset:{}},getElementById:id=>elements.get(id),querySelectorAll:()=>[elements.get('menu-entrada'),elements.get('menu-controle')]};
 let resize=0;const window={dispatchEvent(event){assert.equal(event.type,'resize');resize++;}};
 vm.runInNewContext(fs.readFileSync('workspace.js','utf8'),{document,window,Event:class{constructor(type){this.type=type}}});return {elements,document,window,get resize(){return resize;}};
}
test('Batalha amplia a apresentação e mantém apenas os controles acessíveis',()=>{
 const h=setup();h.elements.get('viewBattle').events.click();assert.equal(h.document.body.dataset.workspace,'batalha');assert.equal(h.elements.get('menu-entrada').open,false);assert.equal(h.elements.get('menu-controle').open,true);assert.equal(h.elements.get('viewBattle').attributes['aria-pressed'],'true');assert.equal(h.resize,1);
});
test('voltar restaura o painel de preparação e suporta idas repetidas',()=>{
 const h=setup();for(let i=0;i<3;i++){h.window.eitaWorkspace.battle();h.window.eitaWorkspace.battle();h.window.eitaWorkspace.prepare();assert.equal(h.elements.get('menu-entrada').open,true);assert.equal(h.elements.get('menu-controle').open,false);assert.equal(h.document.body.dataset.workspace,'preparar');}assert.equal(h.resize,6);
});
