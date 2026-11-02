// O aluno recebe só a pergunta atual. Gabarito e banco ficam com o professor.
export function questionPayload(question,squads,mode,roster,round,deadline){
 return {status:'question',round,question:{text:question.q,options:question.a},deadline,paused:false,result:null,
  groups:mode==='individual'?[]:squads.map(squad=>({name:squad.name,members:squad.members})),
  mode,participants:roster.map(person=>person.uid)};
}

// Uma transição não pode ultrapassar a anterior numa conexão lenta.
export function createRoomWriter(write){
 let tail=Promise.resolve();
 return {
  send(target,patch,isCurrent=()=>true){
   const next=tail.catch(()=>{}).then(()=>isCurrent()?write(target,typeof patch==='function'?patch():patch):undefined);
   tail=next;
   return next;
  },
  async flush(){await tail.catch(()=>{});}
 };
}
