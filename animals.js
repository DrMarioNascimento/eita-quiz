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
window.eitaAnimalIcon=function(token){
 const animal=window.eitaAnimal(token);
 const img=document.createElement('img');
 img.className='animal-icon';
 img.alt=animal?animal.label:'';
 img.draggable=false;
 if(animal)img.src=animal.src;
 return img;
};
