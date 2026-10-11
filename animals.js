window.EITA_ANIMALS=[
 {id:'tigre',label:'Tigre',squad:'Tigres',emoji:'🐯',src:'assets/animals/tigre.jpg'},
 {id:'leao',label:'Leão',squad:'Leões',emoji:'🦁',src:'assets/animals/leao.jpg'},
 {id:'leopardo',label:'Leopardo',squad:'Leopardos',emoji:'🐆',src:'assets/animals/leopardo.jpg'},
 {id:'cobra',label:'Cobra',squad:'Cobras',emoji:'🐍',src:'assets/animals/cobra.jpg'},
 {id:'serpente',label:'Serpente',src:'assets/animals/serpente.jpg'},
 {id:'lobo',label:'Lobo',squad:'Lobos',emoji:'🐺',src:'assets/animals/lobo.jpg'},
 {id:'aguia',label:'Águia',squad:'Águias',emoji:'🦅',src:'assets/animals/aguia.jpg'},
 {id:'urso',label:'Urso',squad:'Ursos',emoji:'🐻',src:'assets/animals/urso.jpg'},
 {id:'tubarao',label:'Tubarão',squad:'Tubarões',emoji:'🦈',src:'assets/animals/tubarao.jpg'},
 {id:'crocodilo',label:'Crocodilo',squad:'Crocodilos',emoji:'🐊',src:'assets/animals/crocodilo.jpg'},
 {id:'rinoceronte',label:'Rinoceronte',squad:'Rinocerontes',emoji:'🦏',src:'assets/animals/rinoceronte.jpg'},
 {id:'raposa',label:'Raposa',emoji:'🦊',src:'assets/animals/raposa.jpg'},
 {id:'panda',label:'Panda',emoji:'🐼',src:'assets/animals/panda.jpg'},
 {id:'cachorro',label:'Cachorro',emoji:'🐶',src:'assets/animals/cachorro.jpg'},
 {id:'gato',label:'Gato',emoji:'🐱',src:'assets/animals/gato.jpg'},
 {id:'coelho',label:'Coelho',emoji:'🐰',src:'assets/animals/coelho.jpg'},
 {id:'tartaruga',label:'Tartaruga',emoji:'🐢',src:'assets/animals/tartaruga.jpg'}
];
window.eitaAnimal=function(token){
 if(!token)return null;
 return window.EITA_ANIMALS.find(function(animal){return animal.id===token||animal.emoji===token||animal.src===token;})||null;
};
// Cache one cutout per source. Only white connected to the outer background
// is removed, preserving white fur and highlights inside the animal.
const eitaAnimalCutouts=new Map();
window.eitaAnimalCutout=function(src){
 if(eitaAnimalCutouts.has(src))return eitaAnimalCutouts.get(src);
 const cutout=new Promise(function(resolve){
  const source=new Image();
  source.onload=function(){
   try{
    const canvas=document.createElement('canvas');
    canvas.width=source.naturalWidth;canvas.height=source.naturalHeight;
    const context=canvas.getContext('2d');
    context.drawImage(source,0,0);
    const pixels=context.getImageData(0,0,canvas.width,canvas.height);
    const data=pixels.data,w=canvas.width,h=canvas.height;
    const visited=new Uint8Array(w*h),queue=new Int32Array(w*h);
    let head=0,tail=0;
    function add(index){
     if(visited[index])return;
     visited[index]=1;
     const offset=index*4;
     if(Math.min(data[offset],data[offset+1],data[offset+2])<240)return;
     queue[tail++]=index;
    }
    for(let x=0;x<w;x++){add(x);add((h-1)*w+x);}
    for(let y=0;y<h;y++){add(y*w);add(y*w+w-1);}
    while(head<tail){
     const index=queue[head++],x=index%w,y=Math.floor(index/w);
     data[index*4+3]=0;
     if(x>0)add(index-1);if(x<w-1)add(index+1);
     if(y>0)add(index-w);if(y<h-1)add(index+w);
    }
    context.putImageData(pixels,0,0);
    resolve(canvas.toDataURL('image/png'));
   }catch(error){resolve(src);}
  };
  source.onerror=function(){resolve(src);};
  source.src=src;
 });
 eitaAnimalCutouts.set(src,cutout);
 return cutout;
};
window.eitaAnimalIcon=function(token){
 const animal=window.eitaAnimal(token);
 const img=document.createElement('img');
 img.className='animal-icon';
 img.alt=animal?animal.label:'';
 img.draggable=false;
 if(animal){
  window.eitaAnimalCutout(animal.src).then(function(src){img.src=src;});
 }
 return img;
};
